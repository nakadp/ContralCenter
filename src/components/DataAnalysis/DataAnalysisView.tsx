import { useState, useEffect, useMemo, useRef } from 'react';
import { ChevronDown, Clock, BarChart2 } from 'lucide-react';
import { clsx } from 'clsx';
import GlassCard from '../UI/GlassCard';

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

type DataPoint = {
    timestamp: number;
    cpu: number;
    gpu: number;
    net: number;
};

// ----- Helper Components -----

const TogglePill = ({ color, label, active, onClick }: { color: string, label: string, active: boolean, onClick: () => void }) => (
    <button
        onClick={onClick}
        className={clsx(
            "flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-bold tracking-wider transition-all duration-300 uppercase",
            active
                ? `bg-${color}-500/20 border-${color}-500/50 text-white shadow-[0_0_10px_rgba(var(--color-${color}),0.3)]`
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

const Dropdown = ({ icon: Icon, value, options, onSelect }: { icon: any, value: string, options: { label: string, value: number }[], onSelect: (val: number) => void }) => (
    <div className="relative group">
        <button className="flex items-center gap-2 bg-black/40 border border-white/10 hover:border-cyan-500/50 rounded-lg px-4 py-2 text-xs font-mono text-white transition-all">
            <Icon size={14} className="text-cyan-400" />
            <span className="text-white/70">{value}</span>
            <ChevronDown size={12} className="text-white/30 ml-2 group-hover:text-cyan-400" />
        </button>
        <div className="absolute top-full left-0 mt-2 w-48 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl p-1 shadow-xl opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all z-50 origin-top-left">
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
);

// ----- Main Component -----

export default function DataAnalysisView() {
    // Controls State
    const [selectedResolution, setSelectedResolution] = useState(RESOLUTIONS[0].value); // Default 1 Min
    const [selectedRange, setSelectedRange] = useState(TIME_RANGES[0].value); // Default 1 Hour

    // Data State
    const [activeSeries, setActiveSeries] = useState({ cpu: true, gpu: true, net: true });
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [now, setNow] = useState(Date.now());

    // Layout Constants
    const VIEW_WIDTH = 1000;
    const VIEW_HEIGHT = 500;
    const CHART_MARGIN_BOTTOM = 40; // Space for X-axis labels
    const CHART_HEIGHT = VIEW_HEIGHT - CHART_MARGIN_BOTTOM;

    // Generate deterministic mock data based on time
    const generateData = (endTime: number, range: number, resolution: number): DataPoint[] => {
        const alignedEnd = Math.floor(endTime / resolution) * resolution;
        const startTime = alignedEnd - range - resolution;
        const count = Math.ceil((range + resolution) / resolution) + 2;
        const safeCount = Math.min(count, 5000);

        const data: DataPoint[] = [];

        for (let i = 0; i < safeCount; i++) {
            const t = startTime + (i * resolution);
            if (t > endTime) break;

            const timeFactor = t / 300000;

            data.push({
                timestamp: t,
                cpu: Math.min(100, Math.max(0, Math.sin(timeFactor) * 20 + Math.cos(timeFactor * 0.5) * 15 + 40)),
                gpu: Math.min(100, Math.max(0, Math.cos(timeFactor * 0.7) * 25 + Math.sin(timeFactor * 0.3) * 10 + 35)),
                net: Math.min(100, Math.max(0, Math.sin(timeFactor * 1.2) * 30 + 30)),
            });
        }
        return data;
    };

    const data = useMemo(() => generateData(now, selectedRange, selectedResolution), [now, selectedRange, selectedResolution]);

    // Update time
    useEffect(() => {
        const interval = setInterval(() => {
            setNow(Date.now());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Dynamic Scales
    const { maxVal } = useMemo(() => {
        let max = 0;
        data.forEach(d => {
            if (activeSeries.cpu) max = Math.max(max, d.cpu);
            if (activeSeries.gpu) max = Math.max(max, d.gpu);
            if (activeSeries.net) max = Math.max(max, d.net);
        });

        const bufferedMax = max * 1.1; // Reduced buffer slightly
        const ceiling = Math.max(10, Math.ceil(bufferedMax));
        return { maxVal: ceiling };
    }, [data, activeSeries]);

    const getPath = (key: 'cpu' | 'gpu' | 'net') => {
        if (data.length < 2) return "";

        const winStart = now - selectedRange;
        const winRange = selectedRange;

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
            const y = getY(point[key]);

            if (first) {
                d += `M ${x} ${y}`;
                first = false;
            } else {
                const prevPoint = data[i - 1];
                const prevX = getX(prevPoint.timestamp);
                const prevY = getY(prevPoint[key]);

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
        if (selectedRange <= 60 * 60 * 1000) { // 1 Hour
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (selectedRange <= 24 * 60 * 60 * 1000) { // 24 Hours
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else {
            return date.toLocaleDateString([], { month: '2-digit', day: '2-digit' }) + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
    };

    // Axis Ticks
    const xTicks = useMemo(() => {
        const ticks = [];
        const count = 8; // Denser ticks
        const step = selectedRange / (count - 1);
        const startTime = now - selectedRange;
        for (let i = 0; i < count; i++) {
            ticks.push(startTime + i * step);
        }
        return ticks;
    }, [now, selectedRange]);

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
                        />
                    </div>

                    <div className="flex gap-3">
                        <TogglePill color="#06b6d4" label="CPU LOAD" active={activeSeries.cpu} onClick={() => setActiveSeries(s => ({ ...s, cpu: !s.cpu }))} />
                        <TogglePill color="#d946ef" label="GPU LOAD" active={activeSeries.gpu} onClick={() => setActiveSeries(s => ({ ...s, gpu: !s.gpu }))} />
                        <TogglePill color="#facc15" label="NETWORK" active={activeSeries.net} onClick={() => setActiveSeries(s => ({ ...s, net: !s.net }))} />
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
                            const winStart = now - selectedRange;
                            const winRange = selectedRange;
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
                            const pos = ((tick - (now - selectedRange)) / selectedRange) * VIEW_WIDTH;
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
                            {activeSeries.cpu && <path d={getPath('cpu')} fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" className="drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" />}
                            {activeSeries.gpu && <path d={getPath('gpu')} fill="none" stroke="#d946ef" strokeWidth="2" strokeLinecap="round" className="drop-shadow-[0_0_8px_rgba(217,70,239,0.8)]" />}
                            {activeSeries.net && <path d={getPath('net')} fill="none" stroke="#facc15" strokeWidth="2" strokeDasharray="6,4" className="drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" />}
                        </g>

                        {/* Hover Interaction */}
                        {hoveredIndex !== null && data[hoveredIndex] && (
                            <g>
                                <line
                                    x1={((data[hoveredIndex].timestamp - (now - selectedRange)) / selectedRange) * VIEW_WIDTH}
                                    y1="0"
                                    x2={((data[hoveredIndex].timestamp - (now - selectedRange)) / selectedRange) * VIEW_WIDTH}
                                    y2={CHART_HEIGHT}
                                    stroke="white"
                                    strokeWidth="1"
                                    strokeDasharray="4,4"
                                    opacity="0.5"
                                />
                                {(['cpu', 'gpu', 'net'] as const).map(key => {
                                    if (!activeSeries[key]) return null;
                                    const cx = ((data[hoveredIndex].timestamp - (now - selectedRange)) / selectedRange) * VIEW_WIDTH;
                                    const cy = CHART_HEIGHT - (data[hoveredIndex][key] / maxVal) * CHART_HEIGHT;

                                    const color = key === 'cpu' ? '#06b6d4' : key === 'gpu' ? '#d946ef' : '#facc15';
                                    return <circle key={key} cx={cx} cy={cy} r="4" fill="black" stroke={color} strokeWidth="2" clipPath="url(#chart-area)" />;
                                })}
                            </g>
                        )}
                    </svg>

                    {/* Tooltip */}
                    {hoveredIndex !== null && data[hoveredIndex] && (
                        <div className="absolute top-4 right-4 bg-black/90 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-2xl z-50 pointer-events-none">
                            <div className="text-[10px] text-zinc-500 font-mono mb-2">
                                {new Date(data[hoveredIndex].timestamp).toLocaleTimeString()}
                            </div>
                            {activeSeries.cpu && <div className="text-cyan-400 font-mono text-sm">CPU: {data[hoveredIndex].cpu.toFixed(1)}%</div>}
                            {activeSeries.gpu && <div className="text-fuchsia-400 font-mono text-sm">GPU: {data[hoveredIndex].gpu.toFixed(1)}%</div>}
                            {activeSeries.net && <div className="text-yellow-400 font-mono text-sm">NET: {data[hoveredIndex].net.toFixed(1)} MB/s</div>}
                        </div>
                    )}
                </div>
            </GlassCard>
        </div>
    );
}
