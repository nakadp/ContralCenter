import { useState, useEffect, useMemo } from 'react';
import { ChevronDown, Clock, BarChart2 } from 'lucide-react';
import { clsx } from 'clsx';
import GlassCard from '../UI/GlassCard';
import { DATA_CONFIG, generateData } from './dataUtils';
import type { DataPoint } from './dataUtils';

// ----- Constants & Types -----

const RESOLUTIONS = [
    { label: "1 Min Values", value: 60 * 1000 },
    { label: "1 Hr Values", value: 60 * 60 * 1000 },
    { label: "1 Day Values", value: 24 * 60 * 60 * 1000 },
];

const TIME_RANGES = [
    { label: "Past 1 Hour", value: 60 * 60 * 1000 },
    { label: "Past 24 Hours", value: 24 * 60 * 60 * 1000 },
    { label: "Past 7 Days", value: 7 * 24 * 60 * 60 * 1000 },
    { label: "Past 30 Days", value: 30 * 24 * 60 * 60 * 1000 },
];

// ----- Helper Components -----

const TogglePill = ({ color, label, active, onClick }: { color: string, label: string, active: boolean, onClick: () => void }) => (
    <button
        onClick={onClick}
        className={clsx(
            "flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-bold tracking-wider transition-all duration-300 uppercase whitespace-nowrap",
            active
                ? `bg-[${color}]/20 text-white shadow-[0_0_10px_rgba(255,255,255,0.1)]`
                : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:text-white/60"
        )}
        style={{
            borderColor: active ? color : undefined,
            backgroundColor: active ? `${color}33` : undefined,
            boxShadow: active ? `0 0 10px ${color}66` : undefined
        }}
    >
        <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: color }}
        />
        {label}
    </button>
);

