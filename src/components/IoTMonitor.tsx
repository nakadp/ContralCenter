import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';
// import { useStore } from '../store';
// import { Card } from './Card';

export function IoTMonitor() {
    // Mock Data for Visual Reference - "Perfect Wave"
    const data = [
        { power: 30 }, { power: 40 }, { power: 35 }, { power: 50 },
        { power: 45 }, { power: 60 }, { power: 55 }, { power: 70 },
        { power: 65 }, { power: 80 }, { power: 75 }, { power: 60 },
        { power: 50 }, { power: 65 }, { power: 55 }, { power: 45 }
    ];

    return (
        <div className="h-full flex flex-col relative overflow-hidden ring-0 bg-transparent flex-1 w-full">
            {/* Header is handled in App.tsx now, removing internal header to match design flow */}
            {/* However, if we need a label inside, we can add it overlaying. 
                The prompt says "Adaptive Telemetry...". 
                I will remove the internal "Telemetry" header as the App.tsx header covers the whole "Device Details".
                But wait, "Device Details" is the top card. This Telemetry is inside that card. 
                So I should probably keep it clean.
            */}

            <div className="flex-1 w-full h-full relative">
                {/* Background Grid Lines (10% interval) */}
                <div className="absolute inset-0 pointer-events-none"
                    style={{
                        backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)',
                        backgroundSize: '100% 10%'
                    }}
                />

                <ResponsiveContainer width="102%" height="102%" className="-ml-1 -mt-1">
                    <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorWave" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#ff00e5" stopOpacity={0.8} />
                                <stop offset="100%" stopColor="#ff00e5" stopOpacity={0.2} />
                            </linearGradient>
                            <linearGradient id="fillWave" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#ff00e5" stopOpacity={0.3} />
                                <stop offset="100%" stopColor="transparent" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Tooltip cursor={false} content={<></>} />
                        {/* XAxis/YAxis hidden for clean look */}
                        <Area
                            type="monotone"
                            dataKey="power"
                            stroke="#ff00e5"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#fillWave)"
                            isAnimationActive={true}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
