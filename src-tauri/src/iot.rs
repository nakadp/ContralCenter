use rumqttc::{AsyncClient, Event, MqttOptions, Packet, Qos};
use serde::Serialize;
use std::sync::{Arc, Mutex};
use std::time::Duration;
use sysinfo::{Networks, System};
use tauri::{command, AppHandle, Emitter};
use tokio::task;

#[derive(Serialize, Debug, Clone)]
pub struct TelemetryData {
    pub temperature: f32, // From MQTT (Sensor)
    pub humidity: f32,    // From MQTT (Sensor)
    pub power: f32,       // From MQTT (Sensor)
    pub cpu_load: f32,    // Local
    pub memory_load: u64, // Local (Used in GB or %)
    pub net_up: u64,      // Local (Bytes)
    pub net_down: u64,    // Local (Bytes)
}

// Shared state to hold latest MQTT values
struct MqttState {
    temp: f32,
    humidity: f32,
    power: f32,
}

lazy_static::lazy_static! {
    static ref MQTT_STORE: Arc<Mutex<MqttState>> = Arc::new(Mutex::new(MqttState {
        temp: 0.0,
        humidity: 0.0,
        power: 0.0,
    }));
}

#[command]
pub fn start_iot_background_task(app: AppHandle) {
    // 1. Start MQTT Task
    let mut mqttoptions = MqttOptions::new("aether-pc-client", "localhost", 1883);
    mqttoptions.set_keep_alive(Duration::from_secs(5));

    let (mut client, mut connection) = AsyncClient::new(mqttoptions, 10);

    // Spawn MQTT Event Loop
    task::spawn(async move {
        // Subscribe to topics
        client.subscribe("sensor/temp", Qos::AtMostOnce).await.ok();
        client
            .subscribe("sensor/humidity", Qos::AtMostOnce)
            .await
            .ok();
        client.subscribe("sensor/power", Qos::AtMostOnce).await.ok();

        loop {
            // Poll MQTT
            if let Ok(notification) = connection.poll().await {
                if let Event::Incoming(Packet::Publish(publish)) = notification {
                    let payload = String::from_utf8_lossy(&publish.payload);
                    let val: f32 = payload.parse().unwrap_or(0.0);

                    let mut store = MQTT_STORE.lock().unwrap();
                    match publish.topic.as_str() {
                        "sensor/temp" => store.temp = val,
                        "sensor/humidity" => store.humidity = val,
                        "sensor/power" => store.power = val,
                        _ => {}
                    }
                }
            }
            // Add slight delay to prevent tight loop if disconnected
            // functionality handled by `poll` usually but good practice to be safe or rely on poll blocking.
            // rumqttc poll blocks, so no sleep needed here.
        }
    });

    // 2. Start Combined Telemetry Loop (Local + MQTT)
    let app_handle = app.clone();
    task::spawn(async move {
        let mut sys = System::new_all();
        let mut networks = Networks::new_with_refreshed_list();

        loop {
            tokio::time::sleep(Duration::from_secs(2)).await;

            // Refresh Sysinfo
            sys.refresh_cpu();
            sys.refresh_memory();
            networks.refresh();

            // Calculate CPU Load (Global avg)
            let cpu_load = sys.global_cpu_info().cpu_usage();

            // Memory
            let memory_used = sys.used_memory();

            // Network (Sum of all interfaces)
            let mut total_up = 0;
            let mut total_down = 0;
            for (_, network) in &networks {
                total_up += network.transmitted();
                total_down += network.received();
            }

            // Get MQTT Data
            let (temp, humidity, power) = {
                let store = MQTT_STORE.lock().unwrap();
                (store.temp, store.humidity, store.power)
            };

            let data = TelemetryData {
                temperature: temp,
                humidity,
                power,
                cpu_load,
                memory_load: memory_used,
                net_up: total_up,
                net_down: total_down,
            };

            // Emit Event
            if let Err(e) = app_handle.emit("iot-data", &data) {
                eprintln!("Failed to emit iot-data: {:?}", e);
            }
        }
    });
}
