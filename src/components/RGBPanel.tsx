import { Monitor, Mouse, Keyboard } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { useState, useEffect } from "react";

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
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6 flex flex-col items-center h-full relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-accent-cyan/5 to-transparent pointer-events-none" />

            <div className="flex items-center justify-between w-full mb-4 z-10">
                <div className="text-xs font-mono text-gray-400 uppercase tracking-widest">Aura Sync</div>
                <div className={`w-2 h-2 rounded-full shadow-[0_0_8px] transition-colors ${connected ? 'bg-accent-cyan shadow-[#00F2FF]' : 'bg-red-500 shadow-red-500'}`} />
            </div>

            {/* Conic Color Wheel */}
            <div
                className="w-40 h-40 rounded-full bg-[conic-gradient(from_0deg,#ff0000,#ffff00,#00ff00,#00ffff,#0000ff,#ff00ff,#ff0000)] relative cursor-crosshair shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-transform hover:scale-105 active:scale-95 mb-6 ring-4 ring-white/5"
                onClick={handleWheelClick}
            >
                {/* Center Knob */}
                <div className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-black/80 border border-white/10 flex items-center justify-center backdrop-blur-xl">
                    <div
                        className="w-8 h-8 rounded-full shadow-[0_0_15px_currentColor] transition-colors duration-500"
                        style={{ backgroundColor: `rgb(${color.r},${color.g},${color.b})` }}
                    />
                </div>
            </div>

            {/* Brightness Slider */}
            <div className="w-full max-w-[180px] z-10 space-y-2">
                <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                    <span>DIM</span>
                    <span>BRIGHT</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={brightness}
                    onChange={(e) => setBrightness(parseInt(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-accent-cyan hover:accent-accent-magenta transition-colors"
                />
            </div>

            {/* Device List (Real) */}
            <div className="mt-auto w-full flex items-center justify-center gap-2 pt-4 border-t border-white/5">
                {rgbDevices.length > 0 ? rgbDevices.map((d, i) => (
                    <div key={i} title={d.name} className="w-8 h-8 rounded bg-white/5 flex items-center justify-center border border-white/5 text-gray-400 hover:text-white hover:border-accent-cyan transition-colors cursor-help">
                        {d.name.toLowerCase().includes('mouse') ? <Mouse size={14} /> :
                            d.name.toLowerCase().includes('keyboard') ? <Keyboard size={14} /> :
                                <Monitor size={14} />}
                    </div>
                )) : (
                    <div className="text-[10px] text-gray-500 font-mono">NO RGB DEVICES</div>
                )}
            </div>
        </div>
    );
}
