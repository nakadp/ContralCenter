use openrgb::data::Color;
use openrgb::OpenRGB;
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use tauri::command;
use tokio::net::TcpStream;
use tokio::sync::Mutex as AsyncMutex;

type OpenRGBClient = OpenRGB<TcpStream>;

// Global state for Persistent OpenRGB Connection
lazy_static::lazy_static! {
    static ref RGB_CLIENT: Arc<AsyncMutex<Option<Arc<OpenRGBClient>>>> = Arc::new(AsyncMutex::new(None));
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct RGBDevice {
    pub name: String,
    pub index: i32,
    pub modes: Vec<String>,
    pub led_count: usize,
}

async fn get_client() -> Option<Arc<OpenRGBClient>> {
    let mut client_guard = RGB_CLIENT.lock().await;

    if client_guard.is_some() {
        return Some(client_guard.as_ref().unwrap().clone());
    }

    // Attempt to connect if not connected
    // Attempt to connect if not connected
    match OpenRGB::connect().await {
        Ok(client) => {
            println!("Connected to OpenRGB SDK");
            let client_arc = Arc::new(client);
            *client_guard = Some(client_arc.clone());
            Some(client_arc)
        }
        Err(e) => {
            eprintln!("Failed to connect to OpenRGB: {:?}", e);
            None
        }
    }
}

#[command]
pub async fn scan_rgb_devices() -> Vec<RGBDevice> {
    if let Some(client) = get_client().await {
        match client.get_controller_count().await {
            Ok(count) => {
                let mut devices = Vec::new();
                for i in 0..count {
                    if let Ok(controller) = client.get_controller(i).await {
                        let modes = controller.modes.iter().map(|m| m.name.clone()).collect();
                        devices.push(RGBDevice {
                            name: controller.name.clone(),
                            index: i as i32,
                            modes,
                            led_count: controller.leds.len(),
                        });
                    }
                }
                return devices;
            }
            Err(e) => eprintln!("Error getting controller count: {:?}", e),
        }
    } else {
        println!("OpenRGB Client not available");
    }

    // Fallback/Stub if connection fails (for demo purposes if OpenRGB isn't running)
    vec![RGBDevice {
        name: "Emulator/Stub (OpenRGB Offline)".to_string(),
        index: -1,
        modes: vec!["Static".to_string()],
        led_count: 0,
    }]
}

#[command]
pub async fn set_rgb_color(index: i32, r: u8, g: u8, b: u8) -> bool {
    if index < 0 {
        return false; // Ignore stub
    }

    if let Some(client) = get_client().await {
        let color = Color { r, g, b };
        // Determine LED count for the device to set all LEDs
        // Ideally we would cache this, but for now we re-fetch or assume 'all' equivalent api exists.
        // openrgb crate 'update_leds' takes a vector of colors.

        if let Ok(controller) = client.get_controller(index as u32).await {
            let colors = vec![color; controller.leds.len()];
            if let Err(e) = client.update_leds(index as u32, colors).await {
                eprintln!("Failed to update LEDs: {:?}", e);
                return false;
            }
            return true;
        }
    }
    false
}
