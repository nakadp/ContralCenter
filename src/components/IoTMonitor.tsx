import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useStore } from '../store';
import { Card } from './Card';
import { Activity } from 'lucide-react';

export function IoTMonitor() {
    const { telemetryHistory } = useStore();

    // Data for charts
    const data = telemetryHistory.map(d => ({
        timestamp: d.timestamp,
        cpu: d.cpu_load,
        power: d.power,
        temp: d.temperature
    }));

    return (
        <Card className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-accent-magenta" />
                    <h3 className="text-lg font-bold text-white">System Vitality</h3>
                </div>
                <div className="flex gap-4 text-xs">
                    <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-accent-cyan" />
                        <span className="text-gray-400">CPU Load</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-accent-magenta" />
                        <span className="text-gray-400">Power Draw</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00F2FF" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#00F2FF" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#FF00E5" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#FF00E5" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis
                            dataKey="timestamp"
                            stroke="rgba(255,255,255,0.3)"
                            tick={{ fontSize: 10 }}
                            tickLine={false}
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            stroke="rgba(255,255,255,0.3)"
                            tick={{ fontSize: 10 }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', backdropFilter: 'blur(10px)' }}
                            itemStyle={{ fontSize: '12px' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="cpu"
                            stroke="#00F2FF"
                            fillOpacity={1}
                            fill="url(#colorCpu)"
                            isAnimationActive={false}
                        />
                        <Area
                            type="monotone"
                            dataKey="power"
                            stroke="#FF00E5"
                            fillOpacity={1}
                            fill="url(#colorPower)"
                            isAnimationActive={false}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
}
