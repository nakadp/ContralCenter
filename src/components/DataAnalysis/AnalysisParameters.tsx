import { useState } from 'react';
import { MapPin, Calendar, Search, Building, Plane } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import GlassCard from '../UI/GlassCard';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

const InputLabel = ({ active, children }: { active: boolean; children: React.ReactNode }) => (
    <label className={cn(
        "block text-[10px] uppercase tracking-wider mb-1.5 transition-colors duration-300 font-mono",
        active ? "text-cyan-400" : "text-slate-500"
    )}>
        {children}
    </label>
);

const InputContainer = ({ children, focused }: { children: React.ReactNode; focused: boolean }) => (
    <div className={cn(
        "relative bg-black/40 border rounded-xl transition-all duration-300 flex items-center overflow-hidden group",
        focused ? "border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.1)]" : "border-white/10 hover:border-white/20"
    )}>
        {children}
    </div>
);

export default function AnalysisParameters() {
    const [focusConfig, setFocusConfig] = useState<Record<string, boolean>>({});

    const handleFocus = (field: string) => setFocusConfig(prev => ({ ...prev, [field]: true }));
    const handleBlur = (field: string) => setFocusConfig(prev => ({ ...prev, [field]: false }));

    return (
        <GlassCard className="w-full h-full !bg-slate-900/60 !border-white/10" title="ANALYSIS PARAMETERS">
            {/* Form Content */}
            <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar pt-2">

                {/* City Search */}
                <div className="relative">
                    <InputLabel active={focusConfig['city'] ?? false}>Target Sector (City)</InputLabel>
                    <InputContainer focused={focusConfig['city'] ?? false}>
                        <div className={cn(
                            "pl-3 pr-2 transition-colors duration-300",
                            focusConfig['city'] ? "text-cyan-400" : "text-slate-500"
                        )}>
                            <MapPin size={16} />
                        </div>
                        <input
                            type="text"
                            className="w-full bg-transparent border-none outline-none text-sm text-white py-3 font-mono placeholder:text-white/20 uppercase"
                            placeholder="SELECT SECTOR..."
                            onFocus={() => handleFocus('city')}
                            onBlur={() => setTimeout(() => handleBlur('city'), 200)}
                        />
                        {/* Code Capsule */}
                        <div className="px-3">
                            <div className="bg-indigo-500/20 text-indigo-300 text-[10px] px-2 py-0.5 rounded font-mono border border-indigo-500/30">
                                LHR
                            </div>
                        </div>
                    </InputContainer>

                    {/* Autocomplete Dropdown */}
                    <div className={cn(
                        "absolute top-full left-0 right-0 mt-2 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl p-2 shadow-2xl z-50 transition-all duration-300 origin-top",
                        focusConfig['city'] ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                    )}>
                        <div className="text-[10px] text-zinc-500 px-2 py-1 uppercase tracking-widest font-bold mb-1">Recent Sectors</div>

                        {/* Item 1: City */}
                        <div className="flex items-center gap-3 p-2 hover:bg-white/10 rounded-lg cursor-pointer group transition-colors">
                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                <Building size={14} />
                            </div>
                            <div className="flex-1">
                                <div className="text-sm text-white font-mono">NEO-TOKYO</div>
                                <div className="text-[10px] text-white/40">Sector 01</div>
                            </div>
                            <div className="text-[10px] bg-white/5 px-2 py-1 rounded text-white/50 font-mono">NKT</div>
                        </div>

                        {/* Item 2: Airport */}
                        <div className="flex items-center gap-3 p-2 hover:bg-white/10 rounded-lg cursor-pointer group transition-colors">
                            <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white transition-all">
                                <Plane size={14} />
                            </div>
                            <div className="flex-1">
                                <div className="text-sm text-white font-mono">HEATHROW HUB</div>
                                <div className="text-[10px] text-white/40">Transit Node</div>
                            </div>
                            <div className="text-[10px] bg-white/5 px-2 py-1 rounded text-white/50 font-mono">LHR</div>
                        </div>
                    </div>
                </div>

                {/* Date Picker */}
                <div>
                    <InputLabel active={focusConfig['date'] ?? false}>Time Range</InputLabel>
                    <InputContainer focused={focusConfig['date'] ?? false}>
                        <div className={cn(
                            "pl-3 pr-2 transition-colors duration-300",
                            focusConfig['date'] ? "text-cyan-400" : "text-slate-500"
                        )}>
                            <Calendar size={16} />
                        </div>
                        <input
                            type="date"
                            className="w-full bg-transparent border-none outline-none text-sm text-white py-3 font-mono placeholder:text-white/20 min-h-[46px] [color-scheme:dark]"
                            onFocus={() => handleFocus('date')}
                            onBlur={() => handleBlur('date')}
                        />
                    </InputContainer>
                </div>

                {/* Min/Max Days - Numeric */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <InputLabel active={focusConfig['min'] ?? false}>Min Cycle</InputLabel>
                        <InputContainer focused={focusConfig['min'] ?? false}>
                            <input
                                type="number"
                                className="w-full bg-transparent border-none outline-none text-sm text-white py-3 font-mono text-center"
                                placeholder="0"
                                onFocus={() => handleFocus('min')}
                                onBlur={() => handleBlur('min')}
                            />
                        </InputContainer>
                    </div>
                    <div>
                        <InputLabel active={focusConfig['max'] ?? false}>Max Cycle</InputLabel>
                        <InputContainer focused={focusConfig['max'] ?? false}>
                            <input
                                type="number"
                                className="w-full bg-transparent border-none outline-none text-sm text-white py-3 font-mono text-center"
                                placeholder="30"
                                onFocus={() => handleFocus('max')}
                                onBlur={() => handleBlur('max')}
                            />
                        </InputContainer>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-white/5 my-6" />

                {/* Extra Filters (Mock) */}
                <div className="space-y-4 opacity-50 pointer-events-none filter blur-[1px]">
                    <div>
                        <InputLabel active={false}>Data Source</InputLabel>
                        <div className="w-full h-10 bg-white/5 border border-white/5 rounded-xl" />
                    </div>
                </div>

            </div>

            {/* Primary Action */}
            <div className="mt-8 pt-6 border-t border-white/5">
                <button className="w-full group relative bg-cyan-600 hover:bg-cyan-500 text-white font-bold tracking-widest py-4 rounded-xl flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                    <span className="relative z-10">SEARCH DATA</span>
                    <Search size={18} className="relative z-10" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                </button>
            </div>
        </GlassCard>
    );
}
