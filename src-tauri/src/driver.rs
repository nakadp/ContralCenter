use std::process::Command;
use sysinfo::System;
use tauri::command;

#[command]
pub fn check_driver_status(name: String) -> bool {
    let mut sys = System::new_all();
    sys.refresh_processes();

    // Case-insensitive search
    for (_pid, process) in sys.processes() {
        if process.name().to_lowercase().contains(&name.to_lowercase()) {
            return true;
        }
    }
    false
}

#[command]
pub fn launch_driver(path: String) -> bool {
    // "C:\\Program Files\\LGHUB\\lghub.exe"
    match Command::new(path).spawn() {
        Ok(_) => true,
        Err(e) => {
            eprintln!("Failed to launch driver: {:?}", e);
            false
        }
    }
}
