import GlassCard from '../UI/GlassCard';
import { Maximize2 } from 'lucide-react';

export default function RightPanel() {
    return (
        <aside className="w-[22vw] min-w-[320px] bg-black/80 backdrop-blur-xl border-l border-white/5 h-full p-6 flex flex-col gap-5 overflow-hidden relative z-40 flex-shrink-0">

            {/* Device Details Header */}
            <div className="flex items-center justify-between mb-2 px-1">
                <div>
                    <h2 className="text-xl font-medium tracking-tight text-white font-mono">HOST PC</h2>
                    <div className="flex items-center gap-2 text-xs text-white/40 font-mono mt-1">
                        <span className="w-2 h-2 rounded-full bg-aether-cyan animate-pulse" />
                        ONLINE :: 192.168.1.10
                    </div>
                </div>
                <button className="text-white/20 hover:text-white transition-colors">
                    <Maximize2 size={18} />
                </button>
            </div>

            {/* RGB Control */}
            <GlassCard title="RGB SYNC" className="h-48 shrink-0">
                <div className="flex items-center justify-center h-full">
                    <div className="w-[112px] h-[112px] rounded-full border-4 border-white/5 relative flex items-center justify-center shadow-[0_0_30px_rgba(0,242,255,0.1)]">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-aether-cyan to-aether-magenta opacity-20 blur-xl" />
                        <span className="font-mono text-[10px] text-white/50 tracking-widest">COLOR</span>
                    </div>
                </div>
            </GlassCard>

            {/* Driver Status */}
            <GlassCard title="DRIVERS" className="shrink-0">
                <ul className="space-y-3 font-mono text-xs">
                    <li className="flex items-center justify-between p-2 bg-white/5 rounded border border-white/5">
                        <span className="text-white/80">Logitech G Hub</span>
                        <span className="text-aether-cyan">• LOADED</span>
                    </li>
                    <li className="flex items-center justify-between p-2 bg-white/5 rounded border border-white/5">
                        <span className="text-white/80">NVIDIA Broadcast</span>
                        <span className="text-aether-cyan">• LOADED</span>
                    </li>
                </ul>
            </GlassCard>

            {/* Telemetry (Magenta Theme) */}
            <GlassCard title="TELEMETRY" className="flex-1 min-h-0">
                <div className="flex flex-col h-full">
                    <div className="flex-1 flex items-end justify-between gap-1 pb-2">
                        {/* Fake chart bars */}
                        {[40, 65, 30, 85, 55, 95, 70, 45, 60, 30, 50, 75].map((h, i) => (
                            <div key={i} style={{ height: `${h}%` }} className="w-full bg-aether-magenta/10 rounded-t-sm relative overflow-hidden group">
                                <div className="absolute bottom-0 left-0 right-0 bg-aether-magenta h-[2px] shadow-[0_0_8px_#ff00e5]" />
                            </div>
                        ))}
                    </div>
                    <div className="h-px w-full bg-white/10" />
                    <div className="flex justify-between text-[10px] font-mono text-aether-magenta/80 pt-2">
                        <span>PWR: 85W</span>
                        <span>TMP: 62°C</span>
                    </div>
                </div>
            </GlassCard>

        </aside>
    );
}
