// import { useStore } from '../store';
// import { DriverCard } from './DriverCard';
import { Card } from './Card';
// import { Terminal } from 'lucide-react';

export function DriverHub() {
    // const { drivers } = useStore();

    return (
        <Card className="flex flex-col p-4 gap-3 relative overflow-hidden border-white/10 bg-white/5 h-full justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-accent-cyan/5 to-transparent pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between z-10">
                <div className="text-[clamp(9px,0.7vw,11px)] font-bold text-white/50 tracking-[0.2em] uppercase">Driver Integration</div>
            </div>

            {/* Content Container */}
            <div className="flex items-center gap-4 z-10">
                {/* Large Icon Box */}
                <div className="w-14 h-14 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                    <svg viewBox="0 0 24 24" className="h-8 w-8 fill-accent-cyan" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21.15 8.94a10.05 10.05 0 0 0-1.74-2.82 10.33 10.33 0 0 0-7.39-3.13c-2.78 0-5.38 1.08-7.33 3.03A10.38 10.38 0 0 0 1.66 13.4a10.38 10.38 0 0 0 3.03 7.33 10.33 10.33 0 0 0 7.33 3.03c2.78 0 5.38-1.08 7.33-3.03a10.35 10.35 0 0 0 2.82-5.79h-5.26v3.29h1.75a6.6 6.6 0 0 1-2.92 1.48c-1.2.37-2.47.37-3.67 0a6.76 6.76 0 0 1-5.63-4.32 6.76 6.76 0 0 1 0-4.78 6.74 6.74 0 0 1 5.63-4.32c1.2-.36 2.47-.36 3.67 0a6.57 6.57 0 0 1 3.96 3.17h3.45z" />
                    </svg>
                </div>

                {/* Status & Action */}
                <div className="flex flex-col gap-2 flex-1 min-w-0">
                    <div>
                        <div className="text-[9px] text-white/40 font-mono uppercase tracking-wider mb-0.5">G Hub Status</div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_4px_#22c55e] animate-pulse" />
                            <span className="text-[10px] font-bold text-white tracking-wide">Running</span>
                        </div>
                    </div>

                    <button className="w-full py-1.5 rounded bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white/70 text-[9px] font-mono tracking-wider transition-all uppercase flex items-center justify-center group">
                        <span className="group-hover:text-white transition-colors">Launch G Hub</span>
                    </button>
                </div>
            </div>
        </Card>
    );
}
