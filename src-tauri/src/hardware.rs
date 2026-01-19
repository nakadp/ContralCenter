use serde::Serialize;
use tauri::{AppHandle, Manager};
use windows::core::{PCWSTR, PSTR};
use windows::Win32::Devices::DeviceAndDriverInstallation::{
    SetupDiEnumDeviceInfo, SetupDiGetClassDevsW, SetupDiGetDeviceRegistryPropertyW,
    DIGCF_ALLCLASSES, DIGCF_PRESENT, SPDRP_DEVICEDESC, SPDRP_FRIENDLYNAME, SPDRP_HARDWAREID,
    SP_DEVINFO_DATA,
};

#[derive(Serialize, Clone, Debug)]
pub struct DeviceInfo {
    pub name: String,
    pub id: String,
    pub class: String,
}

pub fn enumerate_devices() -> Vec<DeviceInfo> {
    let mut devices = Vec::new();

    unsafe {
        // Get device info set for all present devices
        let dev_info_set =
            SetupDiGetClassDevsW(None, PCWSTR::null(), None, DIGCF_PRESENT | DIGCF_ALLCLASSES);

        if let Ok(handle) = dev_info_set {
            let mut dev_info_data = SP_DEVINFO_DATA {
                cbSize: std::mem::size_of::<SP_DEVINFO_DATA>() as u32,
                ..Default::default()
            };

            let mut i = 0;
            while SetupDiEnumDeviceInfo(handle, i, &mut dev_info_data).is_ok() {
                let name = get_device_property(handle, &mut dev_info_data, SPDRP_FRIENDLYNAME)
                    .or_else(|| get_device_property(handle, &mut dev_info_data, SPDRP_DEVICEDESC))
                    .unwrap_or_else(|| "Unknown Device".to_string());

                let id = get_device_property(handle, &mut dev_info_data, SPDRP_HARDWAREID)
                    .unwrap_or_else(|| format!("UNK_{}", i));

                // Filter for interesting devices (e.g. USB) to reduce noise, or keep all
                // For now, let's keep it broad but maybe filter empty names
                if name != "Unknown Device" {
                    devices.push(DeviceInfo {
                        name,
                        id,
                        class: "Generic".to_string(), // Todo: Get actual class
                    });
                }

                i += 1;
            }
            // SetupDiDestroyDeviceInfoList(handle); // Windows crate generic handle might need manual close or wrapper?
            // The handle from SetupDiGetClassDevsW should be closed with SetupDiDestroyDeviceInfoList
            // But windows crate Handle might drop it? Let's check docs or assume unsafe raw calls need manual cleanup.
            let _ =
                windows::Win32::Devices::DeviceAndDriverInstallation::SetupDiDestroyDeviceInfoList(
                    handle,
                );
        }
    }

    devices
}

unsafe fn get_device_property(
    handle: windows::Win32::Devices::DeviceAndDriverInstallation::HDEVINFO,
    dev_info_data: &mut SP_DEVINFO_DATA,
    property: u32,
) -> Option<String> {
    let mut buffer = [0u8; 1024];
    let mut required_size = 0;

    // First call to get size? Or just try with large buffer.
    // SPDRP returns REG_SZ usually.

    if SetupDiGetDeviceRegistryPropertyW(
        handle,
        dev_info_data,
        property,
        None,
        Some(&mut buffer),
        Some(&mut required_size),
    )
    .is_ok()
    {
        // Convert WCHAR buffer to String
        // Required size is in bytes? Yes.
        let len = required_size as usize / 2;
        let u16_slice = std::slice::from_raw_parts(buffer.as_ptr() as *const u16, len);
        // Trim null terminator
        let trimmed = if let Some(last) = u16_slice.last() {
            if *last == 0 {
                &u16_slice[..len - 1]
            } else {
                u16_slice
            }
        } else {
            u16_slice
        };

        String::from_utf16(trimmed).ok()
    } else {
        None
    }
}

use std::sync::Once;
use tauri::Emitter;
use windows::core::w;
use windows::Win32::Foundation::{HWND, LPARAM, LRESULT, WPARAM};
use windows::Win32::UI::WindowsAndMessaging::{
    CreateWindowExW, DefWindowProcW, DispatchMessageW, GetMessageW, RegisterClassW,
    TranslateMessage, CS_HREDRAW, CS_VREDRAW, CW_USEDEFAULT, HMENU, MSG, WINDOW_EX_STYLE,
    WM_DEVICECHANGE, WNDCLASSW, WS_OVERLAPPEDWINDOW,
};

static REGISTER_WINDOW_CLASS: Once = Once::new();
static mut WINDOW_CLASS_ATOM: u16 = 0;

