use nvml_wrapper::Nvml;
use serde::Serialize;
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;
use sysinfo::{Components, Networks, System};
use tauri::{AppHandle, Emitter, Manager, Runtime};

#[derive(Serialize, Clone)]
pub struct SystemStats {
    cpu_usage: f32,
    cpu_temp: f32,
    gpu_usage: f32,
    gpu_temp: f32,
    net_down: u64,
    net_up: u64,
}

pub struct SystemMonitorState {
    pub system: Arc<Mutex<System>>,
    pub networks: Arc<Mutex<Networks>>,
    pub components: Arc<Mutex<Components>>,
    pub nvml: Arc<Mutex<Option<Nvml>>>,
}

impl SystemMonitorState {
    pub fn new() -> Self {
        let nvml = match Nvml::init() {
            Ok(n) => Some(n),
            Err(e) => {
                eprintln!("Failed to initialize NVML: {}", e);
                None
            }
        };

        Self {
            system: Arc::new(Mutex::new(System::new_all())),
            networks: Arc::new(Mutex::new(Networks::new_with_refreshed_list())),
            components: Arc::new(Mutex::new(Components::new_with_refreshed_list())),
            nvml: Arc::new(Mutex::new(nvml)),
        }
    }
}

pub fn start_monitoring<R: Runtime>(app: &AppHandle<R>) {
    let app_handle = app.clone();
    let state = app.state::<SystemMonitorState>();

    // Clone Arcs for the thread
    let system = state.system.clone();
    let networks = state.networks.clone();
    let components = state.components.clone();
    let nvml = state.nvml.clone();

    thread::spawn(move || {
        loop {
            // Sleep to achieve exactly 1Hz refresh rate
            thread::sleep(Duration::from_millis(1000));

            // 1. CPU
            // Task Manager often shows "Processor Utility" which can be >100% of base freq time.
            // sysinfo shows "Processor Time". To visually align, we scale by a factor (e.g. 1.1).
            let mut cpu_usage = 0.0;
            if let Ok(mut sys) = system.lock() {
                sys.refresh_cpu();
                cpu_usage = sys.global_cpu_info().cpu_usage() * 1.1;
                if cpu_usage > 100.0 {
                    cpu_usage = 100.0;
                }
            }

            // 2. Components
            let mut cpu_temp = 0.0;
            // Scan components less frequently? No, 1Hz is fine.
            if let Ok(mut comps) = components.lock() {
                comps.refresh_list();
                for comp in comps.iter_mut() {
                    comp.refresh();
                }
                for component in comps.iter() {
                    let label = component.label().to_lowercase();
                    if label.contains("cpu") || label.contains("package id 0") {
                        if cpu_temp == 0.0 || component.temperature() > cpu_temp {
                            cpu_temp = component.temperature();
                        }
                    }
                }
            }

            // 3. GPU
            let mut gpu_usage = 0.0;
            let mut gpu_temp = 0.0;
            if let Ok(nvml_guard) = nvml.lock() {
                if let Some(nvml) = &*nvml_guard {
                    if let Ok(device) = nvml.device_by_index(0) {
                        if let Ok(util) = device.utilization_rates() {
                            gpu_usage = util.gpu as f32;
                        }
                        if let Ok(temp) = device.temperature(
                            nvml_wrapper::enum_wrappers::device::TemperatureSensor::Gpu,
                        ) {
                            gpu_temp = temp as f32;
                        }
                    }
                }
            }

            // 4. Network
            let mut net_down = 0;
            let mut net_up = 0;
            if let Ok(mut nets) = networks.lock() {
                nets.refresh();
                for (_name, network) in nets.iter() {
                    net_down += network.received();
                    net_up += network.transmitted();
                }
            }

            let stats = SystemStats {
                cpu_usage,
                cpu_temp,
                gpu_usage,
                gpu_temp,
                net_down,
                net_up,
            };

            // Emit event
            let _ = app_handle.emit("system-stats", stats);
        }
    });
}
