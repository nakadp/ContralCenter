import { Card } from './Card';
import { Sparkles } from 'lucide-react';

export function EnvironmentFooter() {
    return (
        <Card className="flex flex-col p-3 gap-2 bg-white/5 border-l border-t border-t-white/20 border-l-white/20 border-r-0 border-b-0 backdrop-blur-3xl rounded-xl shadow-xl relative overflow-hidden group min-h-[100px] justify-center">
            {/* 1. 顶部标题 */}
            <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest pl-1">
                IoT Environment
            </div>

            {/* 2. 数据展示区 - 使用格栅布局并配合分割线 */}
            <div className="grid grid-cols-3 gap-2 relative z-10 items-end">

                {/* 室内温度 */}
                <div className="flex flex-col gap-0.5 border-r border-white/10 px-1">
                    <span className="text-[9px] text-accent-cyan/60 uppercase tracking-tighter font-semibold">Indoor Temp</span>
                    <div className="flex items-baseline">
                        <span className="text-lg font-bold text-white tracking-tighter leading-none">24</span>
                        <span className="text-[9px] text-white/50 ml-0.5">°C</span>
                    </div>
                </div>

                {/* 湿度 */}
                <div className="flex flex-col gap-0.5 border-r border-white/10 px-1 pl-3">
                    <span className="text-[9px] text-accent-cyan/60 uppercase tracking-tighter font-semibold">Humidity</span>
                    <div className="flex items-baseline">
                        <span className="text-lg font-bold text-white tracking-tighter leading-none">45</span>
                        <span className="text-[9px] text-white/50 ml-0.5">%</span>
                    </div>
                </div>

                {/* PC 功耗 */}
                <div className="flex flex-col gap-0.5 px-1 pl-3">
                    <span className="text-[9px] text-accent-cyan/60 uppercase tracking-tighter font-semibold">PC Power</span>
                    <div className="flex items-baseline">
                        <span className="text-lg font-bold text-white tracking-tighter leading-none">120</span>
                        <span className="text-[9px] text-white/50 ml-0.5">W</span>
                    </div>
                </div>
            </div>

            {/* 3. 右侧装饰性 Sparkle 图标 */}
            <div className="absolute right-2 bottom-3 text-white/10 group-hover:text-white/30 transition-colors duration-500">
                <Sparkles size={24} strokeWidth={1.5} />
            </div>

            {/* 装饰：底部微光渐变 */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white/5 to-transparent pointer-events-none opacity-30" />
        </Card>
    );
}
