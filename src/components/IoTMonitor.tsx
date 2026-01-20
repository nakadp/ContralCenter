import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useStore } from '../store';
import { Card } from './Card';

export function IoTMonitor() {
    // Mock Data for Visual Reference - "Perfect Wave"
    const data = [
        { power: 30 }, { power: 40 }, { power: 35 }, { power: 50 },
        { power: 45 }, { power: 60 }, { power: 55 }, { power: 70 },
        { power: 65 }, { power: 80 }, { power: 75 }, { power: 60 },
        { power: 50 }, { power: 65 }, { power: 55 }, { power: 45 }
    ];

    return (
        <Card className="h-full flex flex-col p-4 relative overflow-hidden border-white/10 bg-white/5">
            {/* Header */}
            <div className="flex items-center justify-between pointer-events-none mb-2 z-10 relative">
                <div className="text-[clamp(9px,0.7vw,11px)] font-bold text-white/50 tracking-[0.2em] uppercase">Telemetry</div>
                <div className="text-[9px] font-mono text-white/40">Battery Level: 85%</div>
            </div>

            <div className="flex-1 min-h-0 w-full relative -mx-4 -mb-4">
                {/* Background Grid Lines */}
                {/* <div className="absolute inset-0 z-0 opacity-20 pointer-events-none"
                    style={{ backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '100% 10px' }}
                /> */}

                {/* <div className="absolute inset-0 bg-gradient-to-t from-[#ff00e5]/5 to-transparent z-0" /> */}
                <ResponsiveContainer width="120%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorWave" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#00f2ff" />
                                <stop offset="100%" stopColor="#ff00e5" />
                            </linearGradient>
                            <linearGradient id="fillWave" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#00f2ff" stopOpacity={0.1} />
                                <stop offset="100%" stopColor="#ff00e5" stopOpacity={0.3} />
                            </linearGradient>
                        </defs>
                        <Tooltip cursor={false} content={<></>} />
                        <Area
                            type="monotone"
                            dataKey="power"
                            stroke="url(#colorWave)"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#fillWave)"
                            isAnimationActive={true}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
}
