import { invoke } from "@tauri-apps/api/core";
import { useState, useEffect } from "react";
import { Card } from "./Card";

export function RGBPanel() {
    const [color, setColor] = useState({ r: 0, g: 242, b: 255 }); // Default Cyan
    const [brightness, setBrightness] = useState(100);
    const [rgbDevices, setRgbDevices] = useState<{ name: string, index: number, led_count: number }[]>([]);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        const initRGB = async () => {
            try {
                await invoke("connect_rgb");
                setConnected(true);
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

        // Simple distinct logic based on quadrants for demo
        if (x > 0 && y < 0) setColor({ r: 255, g: 0, b: 229 }); // Magenta
        else if (x < 0 && y < 0) setColor({ r: 34, g: 197, b: 94 }); // Green
        else if (x > 0 && y > 0) setColor({ r: 59, g: 130, b: 246 }); // Blue
        else setColor({ r: 0, g: 242, b: 255 }); // Cyan

        applyColor();
    };

    const applyColor = async () => {
        try {
            // Apply to all found devices
            for (const dev of rgbDevices) {
                await invoke("set_rgb_color", { index: dev.index, r: color.r, g: color.g, b: color.b });
            }
            // Also fall back to single call if needed or simplified
            // await invoke("set_rgb_color", { index: 0, r: color.r, g: color.g, b: color.b });
        } catch (e) {
            console.error("Failed to set RGB", e);
        }
    };

    return (
        <Card className="flex flex-col p-4 gap-3 relative overflow-hidden border-white/10 bg-white/5 h-full">
            <div className="absolute inset-0 bg-gradient-to-b from-accent-cyan/5 to-transparent pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between z-10 shrink-0">
                <div className="text-[clamp(9px,0.7vw,11px)] font-bold text-white/50 tracking-[0.2em] uppercase">RGB Control</div>
                <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_8px] transition-colors ${connected ? 'bg-accent-cyan shadow-[#00F2FF]' : 'bg-red-500 shadow-red-500'}`} />
            </div>

            <div className="flex flex-row items-center gap-4 flex-1">
                {/* Left: Compact Color Wheel - Fixed Scale */}
                <div
                    className="w-[112px] h-[112px] shrink-0 rounded-full bg-[conic-gradient(from_0deg,#ff0000,#ffff00,#00ff00,#00ffff,#0000ff,#ff00ff,#ff0000)] relative cursor-crosshair shadow-[0_0_20px_rgba(0,0,0,0.5)] ring-1 ring-white/10 group-hover:scale-105 transition-transform"
                    onClick={handleWheelClick}
                >
                    {/* Center Knob */}
                    <div className="absolute inset-0 m-auto w-[48px] h-[48px] rounded-full bg-black/90 border border-white/10 flex items-center justify-center backdrop-blur-xl">
                        <div
                            className="w-[20px] h-[20px] rounded-full shadow-[0_0_10px_currentColor] transition-colors duration-500 border border-white/10"
                            style={{ backgroundColor: `rgb(${color.r},${color.g},${color.b})` }}
                        />
                    </div>
                </div>

                {/* Right: Controls Stack */}
                <div className="flex-1 flex flex-col justify-center gap-4 min-w-0 py-1">
                    {/* Controls Group */}
                    <div className="flex flex-col gap-3">
                        {/* Brightness */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-[clamp(9px,0.7vw,11px)] text-white/30 font-mono uppercase tracking-wider">
                                <span>Brightness</span>
                                <span>{brightness}%</span>
                            </div>
                            <div className="h-[2px] w-full bg-white/5 rounded-full overflow-visible relative flex items-center">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={brightness}
                                    onChange={(e) => setBrightness(parseInt(e.target.value))}
                                    className="absolute inset-0 w-full h-4 -top-2 opacity-0 z-10 cursor-pointer"
                                />
                                <div
                                    className="h-full bg-accent-cyan/80 rounded-full transition-all duration-300 relative"
                                    style={{ width: `${brightness}%` }}
                                >
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-accent-cyan rounded-full shadow-[0_0_8px_#00f2ff]" />
                                </div>
                            </div>
                        </div>

                        {/* Mode Selector */}
                        <div className="space-y-1.5">
                            <div className="text-[clamp(9px,0.7vw,11px)] text-white/30 font-mono uppercase tracking-wider">Mode</div>
                            <div className="relative">
                                <select className="w-full bg-white/5 border border-white/10 hover:bg-white/10 rounded text-[10px] text-white px-2 py-1 outline-none focus:border-accent-cyan/50 appearance-none font-mono transition-colors">
                                    <option>Static</option>
                                    <option>Breathing</option>
                                    <option selected>Pulse</option>
                                    <option>Rainbow</option>
                                </select>
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-white/20 text-[8px]">▼</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
