import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { Card } from './Card';

export function IoTMonitor() {
    // Mock Data for "Telemetry" Waveform
    const data = [
        { value: 40 }, { value: 35 }, { value: 55 }, { value: 45 },
        { value: 70 }, { value: 60 }, { value: 85 }, { value: 65 },
        { value: 50 }, { value: 60 }, { value: 75 }, { value: 60 },
        { value: 40 }, { value: 30 }, { value: 45 }, { value: 55 }
    ];

    return (
        <Card className="flex flex-col p-4 gap-3 bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl shadow-xl relative overflow-hidden group w-full min-h-[160px] flex-1">

            {/* Header Section: Title & Battery */}
            <div className="flex justify-between items-start z-20 relative">
                <div className="flex flex-col gap-0.5">
                    <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest border-b border-white/5 pb-1 mb-1">
                        Telemetry
                    </div>
                </div>
                <div className="text-[10px] text-white/60 font-mono">
                    Battery Level: <span className="text-accent-cyan">85%</span>
                </div>
            </div>

            {/* Chart Container - Fills remaining space */}
            <div className="flex-1 w-full relative min-h-0">
                {/* Grid Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

                <div className="absolute inset-0 bg-gradient-to-t from-accent-magenta/5 via-transparent to-transparent opacity-50 pointer-events-none" />

                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="telemetryGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#ff00e5" stopOpacity={0.6} />
                                <stop offset="100%" stopColor="#ff00e5" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#ff00e5"
                            strokeWidth={3}
                            fill="url(#telemetryGradient)"
                            isAnimationActive={true}
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
}
