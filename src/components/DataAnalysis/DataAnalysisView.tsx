import { useState, useEffect } from 'react';
import { ChevronDown, Clock, BarChart2 } from 'lucide-react';
import { clsx } from 'clsx';
import GlassCard from '../UI/GlassCard';

const MOCK_DATA_POINTS = 50;

// Generate mock data
const generateMockData = () => {
    return Array.from({ length: MOCK_DATA_POINTS }, (_, i) => ({
        id: i,
        cpu: 30 + Math.random() * 40 + Math.sin(i * 0.2) * 20,
        gpu: 20 + Math.random() * 30 + Math.cos(i * 0.1) * 15,
        net: 10 + Math.random() * 60 + (i % 5 === 0 ? 30 : 0),
    }));
};

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
            backgroundColor: active ? `${color}33` : undefined, // fallback HEX transparency
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

const Dropdown = ({ icon: Icon, label, options }: { icon: any, label: string, options: string[] }) => (
    <div className="relative group">
        <button className="flex items-center gap-2 bg-black/40 border border-white/10 hover:border-cyan-500/50 rounded-lg px-4 py-2 text-xs font-mono text-white transition-all">
            <Icon size={14} className="text-cyan-400" />
            <span className="text-white/70">{label}</span>
            <ChevronDown size={12} className="text-white/30 ml-2 group-hover:text-cyan-400" />
        </button>
        {/* Dropdown Menu (Hover) */}
        <div className="absolute top-full left-0 mt-2 w-40 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl p-1 shadow-xl opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all z-50 origin-top-left">
            {options.map(opt => (
                <div key={opt} className="px-3 py-2 text-xs text-white/70 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer font-mono">
                    {opt}
                </div>
            ))}
        </div>
    </div>
);

