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
    // v4.1 ULTRA-STRICT PROTOCOL
    // Goal: ONLY Mouse, Keyboard, Monitor, Audio, and Physical Hubs.
    // Explicitly REMOVES generic HID, System Devices, and Virtual Drivers.
    let ps_script = r#"
        # 1. Fetch Candidates (Present Only)
        $all = Get-PnpDevice -PresentOnly | Select-Object InstanceId, ParentId, Class, FriendlyName, Status, ConfigManagerErrorCode, HardwareID

        # 2. ULTRA-STRICT FILTERING
        # We only define specific Classes we want.
        
        $cleanList = $all | Where-Object {
            # Must be Healthy
            ($_.ConfigManagerErrorCode -eq 0) -and
            
            (
                # CASE A: Peripherals (Strict Class Match)
                ($_.Class -match '^(Mouse|Keyboard|Monitor|Media)$') -or
                
                # CASE B: Physical Hubs (USB Class + 'Hub' in Name)
                # We exclude "Root Hub" because that's usually the Motherboard controller, user considers that "Host PC".
                # We want external hubs (e.g. "Generic USB Hub", "SuperSpeed Hub").
                (($_.Class -eq 'USB') -and ($_.FriendlyName -match 'Hub') -and ($_.FriendlyName -notmatch 'Root Hub'))
            ) -and

            # CASE C: Audio Filtering (Remove internal/virtual noise)
            # Remove "High Definition Audio" (usually internal/HDMI placeholder) unless specific logic demands.
            # For now, we trust 'Media' class but filter generic "Microsoft" drivers if possible.
            ($_.FriendlyName -notmatch 'NVIDIA High Definition Audio|Microsoft|Virtual|Sonic|Steam')
        }
        
        # 3. Battery Info
        $batteries = Get-CimInstance -ClassName Win32_Battery -ErrorAction SilentlyContinue

        $output = @()
        
        foreach ($dev in $cleanList) {
            $type = "other"
            if ($dev.Class -eq "Mouse") { $type = "mouse" }
            elseif ($dev.Class -eq "Keyboard") { $type = "keyboard" }
            elseif ($dev.Class -eq "Monitor") { $type = "monitor" }
            elseif ($dev.Class -eq "Media") { $type = "audio" }
            elseif ($dev.FriendlyName -match "Hub") { $type = "hub" }

            # Battery Level
            $batLevel = $null
            # (Battery logic preserved but Class 'Battery' was removed from strict list above. 
            #  If user wants UPS, we need to re-add Class 'Battery' to whitelist. 
            #  User asked for Mouse/KB/Audio/Monitor. I will keep Power separate or implicit.)
            
            $output += @{
                InstanceId = $dev.InstanceId
                FriendlyName = $dev.FriendlyName
                Class = $dev.Class
                ParentId = $dev.ParentId
                Status = $dev.Status.ToString()
                DeviceType = $type
                HardwareID = if ($dev.HardwareID) { $dev.HardwareID[0] } else { "" }
                ConfigCode = $dev.ConfigManagerErrorCode
                BatteryLevel = $batLevel
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
