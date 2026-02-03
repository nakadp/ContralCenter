import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import GlassCard from '../UI/GlassCard';
import { Check } from 'lucide-react';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

const DATA_OPTIONS = [
    { id: 'cpu_util', label: 'CPU Usage' },
    { id: 'gpu_util', label: 'GPU Usage' },
    { id: 'gpu_temp', label: 'GPU Temp' },
    { id: 'net_up', label: 'Upload Spd' },
    { id: 'net_down', label: 'Download Spd' },
    { id: 'in_temp', label: 'Indoor Temp' },
    { id: 'in_hum', label: 'Humidity' },
    { id: 'in_light', label: 'Light Lvl' },
    { id: 'in_co2', label: 'CO2 Level' },
    { id: 'pc_pwr', label: 'PC Power' },
    { id: 'out_light', label: 'Out Light' },
    { id: 'out_wind', label: 'Out Wind' },
    { id: 'pv_pwr', label: 'PV Power' },
    { id: 'pv_volt', label: 'PV Voltage' },
    { id: 'pv_curr', label: 'PV Current' },
    { id: 'wind_pwr', label: 'Wind Power' },
];

interface AnalysisParametersProps {
    selectedData: string[];
    onToggle: (id: string) => void;
}

export default function AnalysisParameters({ selectedData, onToggle }: AnalysisParametersProps) {
    return (
        <GlassCard className="w-full h-full !bg-slate-900/60 !border-white/10 flex flex-col" title="">
            {/* Custom Glowing Title */}
            <div className="shrink-0 pb-4 border-b border-white/5 mb-4">
                <h2 className="text-cyan-400 font-bold tracking-[0.2em] text-lg text-center drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                    ANALYSIS PARAMETERS
                </h2>
            </div>

            {/* Data Selection Grid */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-3 pl-1">
                    Data Selection
                </div>

                <div className="grid grid-cols-2 gap-x-2 gap-y-3">
                    {DATA_OPTIONS.map((option) => {
                        const isSelected = selectedData.includes(option.id);

                        return (
                            <div
                                key={option.id}
                                onClick={() => onToggle(option.id)}
                                className="group flex items-center gap-2 cursor-pointer select-none"
                            >
                                {/* Circular Checkbox */}
                                <div className={cn(
                                    "w-4 h-4 shrink-0 rounded-full border flex items-center justify-center transition-all duration-300",
                                    isSelected
                                        ? "bg-cyan-500 border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.6)]"
                                        : "bg-transparent border-zinc-700 group-hover:border-cyan-500/50"
                                )}>
                                    <Check size={10} className={cn(
                                        "text-black transition-transform duration-200 stroke-[4]",
                                        isSelected ? "scale-100" : "scale-0"
                                    )} />
                                </div>

                                {/* Label */}
                                <span className={cn(
                                    "text-[11px] font-mono tracking-wide transition-colors duration-300 truncate",
                                    isSelected ? "text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.4)]" : "text-zinc-500 group-hover:text-zinc-300"
                                )}>
                                    {option.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </GlassCard>
    );
}
