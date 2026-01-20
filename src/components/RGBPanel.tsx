import { invoke } from "@tauri-apps/api/core";
import { useState, useEffect } from "react";
import { Card } from "./Card";

export function RGBPanel() {
    const [color, setColor] = useState({ r: 0, g: 242, b: 255 }); // Default Cyan
    const [brightness, setBrightness] = useState(100);
    const [rgbDevices, setRgbDevices] = useState<{ name: string, index: number, led_count: number }[]>([]);

    useEffect(() => {
        const initRGB = async () => {
            try {
                await invoke("connect_rgb");
                const devs = await invoke<{ name: string, index: number, led_count: number }[]>("scan_rgb_devices");
                setRgbDevices(devs);
            } catch (e) {
                console.warn("OpenRGB connect failed:", e);
            }
        };
        initRGB();
    }, []);

    const handleWheelClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        // 模拟取色逻辑 (实际开发建议使用 HSL 转换)
        if (x > 0 && y < 0) setColor({ r: 255, g: 0, b: 229 }); // Magenta
        else if (x < 0 && y < 0) setColor({ r: 34, g: 197, b: 94 }); // Green
        else if (x > 0 && y > 0) setColor({ r: 59, g: 130, b: 246 }); // Blue
        else setColor({ r: 0, g: 242, b: 255 }); // Cyan

        applyColor();
    };

    const applyColor = async () => {
        try {
            for (const dev of rgbDevices) {
                await invoke("set_rgb_color", { index: dev.index, r: color.r, g: color.g, b: color.b });
            }
        } catch (e) {
            console.error("Failed to set RGB", e);
        }
    };

    return (
        <Card className="flex flex-col p-4 gap-4 bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl shadow-2xl relative overflow-hidden group">
            {/* 1. 内部标题 */}
            <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest border-b border-white/5 pb-2">
                RGB Control
            </div>

            <div className="flex flex-row items-center gap-6">
                {/* 2. 左侧：增强型色轮 */}
                <div
                    className="w-28 h-28 shrink-0 rounded-full p-1 relative cursor-crosshair group/wheel transition-transform duration-500 hover:scale-105"
                    onClick={handleWheelClick}
                >
                    {/* 彩虹外环 */}
                    <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,#ff0000,#ffff00,#00ff00,#00ffff,#0000ff,#ff00ff,#ff0000)] opacity-90 shadow-[0_0_20px_rgba(0,0,0,0.5)]" />

                    {/* 内部遮罩 - 营造环形感 */}
                    <div className="absolute inset-[12%] rounded-full bg-[#0d0d0d] shadow-inner border border-white/5" />

                    {/* 中心发光球体 */}
                    <div className="absolute inset-0 m-auto w-[40%] h-[40%] rounded-full bg-black/80 flex items-center justify-center border border-white/10 shadow-[0_0_30px_rgba(0,0,0,1)]">
                        <div
                            className="w-[70%] h-[70%] rounded-full transition-all duration-700 blur-[2px]"
                            style={{
                                backgroundColor: `rgb(${color.r},${color.g},${color.b})`,
                                boxShadow: `0 0 15px rgb(${color.r},${color.g},${color.b}, 0.6)`
                            }}
                        />
                    </div>

                    {/* 选中色块的小圆点 (Indicator) */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-[0_0_10px_white] z-20" />
                </div>

                {/* 3. 右侧：控制控件 */}
                <div className="flex-1 flex flex-col gap-4 min-w-0">

                    {/* 亮度调节 */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center px-0.5">
                            <span className="text-[9px] text-white/50 uppercase tracking-tighter">Brightness</span>
                            <span className="text-[10px] font-mono text-accent-cyan">{brightness}%</span>
                        </div>
                        <div className="h-[4px] w-full bg-white/5 rounded-full relative group cursor-pointer overflow-hidden">
                            <input
                                type="range"
                                min="0" max="100"
                                value={brightness}
                                onChange={(e) => setBrightness(parseInt(e.target.value))}
                                className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer"
                            />
                            {/* 滑块激活槽 */}
                            <div
                                className="h-full bg-gradient-to-r from-accent-cyan/40 to-accent-cyan shadow-[0_0_10px_#00f2ff] transition-all duration-300 relative"
                                style={{ width: `${brightness}%` }}
                            />
                        </div>
                    </div>

                    {/* 模式选择 */}
                    <div className="space-y-1.5">
                        <span className="text-[9px] text-white/50 uppercase tracking-tighter">Mode</span>
                        <div className="relative group">
                            <select className="w-full bg-black/40 border border-white/10 hover:border-accent-cyan/30 rounded-lg text-[10px] text-white/90 px-3 py-2 outline-none appearance-none font-mono tracking-wide transition-all uppercase cursor-pointer">
                                <option>Static</option>
                                <option>Breathing</option>
                                <option selected>Pulse</option>
                                <option>Cycle</option>
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-accent-cyan/60 group-hover:text-accent-cyan text-[8px]">▼</div>
                        </div>
                    </div>

                </div>
            </div>

            {/* 装饰性背景：角落微光 */}
            <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-accent-cyan/5 blur-[40px] rounded-full pointer-events-none" />
        </Card>
    );
}
