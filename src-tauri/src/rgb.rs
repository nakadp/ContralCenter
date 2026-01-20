use openrgb::data::Color;
use openrgb::OpenRGB;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tauri::{command, State};
use tokio::net::TcpStream;
use tokio::sync::Mutex;

// Define specific type alias for readability
type OpenRGBClient = OpenRGB<TcpStream>;

// Store the client in Tauri State
pub struct RGBState {
    pub client: Arc<Mutex<Option<OpenRGBClient>>>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct RGBDevice {
    pub name: String,
    pub index: i32,
    pub modes: Vec<String>,
    pub led_count: usize,
}

#[command]
pub async fn connect_rgb(state: State<'_, RGBState>) -> Result<String, String> {
    let mut client_lock = state.client.lock().await;

    // specific address can be made configurable later
    match TcpStream::connect("127.0.0.1:6742").await {
        Ok(stream) => {
            // OpenRGB::new returns a future that performs the handshake
            match OpenRGB::new(stream).await {
                Ok(client) => {
                    *client_lock = Some(client);
                    Ok("Connected to OpenRGB".to_string())
                }
                Err(e) => Err(format!("Failed to handshake with OpenRGB: {:?}", e)),
            }
        }
        Err(e) => Err(format!("Failed to connect to OpenRGB TCP: {}", e)),
    }
}

// Helper to get client from state used by other commands
// OR we just access state directly in commands.

#[command]
pub async fn scan_rgb_devices(state: State<'_, RGBState>) -> Result<Vec<RGBDevice>, String> {
    let client_lock = state.client.lock().await;

    if let Some(client) = client_lock.as_ref() {
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
                return Ok(devices);
            }
            Err(e) => eprintln!("Error getting controller count: {:?}", e),
        }
    } else {
        println!("OpenRGB Client not connected");
    }

    // Fallback/Stub
    Ok(vec![RGBDevice {
        name: "Emulator/Stub (OpenRGB Offline)".to_string(),
        index: -1,
        modes: vec!["Static".to_string()],
        led_count: 0,
    }])
}

#[command]
pub async fn set_rgb_color(
    state: State<'_, RGBState>,
    index: i32,
    r: u8,
    g: u8,
    b: u8,
) -> Result<bool, String> {
    if index < 0 {
        return Ok(false);
    }

    let client_lock = state.client.lock().await;

    if let Some(client) = client_lock.as_ref() {
        let color = Color { r, g, b };
        if let Ok(controller) = client.get_controller(index as u32).await {
            let colors = vec![color; controller.leds.len()];
            if let Err(e) = client.update_leds(index as u32, colors).await {
                eprintln!("Failed to update LEDs: {:?}", e);
                return Ok(false);
            }
            return Ok(true);
        }
    }
    Ok(false)
}
