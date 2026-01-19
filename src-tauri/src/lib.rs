pub mod hardware;
pub mod rgb;
pub mod iot;
pub mod bridge;
pub mod driver;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn get_devices() -> Vec<hardware::DeviceInfo> {
    hardware::enumerate_devices()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:aether.db", vec![
                    tauri_plugin_sql::Migration {
                        version: 1,
                        description: "create_device_aliases",
                        sql: "CREATE TABLE IF NOT EXISTS device_aliases (hardware_id TEXT PRIMARY KEY, alias TEXT, icon TEXT);",
                        kind: tauri_plugin_sql::MigrationKind::Up,
                    }
                ])
                .build(),
        )
        .setup(|app| {
            hardware::start_listener(app.handle().clone());
            bridge::start_server(app.handle().clone());
            iot::start_iot_background_task(app.handle().clone());
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet, 
            get_devices,
            rgb::scan_rgb_devices,
            rgb::set_rgb_color,
            driver::check_driver_status,
            driver::launch_driver,
            hardware::toggle_device,
            hardware::get_local_ip
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
