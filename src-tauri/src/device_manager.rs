use serde::Serialize;
#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;
use std::process::Command;

#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "PascalCase")]
pub struct ConnectedDevice {
    pub instance_id: String,
    pub friendly_name: String,
    pub class: String,
    pub parent_id: Option<String>,
    pub status: String,
    pub device_type: String,
    pub hardware_id: String,
    pub config_code: u32,
    pub battery_level: Option<u8>,
}

#[tauri::command]
pub fn get_connected_devices() -> Result<Vec<ConnectedDevice>, String> {
    // v4.1 ULTRA-STRICT PROTOCOL + LOGICAL DE-DUPLICATION
    // Goal: Clean topology by collapsing logical interfaces into physical devices.
    let ps_script = r#"
        # 1. Fetch Candidates (Present Only) with extra properties
        # HardwareID is an array, we select the first one usually. ContainerId is crucial for physical grouping.
        $all = Get-PnpDevice -PresentOnly | Select-Object InstanceId, ParentId, Class, FriendlyName, Status, ConfigManagerErrorCode, HardwareID, Manufacturer, ContainerId

        # 2. PRE-FILTERING (Strict Class List)
        $candidates = $all | Where-Object {
            ($_.ConfigManagerErrorCode -eq 0) -and
            (
                ($_.Class -match '^(Mouse|Keyboard|Monitor|Media)$') -or
                (($_.Class -eq 'USB') -and ($_.FriendlyName -match 'Hub') -and ($_.FriendlyName -notmatch 'Root Hub'))
            )
        }

        # 3. LOGICAL DE-DUPLICATION (Container Grouping)
        # Many physical devices (Keyboards, Mice) expose multiple HID endpoints.
        # They all share the same 'ContainerId'. We must collapse them.
        
        $unique_physical_devices = @()
        $grouped = $candidates | Group-Object ContainerId

        foreach ($group in $grouped) {
            # Skip if ContainerId is null/empty (rare, but treat as individual)
            if (-not $group.Name) {
                $unique_physical_devices += $group.Group
                continue
            }

            # Strategy: Pick the "Best" Representative for this Container
            $devices = $group.Group
            
            # A. If there's only one, keep it.
            if ($devices.Count -eq 1) {
                $unique_physical_devices += $devices[0]
                continue
            }

            # B. Multiple devices in one physical shell. Find the "Real" one.
            # Hierarchy of importance:
            # 1. Non-Microsoft Manufacturer (e.g., "Logitech", "Razer")
            # 2. FriendlyName excludes "HID Keyboard Device"
            # 3. If all else fails, pick the first one.

            $best = $null
            
            # Priority 1: Smart Name (Not generic HID)
            $named = $devices | Where-Object { $_.FriendlyName -notmatch 'HID Keyboard Device|HID-compliant' }
            if ($named) {
                # If multiple smart names, pick first.
                if ($named -is [array]) { $best = $named[0] } else { $best = $named }
            }
            
            # Priority 2: Manufacturer specific (Not Microsoft/Standard)
            if (-not $best) {
                $branded = $devices | Where-Object { $_.Manufacturer -and ($_.Manufacturer -notmatch 'Microsoft|Standard System Devices') }
                if ($branded) {
                    if ($branded -is [array]) { $best = $branded[0] } else { $best = $branded }
                }
            }

            # Priority 3: Fallback (Just take the Main HID interface)
            if (-not $best) {
                $best = $devices[0]
            }
            
            # === SPECIAL OVERRIDE FOR TYPE ===
            # If we collapsed a group and it had a Keyboard, call it a Keyboard even if we picked a Mouse endpoint (combo devices).
            # Simple check: If any in group is Keyboard, force class/type to Keyboard if current is less specific.
            if ($devices.Class -contains 'Keyboard') {
                $best.Class = 'Keyboard' 
            }

            $unique_physical_devices += $best
        }

        # 4. FINAL CLEANUP (Audio & Virtuals)
        $cleanList = $unique_physical_devices | Where-Object {
            # Remove virtual audio endpoints usually associated with Monitros (NVIDIA) or internal
            ($_.FriendlyName -notmatch 'NVIDIA High Definition Audio|Microsoft|Virtual|Sonic|Steam')
        }

        # 5. Output Construction
        $output = @()
        foreach ($dev in $cleanList) {
            $type = "other"
            if ($dev.Class -eq "Mouse") { $type = "mouse" }
            elseif ($dev.Class -eq "Keyboard") { $type = "keyboard" }
            elseif ($dev.Class -eq "Monitor") { $type = "monitor" }
            elseif ($dev.Class -eq "Media") { $type = "audio" }
            elseif ($dev.FriendlyName -match "Hub") { $type = "hub" }

            $hwId = ""
            if ($dev.HardwareID -and $dev.HardwareID.Count -gt 0) {
                $hwId = $dev.HardwareID[0]
            }

            $output += @{
                InstanceId = $dev.InstanceId
                FriendlyName = $dev.FriendlyName
                Class = $dev.Class
                ParentId = $dev.ParentId
                Status = $dev.Status.ToString()
                DeviceType = $type
                HardwareID = $hwId
                ConfigCode = $dev.ConfigManagerErrorCode
                BatteryLevel = $null
            }
        }

        $output | ConvertTo-Json -Depth 3
    "#;

    let mut command = Command::new("powershell");
    command.args(&["-NoProfile", "-Command", ps_script]);

    #[cfg(target_os = "windows")]
    command.creation_flags(0x08000000);

    let output = command.output().map_err(|e| e.to_string())?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    let stdout = String::from_utf8_lossy(&output.stdout);

    if stdout.trim().is_empty() {
        return Ok(Vec::new());
    }

    #[derive(serde::Deserialize, Debug)]
    #[serde(rename_all = "PascalCase")]
    struct PSDevice {
        instance_id: String,
        friendly_name: Option<String>,
        class: String,
        parent_id: Option<String>,
        status: Option<String>,
        device_type: String,
        hardware_id: Option<String>,
        config_code: u32,
        battery_level: Option<u8>,
    }

    let ps_devices: Vec<PSDevice> = serde_json::from_str(&stdout)
        .or_else(|_| serde_json::from_str::<PSDevice>(&stdout).map(|d| vec![d]))
        .map_err(|e| format!("JSON Parse Error: {} Input: {}", e, stdout))?;

    let devices = ps_devices
        .into_iter()
        .map(|d| ConnectedDevice {
            instance_id: d.instance_id,
            friendly_name: d
                .friendly_name
                .unwrap_or_else(|| "Unknown Device".to_string()),
            class: d.class,
            parent_id: d.parent_id,
            status: d.status.unwrap_or("Unknown".to_string()),
            device_type: d.device_type,
            hardware_id: d.hardware_id.unwrap_or_default(),
            config_code: d.config_code,
            battery_level: d.battery_level,
        })
        .collect();

    Ok(devices)
}

#[tauri::command]
pub fn disable_device(instance_id: String) -> Result<String, String> {
    let script = format!(
        "Start-Process powershell -ArgumentList '-NoProfile', '-Command', 'Disable-PnpDevice -InstanceId \"{}\" -Confirm:$false' -Verb RunAs",
        instance_id
    );

    let mut command = Command::new("powershell");
    command.args(&["-NoProfile", "-Command", &script]);

    #[cfg(target_os = "windows")]
    command.creation_flags(0x08000000);

    let output = command.output().map_err(|e| e.to_string())?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    Ok("Disable command sent (User must approve UAC)".to_string())
}
