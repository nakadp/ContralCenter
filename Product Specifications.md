# 个人数字与物理空间指挥中心 | Personal Digital & Physical Command Center
## 技术需求与采购规格书 (Technical Requirements & Procurement Specification)

---

### 一、 产品愿景与设计哲学 | Product Vision & Design Philosophy

**核心目标 (Core Goal):**
打造一个集“底层硬件管理”、“外设生态同步”与“物理环境控制”为一体的极客级指挥终端。
Create a geek-level command terminal that integrates low-level hardware management, peripheral ecosystem synchronization, and physical environment control.

**视觉风格 (Visual Style):**
* **工业赛博 (Industrial Cyber):** 以发光节点和动态数据流向线条构成的拓扑结构。
    * *Topology composed of glowing nodes and dynamic data flow lines.*
* **液态玻璃 (Liquid Glass):** 所有的操作面板和卡片使用高斯模糊、流体折射与边缘高光的拟态质感。
    * *Operation panels and cards featuring Gaussian blur, fluid refraction, and edge-highlighted glassmorphism.*

---

### 二、 功能模块详细规格 | Detailed Functional Specifications

#### 1. 本地设备可视化控制 (P1: Local Device Management)
* **状态监测 (Monitoring):** 自动识别 USB、DisplayPort、HDMI 及扩展坞连接的设备。
    * *Auto-detect devices connected via USB, DP, HDMI, and docking stations.*
* **底层控制 (Low-level Control):** 通过系统 API 实现物理级“禁用/启用”，无需拔插。
    * *Implement physical "Enable/Disable" toggles via System APIs without manual unplugging.*
* **个性化 (Customization):** 支持为每个硬件 ID (VID/PID) 设置自定义图标与名称。
    * *Support custom icons and aliases for each Hardware ID (VID/PID).*

#### 2. 全域神光同步 (P2: Global RGB Sync)
* **品牌破壁 (Cross-brand):** 集成 OpenRGB SDK，统一控制主板、显卡、内存及各品牌外设。
    * *Integrate OpenRGB SDK to unify control over motherboards, GPUs, RAM, and various peripheral brands.*
* **场景联动 (Scene Linkage):** 支持一键切换全屋与桌面的灯光预设。
    * *Support one-click switching of lighting presets for the entire room and desktop.*

#### 3. 驱动集成与快速唤起 (P3: Driver Integration)
* **Logitech G Hub 优化:** 深度调用 SDK 调节 DPI，并支持一键唤起主程序。
    * *Deeply call SDKs for DPI adjustments and support one-click main program activation.*
* **静默管理 (Silent Management):** 监控驱动进程，确保其在需要时后台稳定运行。
    * *Monitor driver processes to ensure stable background operation when needed.*

#### 4. 智能家居与环境监控 (P4: IoT & Environment)
* **协议支持 (Protocols):** 兼容 MQTT、HTTP 与 Home Assistant API。
    * *Compatible with MQTT, HTTP, and Home Assistant APIs.*
* **实时仪表盘 (Real-time Dashboard):** * 展示温度、湿度、$CO_2$ 浓度及电脑实时功耗 ($W$)。
    * *Display Temp, Humidity, $CO_2$ levels, and real-time PC power consumption ($W$).*

#### 5. iPad 原生远程端 (P5: iPad Remote Terminal)
* **跨端通信 (Cross-device):** 基于 WebSocket 的低延迟状态同步。
    * *Low-latency state synchronization based on WebSocket.*
* **原生编译 (Native Build):** 使用 iOS Project Builder for Windows 构建原生 iOS 交互界面。
    * *Build native iOS interfaces using iOS Project Builder for Windows.*

---

### 三、 硬件采购清单与方案推荐 | Hardware Procurement & Recommendations

为了实现上述功能，您需要根据不同预算选择合适的硬件组件。

#### 1. IoT 控制核心 (Wi-Fi 发信器/网关)
| 方案 | 设备推荐 | 估算价 | 特点 |
| :--- | :--- | :--- | :--- |
| **入门/极客 (DIY)** | **ESP32 开发板** | ~¥30 / $5 | 需要一定动手能力，自由度最高，完全自主控制协议。 |
| **性价比 (Balanced)** | **Broadlink (博联) RM4 Pro** | ~¥180 / $25 | 支持红外+射频，可控传统空调、风扇，API 较为成熟。 |
| **旗舰/全能 (Premium)** | **Aqara (绿米) M3 网关** | ~¥600 / $80 | 支持 Matter 协议，对 iPad (Apple Home) 支持极佳，稳定性极高。 |

#### 2. 环境传感器 (Sensors)
| 类型 | 推荐型号 | 监控指标 | 推荐理由 |
| :--- | :--- | :--- | :--- |
| **温湿度** | **米家 Bluetooth 3.0** | 温度/湿度 | 便宜、美观，可通过蓝牙网关轻松接入 PC。 |
| **空气质量** | **青萍 (Qingping) 检测仪** | $CO_2$/PM2.5/VOC | 工业级传感器精度，具有非常现代的 UI，适合作为桌面摆件。 |
| **电力监测** | **TP-Link Kasa / 涂鸦智能插座** | 实时功率 ($W$)/电流 | 支持 Wi-Fi 协议，可直接读取电脑整机功耗。 |

#### 3. 推荐配置组合 (Suggested Bundles)
* **性价比玩家:** ESP32 + 米家传感器 + 博联 RM4 (推荐作为第一阶段尝试)。
* **追求极致体验:** Home Assistant (运行在 PC 或树莓派) + Aqara M3 + 青萍空气监测仪。

