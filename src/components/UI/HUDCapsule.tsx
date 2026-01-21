export default function HUDCapsule() {
    return (
        <div className="absolute top-6 right-6 glass-pill flex items-center gap-6 text-xs font-mono text-aether-cyan z-50 shadow-[0_0_20px_rgba(0,0,0,0.5)] select-none pointer-events-none">
            <div className="flex items-center gap-2">
                <span className="text-white/40">CPU</span>
                <span className="animate-pulse">27%</span>
            </div>
            <div className="w-px h-3 bg-white/10" />
            <div className="flex items-center gap-2">
                <span className="text-white/40">GPU</span>
                <span>8%</span>
            </div>
            <div className="w-px h-3 bg-white/10" />
            <div className="flex items-center gap-2">
                <span className="text-white/40">NET</span>
                <span>25MB/s</span>
            </div>
        </div>
    );
}