pub fn start_listener(app: AppHandle) {
    std::thread::spawn(move || unsafe {
        let instance = windows::Win32::System::LibraryLoader::GetModuleHandleW(None).unwrap();
        let instance_hinstance = windows::Win32::Foundation::HINSTANCE(instance.0);
        let class_name = w!("DeviceListenerClass");

        REGISTER_WINDOW_CLASS.call_once(|| {
            let wnd_class = WNDCLASSW {
                style: CS_HREDRAW | CS_VREDRAW,
                lpfnWndProc: Some(window_proc),
                hInstance: instance_hinstance,
                lpszClassName: class_name,
                ..Default::default()
            };
            WINDOW_CLASS_ATOM = RegisterClassW(&wnd_class);
        });

        let hwnd = CreateWindowExW(
            WINDOW_EX_STYLE::default(),
            class_name,
            w!("DeviceListenerWindow"),
            WS_OVERLAPPEDWINDOW,
            CW_USEDEFAULT,
            CW_USEDEFAULT,
            CW_USEDEFAULT,
            CW_USEDEFAULT,
            HWND::default(),
            HMENU::default(),
            instance_hinstance,
            Some(Box::into_raw(Box::new(app)) as *const _),
        );

        let mut msg = MSG::default();
        while GetMessageW(&mut msg, hwnd, 0, 0).as_bool() {
            TranslateMessage(&msg);
            DispatchMessageW(&msg);
        }
    });
}

unsafe extern "system" fn window_proc(
    hwnd: HWND,
    msg: u32,
    wparam: WPARAM,
    lparam: LPARAM,
) -> LRESULT {
    if msg == WM_DEVICECHANGE {
        // Retrieve AppHandle from GWLP_USERDATA if stored, or use a global mechanism.
        // For simplicity in this specialized thread, we can reconstruct or pass context.
        // Actually, CreateWindowEx lpParam is passed to WM_CREATE, where we can store it.
        // But for quick "Cyber-Glass" prototype, let's just use a broadcast approach or
        // simpler: The pointer passed in CreateWindowEx is available in WM_CREATE.

        // Let's get the AppHandle. Since this is static/global wndproc, extracting state is tricky without
        // SetWindowLongPtr. Let's do it properly-ish.
        if wparam.0 == 0x0007 { // DBT_DEVNODES_CHANGED
             // Notify frontend to refresh
             // We need the app handle here.
             // Ideally we store it in SetWindowLongPtr(hwnd, GWLP_USERDATA, ...)
        }
    }

    // Recovery of AppHandle strategy:
    // In WM_CREATE, lparam is CREATESTRUCT, which contains lpCreateParams.
    if msg == windows::Win32::UI::WindowsAndMessaging::WM_CREATE {
        use windows::Win32::UI::WindowsAndMessaging::{
            SetWindowLongPtrW, CREATESTRUCTW, GWLP_USERDATA,
        };
        let create_struct = lparam.0 as *const CREATESTRUCTW;
        let app_ptr = (*create_struct).lpCreateParams;
        SetWindowLongPtrW(hwnd, GWLP_USERDATA, app_ptr as isize);
    }

    if msg == WM_DEVICECHANGE {
        use windows::Win32::UI::WindowsAndMessaging::{GetWindowLongPtrW, GWLP_USERDATA};
        let ptr = GetWindowLongPtrW(hwnd, GWLP_USERDATA);
        if ptr != 0 {
            let app = &*(ptr as *const AppHandle);
            // 0x0007 is DBT_DEVNODES_CHANGED
            if wparam.0 == 0x0007 {
                let _ = app.emit("device-change", "refresh");
            }
        }
    }

    DefWindowProcW(hwnd, msg, wparam, lparam)
}

#[tauri::command]
pub fn toggle_device(id: String, enable: bool) -> Result<String, String> {
    // Safety Check: Prevent disabling critical devices
    // In a real scenario, we would check the device ClassGUID.
    // For now, we use a simple string heuristic on the ID or assume the frontend did the first pass check.
    // BUT the backend must be the final authority.

    // Todo: lookup class from id. For now valid.

    // Implementation using PnPUtil logic or SetupDi
    // Since complex SetupDi logic is verbose, we will placeholder the actual WINAPI call
    // with a printed confirmation for the "Walkthrough" stage unless specific crate features are enabled.
    // However, the user asked for "The Action Logic".

    println!("HARDWARE_ACTION: Device {} -> State: {}", id, enable);

    // Safety Logic (Redundant check)
    if id.to_lowercase().contains("root") || id.to_lowercase().contains("system") {
        return Err("CRITICAL_DENIED: Cannot disable System Root device.".to_string());
    }

    // Use PnPUtil to toggle device
    // Requires Admin privileges
    let action = if enable {
        "/enable-device"
    } else {
        "/disable-device"
    };

    // Using std::process::Command to invoke pnputil
    // We suppress output to avoid console spam, but capture error if any.
    let output = std::process::Command::new("pnputil")
        .args([action, &id])
        .output()
        .map_err(|e| format!("Failed to execute pnputil: {}", e))?;

    if output.status.success() {
        Ok(if enable {
            "Enabled".to_string()
        } else {
            "Disabled".to_string()
        })
    } else {
        let err_msg = String::from_utf8_lossy(&output.stderr);
        // Fallback: sometimes stdout has the error for pnputil
        let out_msg = String::from_utf8_lossy(&output.stdout);
        Err(format!("Action Failed: {} {}", err_msg, out_msg))
    }
}

#[tauri::command]
pub fn get_local_ip() -> String {
    local_ip_address::local_ip()
        .map(|ip| ip.to_string())
        .unwrap_or_else(|_| "127.0.0.1".to_string())
}