---

### 四、 核心技术栈确认 | Technical Stack Confirmation

* **PC Backend:** Rust (Tauri) - *High performance & Low-level API access.*
* **Frontend:** React + Tailwind CSS + Framer Motion - *Cyber-Glass UI animations.*
* **Mobile:** Swift (via iOS Project Builder) - *Native iPad experience.*
* **Communication:** WebSocket (PC-to-iPad), MQTT (PC-to-IoT).

---
这份说明书旨在汇总并确认我们即将开发的“个人数字与物理空间指挥中心”的核心需求。请你审阅，这不仅是我的理解记录，也将作为后续我为 `antigravity` 编写开发 Prompt 的底层逻辑。

---

## 🛠️ 产品全维度设计规格说明书

### 一、 核心视觉与交互语言 (The Cyber-Glass Aesthetic)

我们将界面设计定义为**“工业赛博 (Industrial Cyber)”**与**“液态玻璃 (Liquid Glass)”**的融合体。

* **视觉基调：**
* **背景：** 深邃的哑光碳素黑，带有微弱的网格扫描线。
* **拓扑结构：** 界面中心为“主机核心”，向四周延伸出半透明的发光数据线（Data Bus），连接各设备节点。
* **节点状态：** 设备连接时，节点图标点亮，线条呈现脉冲电流动效；禁用或断开时，线条断裂，图标呈现灰色故障风。


* **交互组件：**
* **卡片设计：** 所有的设置菜单和详细信息采用**液态玻璃材质**——极高的毛玻璃模糊（Backdrop Blur）、灵动的边缘折射光泽，以及悬停时的流体波动感。
* **操作反馈：** 点击开关时，伴随轻微的机械音效或触感反馈（iPad端），并有霓虹灯色彩的渐变切换。



---

### 二、 功能模块与优先级逻辑 (Functional Roadmap)

#### **Priority 1: 本地设备控制 (The Engine)**

* **可视化控制：** 提供一个类似“仪表盘”的界面，通过图形化开关启用/禁用扩展坞及接口上的硬件（鼠标、键盘、显示器、移动硬盘、光驱等）。
* **自动识别：** 实时监听系统硬件变动。新设备接入时，弹出液态玻璃通知框，询问是否为其分配自定义名称和图标。
* **持久化存储：** 记录用户对每个硬件 ID (VID/PID) 的个性化备注，即使更换接口也能精准识别。

#### **Priority 2: 神光同步 (The Glow)**

* **全域控制：** 集成 **OpenRGB SDK**，打破品牌壁垒，实现主板、显卡、外设的一键色彩联动。
* **预设场景：** 支持“工作模式（暖白）”、“观影模式（暗红）”、“极客模式（赛博蓝紫）”等场景的快速切换。

#### **Priority 3: 驱动集成与快速唤起 (The Hub)**

* **罗技专项优化：** 通过 **Logitech SDK** 直接在控制台修改 DPI 或宏设定。
* **一键触达：** 在控制面板中集成 G Hub 的快速唤起按钮，并支持后台静默监控其运行状态。

#### **Priority 4: 智能家居与环境监控 (The Smart Space)**

* **家电控制：** 通过 Wi-Fi 发信器（MQTT/API）控制空调、电灯、加湿器、风扇。
* **传感器仪表盘：** * **物理环境：** 实时展示温度、湿度、二氧化碳浓度。
* **系统性能：** 实时展示电脑耗电量、上下行网速。
* **历史统计：** 提供液态玻璃质感的数据统计图表，预览历史趋势。



#### **Priority 5: iPad 远程端 (The Remote)**

* **全功能镜像：** 使用 **iOS Project Builder for Windows** 开发原生 iPad 应用。
* **实时同步：** iPad 作为副屏或远程遥控器，通过 WebSocket 与 PC 端通信，实现布局和控制状态的完全同步。

---

### 三、 核心技术栈确认 (Tech Stack)

| 维度 | 技术选型 | 作用 |
| --- | --- | --- |
| **应用外壳** | **Tauri (Rust)** | 负责底层硬件 API 调用、系统级权限管理及跨平台分发。 |
| **前端界面** | **React + Tailwind CSS** | 构建复杂的赛博朋克 UI 与液态玻璃动效。 |
| **硬件协议** | **SetupAPI (Windows) + OpenRGB** | 实现设备禁用/启用逻辑与 RGB 控制。 |
| **数据通信** | **MQTT / WebSocket** | 负责 IoT 设备连接及 iPad 与 PC 的实时同步。 |
| **编译环境** | **iOS Project Builder** | 在 Windows 下完成 iPad 端的打包与部署。 |

---

### 四、 用户操作路径示例

1. **接入设备：** 你插上一个新的 RGB 鼠标垫。
2. **视觉反馈：** 控制台中间的线条流向一个新的节点，节点闪烁并点亮。
3. **个性化：** 你点击该节点，弹出液态玻璃卡片，将其重命名为“桌面氛围 A”，并直接调节其颜色。
4. **iPad 联动：** 你躺在椅子上，拿起 iPad，在同样的 UI 界面上一键关闭了空调并禁用了刚才的鼠标垫。

---

**请确认以上信息是否完全符合你的构思？**

* **如果符合：** 请告诉我，我将立刻开始为你准备第一阶段（本地设备控制 + UI 框架）给 `antigravity` 的开发 Prompt。
* **如果有偏差：** 请指出需要修改或增减的细节。