const Dropdown = ({ icon: Icon, value, options, onSelect, disabled }: { icon: any, value: string, options: { label: string, value: number }[], onSelect: (val: number) => void, disabled?: boolean }) => (
    <div className={clsx("relative group", disabled && "pointer-events-none opacity-50 grayscale")}>
        <button className="flex items-center gap-2 bg-black/40 border border-white/10 hover:border-cyan-500/50 rounded-lg px-4 py-2 text-xs font-mono text-white transition-all">
            <Icon size={14} className="text-cyan-400" />
            <span className="text-white/70">{value}</span>
            <ChevronDown size={12} className="text-white/30 ml-2 group-hover:text-cyan-400" />
        </button>
        {/* Helper bridge to maintain hover state */}
        {!disabled && (
            <div className="absolute top-full left-0 w-48 pt-2 opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all z-50 origin-top-left">
                <div className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl p-1 shadow-xl">
                    {options.map(opt => (
                        <div
                            key={opt.label}
                            onClick={() => onSelect(opt.value)}
                            className={clsx(
                                "px-3 py-2 text-xs rounded-lg cursor-pointer font-mono transition-colors",
                                value === opt.label ? "bg-cyan-500/20 text-cyan-400" : "text-white/70 hover:text-white hover:bg-white/10"
                            )}
                        >
                            {opt.label}
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
);

// ----- Main Component -----

interface DataAnalysisViewProps {
    selectedData: string[];
    dateRange: { start: string; end: string };
}

export default function DataAnalysisView({ selectedData, dateRange }: DataAnalysisViewProps) {
    // Controls State
    const [selectedResolution, setSelectedResolution] = useState(RESOLUTIONS[0].value); // Default 1 Min
    const [selectedRange, setSelectedRange] = useState(TIME_RANGES[0].value); // Default 1 Hour

    // Local Visibility State (Toggle keys on/off temporarily)
    const [hiddenSeries, setHiddenSeries] = useState<string[]>([]);

    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [now, setNow] = useState(Date.now());

    // Layout Constants
    const VIEW_WIDTH = 1000;
    const VIEW_HEIGHT = 500;
    const CHART_MARGIN_BOTTOM = 40; // Space for X-axis labels
    const CHART_HEIGHT = VIEW_HEIGHT - CHART_MARGIN_BOTTOM;

    // Calculate effective time parameters
    const isCustomRange = !!dateRange.start;

    // If end is fixed, we use that. If end is empty, we use Live `now`.
    const endTime = useMemo(() => {
        if (isCustomRange && dateRange.end) {
            return new Date(dateRange.end).getTime();
        }
        return now;
    }, [isCustomRange, dateRange.end, now]);

    // If custom range, calculate diff. Else use selected preset.
    const effectiveRange = useMemo(() => {
        if (isCustomRange) {
            const startT = new Date(dateRange.start).getTime();
            // Ensure positive range
            return Math.max(1000, endTime - startT);
        }
        return selectedRange;
    }, [isCustomRange, dateRange.start, endTime, selectedRange]);

    const data = useMemo(() => generateData(endTime, effectiveRange, selectedResolution), [endTime, effectiveRange, selectedResolution]);

    // Update time (tick only if live)
    useEffect(() => {
        const interval = setInterval(() => {
            // Even if fixed end time, we might still want 'now' to tick for UI checks or if we switch back
            setNow(Date.now());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Active keys to display
    const activeKeys = useMemo(() => selectedData.filter(key => !hiddenSeries.includes(key)), [selectedData, hiddenSeries]);

    // Dynamic Scales
    const { maxVal } = useMemo(() => {
        let max = 0;
        if (activeKeys.length === 0) return { maxVal: 100 }; // Default

        data.forEach(d => {
            activeKeys.forEach(key => {
                if (d[key] !== undefined) max = Math.max(max, d[key]);
            });
        });

        const bufferedMax = max * 1.1; // Reduced buffer slightly
        const ceiling = Math.max(10, Math.ceil(bufferedMax));
        return { maxVal: ceiling };
    }, [data, activeKeys]);

    const getPath = (key: string) => {
        if (data.length < 2) return "";

        const winStart = endTime - effectiveRange;
        const winRange = effectiveRange;

        const getX = (t: number) => ((t - winStart) / winRange) * VIEW_WIDTH;
        const getY = (v: number) => {
            const clampedV = Math.min(v, maxVal);
            // Scan from top (0) to bottom (CHART_HEIGHT)
            return CHART_HEIGHT - (clampedV / maxVal) * CHART_HEIGHT;
        };

        let d = "";
        let first = true;

        data.forEach((point, i) => {
            const x = getX(point.timestamp);
            const val = point[key];
            if (val === undefined) return;

            const y = getY(val);

            if (first) {
                d += `M ${x} ${y}`;
                first = false;
            } else {
                const prevPoint = data[i - 1];
                const prevX = getX(prevPoint.timestamp);
                const prevY = getY(prevPoint[key] as number);

                // Curve smoothing
                const cp1x = prevX + (x - prevX) / 2;
                const cp1y = prevY;
                const cp2x = x - (x - prevX) / 2;
                const cp2y = y;

                d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x} ${y}`;
            }
        });

        return d;
    };

    const formatTime = (ts: number) => {
        const date = new Date(ts);
        if (effectiveRange <= 60 * 60 * 1000) { // 1 Hour
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (effectiveRange <= 24 * 60 * 60 * 1000) { // 24 Hours
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else {
            return date.toLocaleDateString([], { month: '2-digit', day: '2-digit' }) + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
    };

    // Axis Ticks
    const xTicks = useMemo(() => {
        const ticks = [];
        const count = 8; // Denser ticks
        const step = effectiveRange / (count - 1);
        const startTime = endTime - effectiveRange;
        for (let i = 0; i < count; i++) {
            ticks.push(startTime + i * step);
        }
        return ticks;
    }, [endTime, effectiveRange]);

    const yTicks = useMemo(() => {
        const steps = 5;
        const ticks = [];
        for (let i = 0; i <= steps; i++) {
            ticks.push(Math.round((maxVal / steps) * i));
        }
        return ticks;
    }, [maxVal]);

    const currentResLabel = RESOLUTIONS.find(r => r.value === selectedResolution)?.label || "Custom";
    const currentRangeLabel = TIME_RANGES.find(r => r.value === selectedRange)?.label || "Custom";

    // Styles
    const textBaseClass = "text-[10px] font-mono font-bold tracking-wider fill-slate-500/70 select-none";

    return (
        <div className="w-full h-full flex flex-col justify-center">
            <GlassCard className="w-full h-full !bg-slate-900/60 !border-white/10">
                {/* Controls */}
                <div className="flex items-center justify-between mb-6 px-2">
                    <div className="flex gap-4">
                        <Dropdown
                            icon={BarChart2}
                            value={currentResLabel}
                            options={RESOLUTIONS}
                            onSelect={setSelectedResolution}
                        />
                        <Dropdown
                            icon={Clock}
                            value={currentRangeLabel}
                            options={TIME_RANGES}
                            onSelect={setSelectedRange}
                            disabled={isCustomRange}
                        />
                    </div>

                    <div className="flex gap-3 overflow-x-auto max-w-[60vw] pb-2 no-scrollbar">
                        {selectedData.map(key => {
                            const config = DATA_CONFIG[key] || { label: key, color: '#fff' };
                            const isActive = !hiddenSeries.includes(key);
                            return (
                                <TogglePill
                                    key={key}
                                    color={config.color}
                                    label={config.label}
                                    active={isActive}
                                    onClick={() => {
                                        setHiddenSeries(prev =>
                                            isActive
                                                ? [...prev, key]
                                                : prev.filter(k => k !== key)
                                        );
                                    }}
                                />
                            );
                        })}
                    </div>
                </div>

                {/* Chart Container */}
                <div className="flex-1 relative w-full h-full rounded-xl border border-white/5 bg-black/20 overflow-hidden">

                    <div className="absolute inset-0 pointer-events-none"
                        style={{
                            backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)',
                            backgroundSize: '100% 20%'
                        }}
                    />

                    <svg
                        className="w-full h-full overflow-hidden"
                        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
                        preserveAspectRatio="none"
                        onMouseMove={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const x = e.clientX - rect.left;
                            const percentage = x / rect.width;
                            const winStart = endTime - effectiveRange;
                            const winRange = effectiveRange;
                            const hoverTime = winStart + percentage * winRange;

                            let closestIdx = 0;
                            let minDiff = Number.MAX_VALUE;
                            data.forEach((d, i) => {
                                const diff = Math.abs(d.timestamp - hoverTime);
                                if (diff < minDiff) {
                                    minDiff = diff;
                                    closestIdx = i;
                                }
                            });
                            setHoveredIndex(closestIdx);
                        }}
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        <defs>
                            <clipPath id="chart-area">
                                <rect x="0" y="0" width={VIEW_WIDTH} height={CHART_HEIGHT} />
                            </clipPath>
                        </defs>

                        {/* X Axis Labels */}
                        {xTicks.map((tick, i) => {
                            const pos = ((tick - (endTime - effectiveRange)) / effectiveRange) * VIEW_WIDTH;
                            return (
                                <text
                                    key={i}
                                    x={pos}
                                    y={VIEW_HEIGHT - 10}
                                    className={textBaseClass}
                                    textAnchor="middle"
                                >
                                    {formatTime(tick)}
                                </text>
                            );
                        })}

                        {/* Y Axis Grid Lines & Labels */}
                        {yTicks.slice(1).map((val, i) => {
                            const y = CHART_HEIGHT - (val / maxVal) * CHART_HEIGHT;
                            return (
                                <g key={i}>
                                    <line x1="0" y1={y} x2={VIEW_WIDTH} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4,4" />
                                    <text
                                        x="10"
                                        y={y - 5}
                                        className={textBaseClass}
                                    >
                                        {val}
                                    </text>
                                </g>
                            );
                        })}

                        {/* Lines Group with ClipPath */}
                        <g clipPath="url(#chart-area)">
                            {activeKeys.map(key => {
                                const config = DATA_CONFIG[key] || { color: '#fff' };
                                return (
                                    <path
                                        key={key}
                                        d={getPath(key)}
                                        fill="none"
                                        stroke={config.color}
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        className="transition-all duration-300"
                                        style={{
                                            filter: `drop-shadow(0 0 4px ${config.color}80)`
                                        }}
                                    />
                                );
                            })}
                        </g>

                        {/* Hover Interaction */}
                        {hoveredIndex !== null && data[hoveredIndex] && (
                            <g>
                                <line
                                    x1={((data[hoveredIndex].timestamp - (endTime - effectiveRange)) / effectiveRange) * VIEW_WIDTH}
                                    y1="0"
                                    x2={((data[hoveredIndex].timestamp - (endTime - effectiveRange)) / effectiveRange) * VIEW_WIDTH}
                                    y2={CHART_HEIGHT}
                                    stroke="white"
                                    strokeWidth="1"
                                    strokeDasharray="4,4"
                                    opacity="0.5"
                                />
                                {activeKeys.map(key => {
                                    const val = data[hoveredIndex][key];
                                    if (val === undefined) return null;

                                    const cx = ((data[hoveredIndex].timestamp - (endTime - effectiveRange)) / effectiveRange) * VIEW_WIDTH;
                                    const cy = CHART_HEIGHT - (val / maxVal) * CHART_HEIGHT;
                                    const config = DATA_CONFIG[key] || { color: '#fff' };

                                    return <circle key={key} cx={cx} cy={cy} r="4" fill="black" stroke={config.color} strokeWidth="2" clipPath="url(#chart-area)" />;
                                })}
                            </g>
                        )}
                    </svg>

                    {/* Tooltip */}
                    {hoveredIndex !== null && data[hoveredIndex] && (
                        <div className="absolute top-4 right-4 bg-black/90 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-2xl z-50 pointer-events-none max-h-[80%] overflow-y-auto custom-scrollbar">
                            <div className="text-[10px] text-zinc-500 font-mono mb-2">
                                {new Date(data[hoveredIndex].timestamp).toLocaleTimeString()}
                            </div>
                            {activeKeys.map(key => {
                                const config = DATA_CONFIG[key] || { label: key, color: '#fff' };
                                const val = data[hoveredIndex][key];
                                return (
                                    <div key={key} className="flex gap-4 justify-between font-mono text-xs mb-1">
                                        <span style={{ color: config.color }}>{config.label}:</span>
                                        <span className="text-white">{val.toFixed(1)}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </GlassCard>
        </div>
    );
}
