import { invoke } from "@tauri-apps/api/core";
import { useState, useEffect } from "react";
import { Card } from "./Card";

export function RGBPanel() {
    const [color, setColor] = useState({ r: 0, g: 242, b: 255 }); // Default Cyan
    const [brightness, setBrightness] = useState(100);
    const [rgbDevices, setRgbDevices] = useState<{ name: string, index: number, led_count: number }[]>([]);
    // const [connected, setConnected] = useState(false);

    useEffect(() => {
        const initRGB = async () => {
            try {
                await invoke("connect_rgb");
                // setConnected(true);
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
        <Card className="flex flex-col p-4 gap-3 relative overflow-hidden ring-0 bg-transparent h-full justify-center">
            {/* Header removed from here as it's now in the parent container, or if we need keeps internal uniformity, we can keep a small label or remove it if the parent header covers it. 
                The requirements prompt implies a "RGB Panel" module. The parent has "DEVICE DETAILS". 
                I will remove the "RGB Control" header inside this component to save space and rely on the visual distinction, 
                or keep it very minimal if needed. The prompt says "RGB Control module...". 
                Let's keep the structure but align with the "horizontal reflow".
            */}

            <div className="flex flex-row items-center gap-6 h-full">
                {/* Left: Color Wheel (Fixed 112px) */}
                <div
                    className="w-[112px] h-[112px] shrink-0 rounded-full bg-[conic-gradient(from_0deg,#ff0000,#ffff00,#00ff00,#00ffff,#0000ff,#ff00ff,#ff0000)] relative cursor-crosshair shadow-[0_0_20px_rgba(0,0,0,0.5)] ring-1 ring-white/10 group hover:scale-105 transition-transform"
                    onClick={handleWheelClick}
                >
                    {/* Inner Mask for Ring Effect */}
                    <div className="absolute inset-[15%] rounded-full bg-[#0a0a0a] border border-white/5" />

                    {/* Active Color Indicator (Center) */}
                    <div className="absolute inset-0 m-auto w-[30%] h-[30%] rounded-full bg-black/90 border border-white/20 flex items-center justify-center backdrop-blur-xl shadow-[0_0_15px_rgba(0,0,0,0.8)]">
                        <div
                            className="w-[60%] h-[60%] rounded-full shadow-[0_0_10px_currentColor] transition-colors duration-500"
                            style={{ backgroundColor: `rgb(${color.r},${color.g},${color.b})` }}
                        />
                    </div>
                </div>

                {/* Right: Controls Stack (Vertical) */}
                <div className="flex-1 flex flex-col justify-center gap-5 min-w-0">

                    {/* Brightness Control */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-end">
                            <span className="text-[9px] text-white/40 uppercase tracking-widest font-bold">Brightness</span>
                            <span className="text-[10px] font-mono text-white/70">{brightness}%</span>
                        </div>
                        <div className="h-[2px] w-full bg-white/10 rounded-full relative group cursor-pointer">
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={brightness}
                                onChange={(e) => setBrightness(parseInt(e.target.value))}
                                className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                            />
                            <div
                                className="h-full bg-accent-cyan shadow-[0_0_8px_#00f2ff] rounded-full relative"
                                style={{ width: `${brightness}%` }}
                            >
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_5px_white]" />
                            </div>
                        </div>
                    </div>

                    {/* Mode Selector */}
                    <div className="space-y-1.5">
                        <span className="text-[9px] text-white/40 uppercase tracking-widest font-bold">Mode</span>
                        <div className="relative group">
                            <select className="w-full bg-white/5 border border-white/10 hover:border-white/20 rounded-sm text-[10px] text-white/90 px-2 py-1.5 outline-none appearance-none font-mono tracking-wide transition-all uppercase cursor-pointer">
                                <option>Static</option>
                                <option>Breathing</option>
                                <option selected>Pulse</option>
                                <option>Cycle</option>
                            </select>
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-accent-cyan text-[8px]">▼</div>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
