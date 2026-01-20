// import { useStore } from '../store';
// import { DriverCard } from './DriverCard';
import { Card } from './Card';
// import { Terminal } from 'lucide-react';

export function DriverHub() {
    // const { drivers } = useStore();

    return (
        <Card className="flex flex-row items-center p-3 gap-4 relative overflow-hidden ring-0 bg-transparent h-full">
            {/* Gradient Background for this module */}
            <div className="absolute inset-0 bg-gradient-to-r from-accent-cyan/5 via-transparent to-transparent pointer-events-none opacity-50" />

            {/* Logitech G Icon (Left) */}
            <div className="w-12 h-12 shrink-0 flex items-center justify-center relative">
                <div className="absolute inset-0 bg-accent-cyan/10 blur-xl rounded-full" />
                <svg viewBox="0 0 100 100" className="w-10 h-10 fill-[#00f2ff] drop-shadow-[0_0_8px_rgba(0,242,255,0.8)]" xmlns="http://www.w3.org/2000/svg">
                    {/* Simplified Logitech G Path approximation or use the one provided in previous step if valid, 
                        but standardizing on a clean G shape if strict SVG path wasn't provided in prompt details other than "Logitech G Official SVG".
                        I'll use a standard G shape path closer to the official one.
                    */}
                    <path d="M50 20C33.4 20 20 33.4 20 50s13.4 30 30 30c14 0 26-9.2 29-22h-13c-2.4 6-8.2 10-16 10-9.4 0-17-7.6-17-17s7.6-17 17-17c7.8 0 13.6 3.8 16 10h13C66 31 58 20 50 20zm0 0" />
                    <rect x="45" y="45" width="35" height="10" />
                </svg>
            </div>

            {/* Right Side Info */}
            <div className="flex-1 flex flex-col justify-center gap-2 relative z-10">

                {/* Status Row (Center-Right alignment logic via flex) */}
                <div className="flex items-center justify-between">
                    <span className="text-[9px] text-white/40 uppercase tracking-widest font-bold">G HUB Status:</span>
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent-cyan shadow-[0_0_6px_#00f2ff] animate-pulse" />
                        <span className="text-[10px] font-bold text-white tracking-wide shadow-cyan-glow">RUNNING</span>
                    </div>
                </div>

                {/* Launch Button (Bottom-Right aligned) */}
                <button className="w-full py-1.5 rounded-sm bg-white/5 border border-white/10 hover:bg-white/10 hover:border-accent-cyan/30 text-accent-cyan text-[10px] font-mono tracking-widest transition-all uppercase flex items-center justify-center group relative overflow-hidden">
                    <div className="absolute inset-0 bg-accent-cyan/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <span className="relative z-10 group-hover:text-white transition-colors">LAUNCH G HUB</span>
                </button>
            </div>
        </Card>
    );
}