export default function DataAnalysisView() {
    const [data, setData] = useState(generateMockData());
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [activeSeries, setActiveSeries] = useState({ cpu: true, gpu: true, net: true });

    // Update data periodically
    useEffect(() => {
        const interval = setInterval(() => {
            setData(prev => {
                const next = [...prev.slice(1)];
                const last = prev[prev.length - 1];
                next.push({
                    id: last.id + 1,
                    cpu: Math.min(100, Math.max(0, 30 + Math.random() * 40 + Math.sin((last.id + 1) * 0.2) * 20)),
                    gpu: Math.min(100, Math.max(0, 20 + Math.random() * 30 + Math.cos((last.id + 1) * 0.1) * 15)),
                    net: Math.max(0, 10 + Math.random() * 60 + (Math.random() > 0.9 ? 50 : 0)),
                });
                return next;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Calculate SVG paths (No Area, just lines)
    const getPath = (key: 'cpu' | 'gpu' | 'net', height: number, width: number) => {
        const maxVal = 120;
        const stepX = width / (data.length - 1);

        let d = `M 0 ${height - (data[0][key] / maxVal) * height}`;

        data.forEach((point, i) => {
            if (i === 0) return;
            const x = i * stepX;
            const y = height - (point[key] / maxVal) * height;
            // Smooth curve
            const prevX = (i - 1) * stepX;
            const prevY = height - (data[i - 1][key] / maxVal) * height;
            const cp1x = prevX + stepX / 2;
            const cp1y = prevY;
            const cp2x = x - stepX / 2;
            const cp2y = y;
            d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x} ${y}`;
        });
        return d;
    };

    return (
        <div className="w-full h-full flex flex-col justify-center">

            <GlassCard className="w-full h-full !bg-slate-900/60 !border-white/10">
                {/* Controls Header */}
                <div className="flex items-center justify-between mb-6 px-2">
                    <div className="flex gap-4">
                        <Dropdown
                            icon={BarChart2}
                            label="1 Hr Average"
                            options={["1 Min Average", "1 Hr Average", "1 Day Average"]}
                        />
                        <Dropdown
                            icon={Clock}
                            label="Past 24 Hours"
                            options={["1 Hour", "24 Hours", "7 Days", "30 Days", "1 Year"]}
                        />
                    </div>

                    <div className="flex gap-3">
                        <TogglePill
                            color="#06b6d4"
                            label="CPU LOAD"
                            active={activeSeries.cpu}
                            onClick={() => setActiveSeries(s => ({ ...s, cpu: !s.cpu }))}
                        />
                        <TogglePill
                            color="#d946ef"
                            label="GPU LOAD"
                            active={activeSeries.gpu}
                            onClick={() => setActiveSeries(s => ({ ...s, gpu: !s.gpu }))}
                        />
                        <TogglePill
                            color="#facc15"
                            label="NETWORK"
                            active={activeSeries.net}
                            onClick={() => setActiveSeries(s => ({ ...s, net: !s.net }))}
                        />
                    </div>
                </div>

                {/* Chart Container */}
                <div className="flex-1 relative w-full h-full overflow-hidden rounded-xl border border-white/5 bg-black/20">

                    {/* Grid Background */}
                    <div className="absolute inset-0 pointer-events-none"
                        style={{
                            backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)',
                            backgroundSize: '100% 20%'
                        }}
                    />

                    <svg
                        className="w-full h-full overflow-visible"
                        viewBox={`0 0 1000 500`}
                        preserveAspectRatio="none"
                        onMouseMove={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const x = e.clientX - rect.left;
                            const idx = Math.min(MOCK_DATA_POINTS - 1, Math.max(0, Math.floor((x / rect.width) * MOCK_DATA_POINTS)));
                            setHoveredIndex(idx);
                        }}
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        {/* X Axis Labels (Mock) */}
                        <text x="50" y="490" fill="gray" fontSize="10" fontFamily="monospace">00:00</text>
                        <text x="250" y="490" fill="gray" fontSize="10" fontFamily="monospace">06:00</text>
                        <text x="500" y="490" fill="gray" fontSize="10" fontFamily="monospace">12:00</text>
                        <text x="750" y="490" fill="gray" fontSize="10" fontFamily="monospace">18:00</text>
                        <text x="950" y="490" fill="gray" fontSize="10" fontFamily="monospace">24:00</text>

                        {/* Y Axis Grid Lines & Labels */}
                        {[1, 2, 3, 4].map(i => (
                            <g key={i}>
                                <line x1="0" y1={i * 100} x2="1000" y2={i * 100} stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4,4" />
                                <text x="10" y={i * 100 - 5} fill="gray" fontSize="10" fontFamily="monospace">{120 - i * 24}</text>
                            </g>
                        ))}

                        {/* CPU Line (Cyan, Solid) */}
                        {activeSeries.cpu && (
                            <path
                                d={getPath('cpu', 500, 1000)}
                                fill="none"
                                stroke="#06b6d4"
                                strokeWidth="3"
                                strokeLinecap="round"
                                className="drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                            />
                        )}

                        {/* GPU Line (Magenta, Solid) */}
                        {activeSeries.gpu && (
                            <path
                                d={getPath('gpu', 500, 1000)}
                                fill="none"
                                stroke="#d946ef"
                                strokeWidth="3"
                                strokeLinecap="round"
                                className="drop-shadow-[0_0_8px_rgba(217,70,239,0.8)]"
                            />
                        )}

                        {/* NET Line (Yellow, Dashed) */}
                        {activeSeries.net && (
                            <path
                                d={getPath('net', 500, 1000)}
                                fill="none"
                                stroke="#facc15"
                                strokeWidth="2"
                                strokeDasharray="6,4"
                                className="drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]"
                            />
                        )}

                        {/* Cursor Interaction */}
                        {hoveredIndex !== null && (
                            <g>
                                <line
                                    x1={(hoveredIndex / (MOCK_DATA_POINTS - 1)) * 1000}
                                    y1="0"
                                    x2={(hoveredIndex / (MOCK_DATA_POINTS - 1)) * 1000}
                                    y2="500"
                                    stroke="white"
                                    strokeWidth="1"
                                    strokeDasharray="4,4"
                                    opacity="0.5"
                                />
                                {activeSeries.cpu && <circle cx={(hoveredIndex / (MOCK_DATA_POINTS - 1)) * 1000} cy={500 - (data[hoveredIndex].cpu / 120) * 500} r="4" fill="black" stroke="#06b6d4" strokeWidth="2" />}
                                {activeSeries.gpu && <circle cx={(hoveredIndex / (MOCK_DATA_POINTS - 1)) * 1000} cy={500 - (data[hoveredIndex].gpu / 120) * 500} r="4" fill="black" stroke="#d946ef" strokeWidth="2" />}
                                {activeSeries.net && <circle cx={(hoveredIndex / (MOCK_DATA_POINTS - 1)) * 1000} cy={500 - (data[hoveredIndex].net / 120) * 500} r="4" fill="black" stroke="#facc15" strokeWidth="2" />}
                            </g>
                        )}
                    </svg>

                    {/* Tooltip */}
                    {hoveredIndex !== null && (
                        <div className="absolute top-4 right-4 bg-black/90 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-2xl z-50 pointer-events-none">
                            <div className="text-[10px] text-zinc-500 font-mono mb-2">TIME POINT {data[hoveredIndex].id}</div>
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
