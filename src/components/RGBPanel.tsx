import { useEffect, useState } from 'react';
import { useStore } from '../store';
import { Card } from './Card';
import { Sliders, Zap, Droplets, Activity } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

const PRESETS = [
    { name: 'Cyberpunk', color: { r: 255, g: 0, b: 229 }, icon: Zap },
    { name: 'Deep Sea', color: { r: 0, g: 242, b: 255 }, icon: Droplets },
    { name: 'Pulse', color: { r: 50, g: 255, b: 50 }, icon: Activity },
];

export function RGBPanel() {
    const { rgbDevices, fetchRgbDevices, setRgbColor } = useStore();
    const [selectedDevice, setSelectedDevice] = useState<number | null>(null);
    const [color, setColor] = useState({ r: 0, g: 242, b: 255 });

    useEffect(() => {
        fetchRgbDevices();
    }, [fetchRgbDevices]);

    const handleColorChange = (key: 'r' | 'g' | 'b', val: number) => {
        const newColor = { ...color, [key]: val };
        setColor(newColor);
        if (selectedDevice !== null) {
            setRgbColor(selectedDevice, newColor.r, newColor.g, newColor.b);
        }
    };

    const applyPreset = (presetColor: typeof color) => {
        setColor(presetColor);
        if (selectedDevice !== null) {
            setRgbColor(selectedDevice, presetColor.r, presetColor.g, presetColor.b);
        } else {
            // Apply to all if none selected (Optional feature, implementing loop here or backend support)
            rgbDevices.forEach(d => setRgbColor(d.index, presetColor.r, presetColor.g, presetColor.b));
        }
    };

    return (
        <Card className="h-full flex flex-col relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40 pointer-events-none" />

            <div className="flex items-center gap-2 mb-6 z-10">
                <Sliders className="w-5 h-5 text-accent-cyan" />
                <h3 className="text-lg font-bold text-white">Nerve Center / RGB</h3>
            </div>

            <div className="flex-1 flex flex-col gap-6 z-10 overflow-y-auto custom-scrollbar pr-2">
                {/* Device List */}
                <div className="space-y-2">
                    <label className="text-xs text-gray-500 uppercase tracking-widest font-bold">Target Device</label>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => setSelectedDevice(null)}
                            className={clsx(
                                "p-3 rounded-lg text-sm text-center transition-all border",
                                selectedDevice === null
                                    ? "bg-accent-cyan/20 border-accent-cyan text-white shadow-[0_0_10px_rgba(0,242,255,0.2)]"
                                    : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10"
                            )}
                        >
                            Generic (All)
                        </button>
                        {rgbDevices.map(d => (
                            <button
                                key={d.index}
                                onClick={() => setSelectedDevice(d.index)}
                                className={clsx(
                                    "p-3 rounded-lg text-sm text-center transition-all border truncate",
                                    selectedDevice === d.index
                                        ? "bg-accent-cyan/20 border-accent-cyan text-white shadow-[0_0_10px_rgba(0,242,255,0.2)]"
                                        : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10"
                                )}
                            >
                                {d.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Presets */}
                <div className="space-y-2">
                    <label className="text-xs text-gray-500 uppercase tracking-widest font-bold">Presets</label>
                    <div className="grid grid-cols-3 gap-2">
                        {PRESETS.map((preset) => (
                            <motion.button
                                key={preset.name}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => applyPreset(preset.color)}
                                className="flex flex-col items-center justify-center p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
                            >
                                <preset.icon className="w-6 h-6 mb-2 text-gray-400 group-hover:text-white transition-colors" style={{ color: `rgb(${preset.color.r},${preset.color.g},${preset.color.b})` }} />
                                <span className="text-xs text-gray-400 group-hover:text-white">{preset.name}</span>
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Sliders */}
                <div className="space-y-4 p-4 rounded-xl bg-black/20 border border-white/5">
                    {['r', 'g', 'b'].map((channel) => (
                        <div key={channel} className="flex items-center gap-3">
                            <span className="text-xs font-bold w-4 uppercase text-gray-500">{channel}</span>
                            <input
                                type="range"
                                min="0"
                                max="255"
                                value={color[channel as keyof typeof color]}
                                onChange={(e) => handleColorChange(channel as keyof typeof color, parseInt(e.target.value))}
                                className={clsx(
                                    "flex-1 h-1 rounded-full appearance-none bg-white/10",
                                    "slider-thumb-h-3 slider-thumb-w-3 slider-thumb-rounded-full slider-thumb-white"
                                )}
                                style={{
                                    accentColor: channel === 'r' ? '#ff0055' : channel === 'g' ? '#00ff55' : '#00aaff'
                                }}
                            />
                            <span className="text-xs w-8 text-right font-mono text-gray-400">
                                {color[channel as keyof typeof color]}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Visual Preview Bar */}
            <div className="h-1 w-full absolute bottom-0 left-0" style={{
                background: `linear-gradient(to right, transparent, rgb(${color.r},${color.g},${color.b}), transparent)`
            }} />
        </Card>
    );
}
