# Aether Control Center (Ether Core) - 开发与测试手册

本文档专为开发者和测试人员编写，旨在解释项目的核心功能、代码结构映射、当前实现状态以及如何使用 Dev 模式进行调试。

---

## 🚀 快速启动 (Dev Mode)

本项目采用 **Tauri + React + Vite** 架构。在开发阶段，你需要同时运行前端服务器和 Rust 后端。

### 1. 环境准备
确保已安装：
- **Node.js** (推荐 v20+)
- **Rust** (最新 stable 版)
- **Visual Studio Build Tools** (C++ 桌面开发环境，用于编译 Windows API)
- **OpenRGB** (必须安装并运行 SDK 服务器，默认端口 6742)

### 2. 启动开发环境
在项目根目录打开终端（Powershell 或 VSCode Terminal）：

```bash
# 安装前端依赖
npm install

# 进入开发模式 (同时启动 Front-end HMR 和 Tauri Window)
npm run tauri dev
```

### 3. 调试技巧
- **前端调试**：在 Tauri 窗口中按下 `F12` 或 `Ctrl+Shift+I` 打开开发者工具 (Console, Network, Elements)。所有 `console.log` 都会显示在这里。
- **后端调试**：Rust 的 `println!` 输出会直接显示在启动 `npm run tauri dev` 的终端窗口中。
- **热重载**：
    - 修改 `src/` 下的 TSX/CSS 文件，界面会自动刷新。
    - 修改 `src-tauri/` 下的 RS 文件，Tauri 会自动重新编译并重启应用（稍慢）。

---

## 🗺️ 功能模块与文件映射 (Code Map)

以下是“产品说明书”中定义的五大功能模块对应的代码实现情况及文件位置。

| 优先级 | 功能模块 (Feature) | 核心文件 (Key Files) | 实现状态 (Status) | 备注 (Notes) |
| :--- | :--- | :--- | :--- | :--- |
| **P1** | **本地设备控制** (The Engine) | `src-tauri/src/hardware.rs`<br>`src/components/TopologyMap.tsx`<br>`src/hooks/useHardware.ts` | ✅ **已实现** | 使用 Windows `SetupAPI` 枚举设备，`PnPUtil` 切换开关。需管理员权限运行。 |
| **P2** | **神光同步** (The Glow) | `src-tauri/src/rgb.rs`<br>`src/components/RGBPanel.tsx` | ✅ **已实现** | 依赖 `openrgb` crate。**必须先启动 OpenRGB 软件并开启 SDK Server**。无服务时显示 "Emulator" 模式。 |
| **P3** | **驱动集成** (The Hub) | `src-tauri/src/driver.rs`<br>`src/components/DriverHub.tsx` | ✅ **已实现** | `check_driver_status` 检查进程名；`launch_driver` 调用 exe。目前主要针对 Logitech G Hub。 |
| **P4** | **环境监控** (The Smart Space) | `src-tauri/src/iot.rs`<br>`src/components/IoTMonitor.tsx` | ✅ **已实现** | `rumqttc` 连接 `localhost:1883` 获取 MQTT 数据；`sysinfo` 获取本机 CPU/内存/网络。无 MQTT Broker 时只显示本机数据。 |
| **P5** | **iPad 远程端** (The Remote) | `src-tauri/src/bridge.rs`<br>`ipad-remote/` (文件夹)<br>`src/components/QRCodeDisplay.tsx` | 🚧 **部分实现** | WebSocket Server (`bridge.rs`) 已启动 (Port 8080)。iPad 端代码在 `ipad-remote/`，但目前的双向控制逻辑待完善（仅建立了连接）。 |

---

## 🧪 详细测试指南

