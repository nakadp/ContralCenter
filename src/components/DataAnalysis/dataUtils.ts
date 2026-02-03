export const DATA_CONFIG: Record<string, { label: string, color: string }> = {
    'cpu_util': { label: 'CPU Usage', color: '#06b6d4' }, // Cyan
    'gpu_util': { label: 'GPU Usage', color: '#d946ef' }, // Fuchsia
    'gpu_temp': { label: 'GPU Temp', color: '#ef4444' }, // Red
    'net_up': { label: 'Up Speed', color: '#22c55e' }, // Green
    'net_down': { label: 'Down Speed', color: '#eab308' }, // Yellow
    'in_temp': { label: 'In Temp', color: '#f97316' }, // Orange
    'in_hum': { label: 'In Hum', color: '#3b82f6' }, // Blue
    'in_light': { label: 'In Light', color: '#8b5cf6' }, // Violet
    'in_co2': { label: 'In CO2', color: '#6366f1' }, // Indigo
    'pc_pwr': { label: 'PC Pwr', color: '#ec4899' }, // Pink
    'out_light': { label: 'Out Light', color: '#f59e0b' }, // Amber
    'out_wind': { label: 'Out Wind', color: '#14b8a6' }, // Teal
    'pv_pwr': { label: 'PV Pwr', color: '#84cc16' }, // Lime
    'pv_volt': { label: 'PV Volt', color: '#10b981' }, // Emerald
    'pv_curr': { label: 'PV Curr', color: '#0ea5e9' }, // Sky
    'wind_pwr': { label: 'Wind Pwr', color: '#a855f7' }, // Purple
};

export type DataPoint = {
    timestamp: number;
    [key: string]: number;
};

export const generateData = (endTime: number, range: number, resolution: number): DataPoint[] => {
    // Aligned to resolution for stability
    const alignedEnd = Math.floor(endTime / resolution) * resolution;
    const startTime = alignedEnd - range - resolution;

    // Safety cap
    const count = Math.ceil((range + resolution) / resolution) + 2;
    const safeCount = Math.min(count, 5000);

    const data: DataPoint[] = [];

    for (let i = 0; i < safeCount; i++) {
        const t = startTime + (i * resolution);
        if (t > endTime) break;

        const tf = t / 300000; // Time factor

        const point: DataPoint = { timestamp: t };

        // Generate mock values for all known keys
        Object.keys(DATA_CONFIG).forEach((key, idx) => {
            // Unique phase shift based on index to make lines look different
            const phase = idx * 13.7;
            // Mix of sin/cos for realism
            const raw = Math.sin(tf + phase) * 30 + Math.cos(tf * 0.5 + phase * 2) * 20 + 50;
            // Add some noise
            const noise = (Math.sin(t / 10000 * (idx + 1)) * 5);

            point[key] = Math.max(0, Math.min(100, raw + noise));
        });

        data.push(point);
    }
    return data;
};
