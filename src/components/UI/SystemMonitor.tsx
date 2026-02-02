import React, { useEffect, useState } from 'react';
import { Cpu, ArrowDown, ArrowUp, Zap, Network } from 'lucide-react';
import { motion } from 'framer-motion';
import { listen } from '@tauri-apps/api/event';

interface SystemStats {
    cpu_usage: number;
    cpu_temp: number;
    gpu_usage: number;
    gpu_temp: number;
    net_down: number;
    net_up: number;
}

const MonitorItem = ({
    icon: Icon,
    label,
    value,
    extra,
    isNet = false
}: {
    icon?: any;
    label: string;
    value: string;
    extra?: string;
    isNet?: boolean;
}) => (
    <div className="relative group">
        {/* 1. Breathing Glow Effect */}
        <motion.div
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -inset-2 bg-aether-cyan/30 blur-xl rounded-lg pointer-events-none"
        />

        {/* 2. Thin Moving Gradient Border Frame */}
        {/* Reduced padding to 1px for thinner border */}
        <motion.div
            animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="relative rounded-xl p-[1px] bg-[length:200%_200%]"
            style={{
                backgroundImage: 'linear-gradient(to bottom right, #00f2ff, #ffffff, #00f2ff)'
            }}
        >
            {/* Inner Dark Core */}
            {/* Removed fixed height/width, added reasonable padding */}
            <div className="bg-[#050505]/90 backdrop-blur-md rounded-[0.7rem] px-4 py-2 flex items-center gap-3 overflow-hidden relative min-w-max">

                {/* Glossy sheen */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

                {/* Icon */}
                <div className="relative z-10 shrink-0">
                    <div className="p-1.5 rounded-lg bg-white/5 shadow-inner">
                        <Icon className="w-5 h-5 text-aether-cyan drop-shadow-[0_0_8px_rgba(0,242,255,0.6)]" />
                    </div>
                </div>

                {/* Content */}
                <div className={`relative z-10 flex items-center gap-4 w-full font-mono text-white ${isNet ? 'justify-between' : ''}`}>
                    <span className="text-white/60 font-bold text-xs tracking-wider uppercase hidden sm:inline-block">{label}</span>

                    {isNet ? (
                        <div className="flex items-center gap-4 text-sm whitespace-nowrap">
                            <div className="flex items-center gap-1.5 text-emerald-400">
                                <ArrowDown className="w-3.5 h-3.5" />
                                <span className="text-base font-medium">{value}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-cyan-400">
                                <ArrowUp className="w-3.5 h-3.5" />
                                <span className="text-base font-medium">{extra}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-baseline gap-3 whitespace-nowrap">
                            <span className="text-xl font-medium tracking-wide">{value}</span>
                            {extra && <span className="text-base font-medium text-white/70">{extra}</span>}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    </div>
);

// Format bytes to human readable string
const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0B/s';
    const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(1)) + ' ' + sizes[i];
};

export default function SystemMonitor() {
    const [stats, setStats] = useState<SystemStats>({
        cpu_usage: 0,
        cpu_temp: 0,
        gpu_usage: 0,
        gpu_temp: 0,
        net_down: 0,
        net_up: 0
    });

    useEffect(() => {
        let unlisten: (() => void) | undefined;

        const setupListener = async () => {
            unlisten = await listen<SystemStats>('system-stats', (event) => {
                setStats(event.payload);
            });
        };

        setupListener();

        return () => {
            if (unlisten) unlisten();
        };
    }, []);

    return (
        <div className="absolute top-6 right-6 flex items-center gap-4 z-50 select-none">
            <MonitorItem
                icon={Cpu}
                label="CPU"
                value={`${Math.round(stats.cpu_usage)}%`}
                extra={stats.cpu_temp > 0 ? `${Math.round(stats.cpu_temp)}°C` : undefined}
            />
            <MonitorItem
                icon={Zap}
                label="GPU"
                value={`${Math.round(stats.gpu_usage)}%`}
                extra={stats.gpu_temp > 0 ? `${Math.round(stats.gpu_temp)}°C` : undefined}
            />
            <MonitorItem
                icon={Network}
                label="NET"
                value={formatBytes(stats.net_down)}
                extra={formatBytes(stats.net_up)}
                isNet={true}
            />
        </div>
    );
}
