import { Card } from './Card';

export function DriverHub() {
    return (
        <Card className="flex flex-col p-4 gap-4 bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl shadow-xl relative overflow-hidden group">
            {/* 1. 内部标题 - 保持与 RGBPanel 一致 */}
            <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest border-b border-white/5 pb-2">
                Driver Integration
            </div>

            <div className="flex flex-row items-center gap-4 relative z-10">
                {/* 2. 左侧：Logitech G 图标区域 */}
                <div className="w-14 h-14 shrink-0 flex items-center justify-center relative bg-black/20 rounded-xl border border-white/5 shadow-inner">
                    {/* 背景霓虹光晕 */}
                    <div className="absolute inset-0 bg-accent-cyan/10 blur-lg rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />

                    <svg viewBox="0 0 100 100" className="w-9 h-9 fill-accent-cyan drop-shadow-[0_0_10px_rgba(0,242,255,0.6)]" xmlns="http://www.w3.org/2000/svg">
                        <path d="M50 20C33.4 20 20 33.4 20 50s13.4 30 30 30c14 0 26-9.2 29-22h-13c-2.4 6-8.2 10-16 10-9.4 0-17-7.6-17-17s7.6-17 17-17c7.8 0 13.6 3.8 16 10h13C66 31 58 20 50 20zm0 0" />
                        <rect x="45" y="45" width="35" height="10" />
                    </svg>
                </div>

                {/* 3. 右侧：状态与按钮控制 */}
                <div className="flex-1 flex flex-col justify-between gap-3">
                    {/* 运行状态行 */}
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] text-white/50 font-medium">G HUB Status:</span>
                        <div className="flex items-center gap-2">
                            {/* 呼吸感状态指示灯 */}
                            <div className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-40"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500 shadow-[0_0_8px_#22c55e]"></span>
                            </div>
                            <span className="text-[11px] font-bold text-white tracking-tight">RUNNING</span>
                        </div>
                    </div>

                    {/* 启动按钮 - 增强玻璃质感 */}
                    <button className="w-full py-2 rounded-lg bg-white/5 border border-white/10 hover:border-accent-cyan/40 hover:bg-white/10 text-white/80 hover:text-white text-[10px] font-mono tracking-widest transition-all uppercase relative overflow-hidden group/btn">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/btn:animate-shimmer" />
                        <span className="relative z-10">Launch G Hub</span>
                    </button>
                </div>
            </div>

            {/* 装饰线 - 模拟电路感 */}
            <div className="absolute top-0 right-0 w-16 h-[1px] bg-gradient-to-l from-accent-cyan/20 to-transparent" />
        </Card>
    );
}
