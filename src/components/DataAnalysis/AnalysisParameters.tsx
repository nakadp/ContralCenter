import { useRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import GlassCard from '../UI/GlassCard';
import { Check, Calendar, Download, RefreshCw, ChevronRight } from 'lucide-react';
import * as XLSX from 'xlsx';
import { save } from '@tauri-apps/plugin-dialog';
import { writeFile } from '@tauri-apps/plugin-fs';
import { DATA_CONFIG, generateData } from './dataUtils';

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
    dateRange: { start: string; end: string };
    onDateRangeChange: (range: { start: string; end: string }) => void;
    onToggle: (id: string) => void;
}

export default function AnalysisParameters({ selectedData, dateRange, onDateRangeChange, onToggle }: AnalysisParametersProps) {
    const startInputRef = useRef<HTMLInputElement>(null);
    const endInputRef = useRef<HTMLInputElement>(null);

    const handleExport = async () => {
        let endT = Date.now();
        if (dateRange.end) endT = new Date(dateRange.end).getTime();

        let range = 60 * 60 * 1000; // Default 1hr
        if (dateRange.start) {
            const startT = new Date(dateRange.start).getTime();
            range = Math.max(0, endT - startT);
        }

        // Generate data (1 min resolution for export)
        const data = generateData(endT, range, 60 * 1000);

        const exportData = data.map(d => {
            const row: any = { Time: new Date(d.timestamp).toLocaleString() };
            selectedData.forEach(key => {
                const config = DATA_CONFIG[key];
                if (config) {
                    row[config.label] = d[key]?.toFixed(2);
                }
            });
            return row;
        });

        // Open Native Save Dialog
        const path = await save({
            filters: [{
                name: 'Excel Workbook',
                extensions: ['xlsx'],
            }],
            defaultPath: `analysis_export_${new Date().toISOString().slice(0, 10)}.xlsx`,
        });

        if (!path) return; // User cancelled

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(exportData);
        XLSX.utils.book_append_sheet(wb, ws, "Analysis Data");

        // Write file using Tauri FS
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        await writeFile(path, new Uint8Array(wbout));
    };

    return (
        <GlassCard className="w-full h-full !bg-slate-900/60 !border-white/10 flex flex-col" title="">
            {/* Custom Glowing Title */}
            <div className="shrink-0 pb-4 border-b border-white/5 mb-4">
                <h2 className="text-cyan-400 font-bold tracking-[0.2em] text-lg text-center drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                    ANALYSIS PARAMETERS
                </h2>
            </div>

            {/* Content Container */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-6">

                {/* Data Selection Section */}
                <div>
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

                {/* Time Span Section */}
                <div>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-3 pl-1 flex items-center gap-2">
                        <Calendar size={12} />
                        Time Span
                    </div>

                    <div className="space-y-3">
                        {/* Start Date */}
                        <div
                            className="bg-black/20 border border-white/5 rounded-lg p-3 cursor-pointer hover:bg-white/5 transition-colors group relative"
                            onClick={() => startInputRef.current?.showPicker()}
                        >
                            <div className="flex justify-between items-center mb-1">
                                <label className="text-[10px] text-zinc-400 block font-mono uppercase pointer-events-none">Start Date</label>
                                <ChevronRight size={12} className="text-white/20 group-hover:text-cyan-400 transition-colors" />
                            </div>
                            <input
                                ref={startInputRef}
                                type="datetime-local"
                                value={dateRange.start}
                                onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value })}
                                className="w-full bg-transparent text-xs font-mono text-cyan-500 outline-none focus:text-cyan-400 [&::-webkit-calendar-picker-indicator]:invert cursor-pointer"
                                style={{ colorScheme: 'dark' }}
                            />
                        </div>

                        {/* End Date */}
                        <div
                            className="bg-black/20 border border-white/5 rounded-lg p-3 relative cursor-pointer hover:bg-white/5 transition-colors group"
                            onClick={() => {
                                // Only trigger picker if not in "Now" mode or if specifically clicking the input area
                                if (dateRange.end) endInputRef.current?.showPicker();
                            }}
                        >
                            <div className="flex justify-between items-center mb-1">
                                <label className="text-[10px] text-zinc-400 block font-mono uppercase pointer-events-none">End Date</label>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDateRangeChange({ ...dateRange, end: '' });
                                    }}
                                    className={cn(
                                        "text-[9px] uppercase px-1.5 py-0.5 rounded border transition-colors z-10",
                                        !dateRange.end ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/50" : "text-zinc-600 border-white/5 hover:text-zinc-400 hover:border-white/20"
                                    )}
                                >
                                    Live / Now
                                </button>
                            </div>

                            {!dateRange.end ? (
                                <div
                                    className="text-xs font-mono text-cyan-400/50 italic py-0.5 flex items-center gap-2"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // If clicking "Updating Real-time", maybe they want to set a date? 
                                        // Let's allow switching to fixed date by clicking here too, essentially 'picking' a date stops live mode
                                        endInputRef.current?.showPicker();
                                    }}
                                >
                                    <RefreshCw size={10} className="animate-spin" />
                                    Updating Real-time...
                                    <input
                                        ref={endInputRef}
                                        type="datetime-local"
                                        value=""
                                        onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })}
                                        className="sr-only" // Hidden input to trigger picker
                                        style={{ colorScheme: 'dark' }}
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <input
                                        ref={endInputRef}
                                        type="datetime-local"
                                        value={dateRange.end}
                                        onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })}
                                        className="w-full bg-transparent text-xs font-mono text-cyan-500 outline-none focus:text-cyan-400 [&::-webkit-calendar-picker-indicator]:invert cursor-pointer"
                                        style={{ colorScheme: 'dark' }}
                                    />
                                    <ChevronRight size={12} className="text-white/20 group-hover:text-cyan-400 transition-colors" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Export Button */}
                <div className="pt-2">
                    <button
                        onClick={handleExport}
                        disabled={!dateRange.start}
                        className={cn(
                            "w-full flex items-center justify-center gap-2 py-3 rounded-xl border transition-all duration-300 font-bold tracking-widest text-xs uppercase group",
                            dateRange.start
                                ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                                : "bg-white/5 border-white/5 text-zinc-600 cursor-not-allowed"
                        )}
                    >
                        <Download size={14} className={cn("transition-transform group-hover:-translate-y-0.5", !dateRange.start && "opacity-50")} />
                        Export Data
                    </button>
                    {!dateRange.start && (
                        <p className="text-[9px] text-zinc-600 text-center mt-2 font-mono">
                            * Select Start Date to enable export
                        </p>
                    )}
                </div>
            </div>
        </GlassCard>
    );
}