### 1. 拓扑图与设备控制 (Topology Map)
*   **如何测试**：
    1.  运行 App。
    2.  观察 "Topology Map" 面板，应显示当前 PC 连接的设备节点（线条会自动布局）。
    3.  **热拔插测试**：插入/拔出一个 USB 设备（如 U 盘或鼠标）。这时候 `hardware.rs` 中的监听器应捕获 `WM_DEVICECHANGE` 消息，界面应自动刷新（无需点击刷新按钮）。 *注：如果自动刷新有延迟，可点击右上角 "Refresh Hardware" 手动触发。*
    4.  **开关测试**：点击连接线末端的设备节点，弹出菜单。尝试点击 "Disable"（禁用）。**注意**：此操作会调用 `pnputil`，需要 App 以**管理员权限**运行才生效，否则终端会报错 "Access Denied"。

### 2. RGB 灯光控制
*   **如何测试**：
    1.  打开 OpenRGB 软件，进入 SDK Server 选项卡，点击 "Start Server"。
    2.  启动本项目。
    3.  在 "RGB Control" 面板，选择一个设备。
    4.  调整颜色圆环或选择 Mode (Pulse/Static/Wave)。
    5.  观察物理硬件的灯光变化。如果未安装 OpenRGB，面板会显示 "Emulator/Stub"，仅供 UI 演示。

### 3. IoT 与系统监控
*   **如何测试**：
    1.  **系统数据**：仪表盘顶部的 CPU、内存、网络上下行速度应每 2 秒跳动一次。你可以打开任务管理器对比数值准确性。
    2.  **传感器数据**：如果你没有本地 MQTT Broker，底部的 "IoT Environment" 面板的 Temp/Humidity 可能显示 0 或默认值。
    3.  **模拟测试**：你可以使用 MQTTfx 或其他工具向 `localhost:1883` 发送 topic `sensor/temp` payload `25.5`，界面应实时更新。

### 4. 驱动程序集成
*   **如何测试**：
    1.  在右下角 "Driver Integration" 面板，查看 "G Hub Status"。
    2.  如果你的电脑运行了 Logitech G Hub，指示灯应为绿色 "Running"。
    3.  点击 "Launch G Hub" 按钮，应能尝试启动该程序（路径硬编码为默认安装路径，如需修改请见 `driver.rs`）。

### 5. iPad 远程连接
*   **如何测试**：
    1.  确保 iPad 和 PC 在**同一局域网**。
    2.  在 iPad 上进入 `ipad-remote` 目录运行 `npm run dev` 并通过 IP 访问（或构建后访问）。或者直接在 PC 浏览器访问 `http://<PC-IP>:8080/ws` 测试连接。
    3.  查看 PC 端终端输出 "iPad Connected!" 即证明 WebSocket 桥接成功。

---

## 🛠️ 项目结构概览

```
f:\ControlCenter\
├── src-tauri\
│   ├── src\
│   │   ├── main.rs      # 入口
│   │   ├── hardware.rs  # 设备枚举与 SetupAPI/PnPUtil 封装
│   │   ├── rgb.rs       # OpenRGB 客户端逻辑
│   │   ├── iot.rs       # MQTT 与 Sysinfo 数据聚合
│   │   ├── driver.rs    # 外部进程管理
│   │   └── bridge.rs    # iPad 通信 WebSocket Server
│   └── Cargo.toml       # Rust 依赖 (windows, openrgb, rumqttc...)
├── src\
│   ├── components\      # React 组件 (TopologyMap, RGBPanel...)
│   ├── hooks\           # Hooks (useHardware...)
│   ├── store.ts         # Zustand 全局状态管理
│   └── index.css        # Tailwind @theme 配置与全局样式
└── ipad-remote\         # 独立的 iPad 端前端项目 (Vite + React)
```

## ⚠️ 常见问题
*   **Error: Access Denied**: 进行设备禁用操作时，必须以**“以管理员身份运行”**启动终端或构建后的 exe。
*   **OpenRGB 连接失败**: 确保 OpenRGB 软件已打开且 SDK Server 正在运行。
*   **界面无波纹/模糊效果**: 确保浏览器/WebView2 支持 Backdrop Filter（现代 Windows 系统默认支持）。
