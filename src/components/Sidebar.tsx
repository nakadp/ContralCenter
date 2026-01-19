import { Monitor, Cpu, BarChart2, Settings, Zap } from "lucide-react";
import { useState } from "react";
import { cn } from "../lib/utils";
import { motion } from "framer-motion";

const NAV_ITEMS = [
    { icon: Monitor, label: "Topology", id: "topology" },
    { icon: Cpu, label: "Devices", id: "devices" },
    { icon: Zap, label: "Automation", id: "automation" },
    { icon: BarChart2, label: "Analytics", id: "analytics" },
    { icon: Settings, label: "Settings", id: "settings" },
];

export function Sidebar() {
    const [active, setActive] = useState("topology");

    return (
        <aside className="w-64 h-full border-r border-white/5 bg-white/5 backdrop-blur-xl flex flex-col z-20">
            <div className="p-8">
                <h1 className="text-2xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan to-accent-magenta animate-pulse">
                    AETHER
                </h1>
                <p className="text-xs text-gray-500 mt-1 tracking-wider uppercase">Command Center</p>
            </div>

            <nav className="flex-1 px-4 space-y-2">
                {NAV_ITEMS.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActive(item.id)}
                        className={cn(
                            "flex items-center w-full px-4 py-3 rounded-lg transition-all duration-300 group relative overflow-hidden",
                            active === item.id
                                ? "text-accent-cyan bg-accent-cyan/10 border border-accent-cyan/20 shadow-[0_0_15px_rgba(0,242,255,0.1)]"
                                : "text-gray-400 hover:text-white hover:bg-white/5"
                        )}
                    >
                        {active === item.id && (
                            <motion.div
                                layoutId="active-nav"
                                className="absolute inset-0 bg-accent-cyan/5"
                                initial={false}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                        )}
                        <item.icon className={cn("w-5 h-5 mr-3 z-10", active === item.id && "drop-shadow-[0_0_8px_rgba(0,242,255,0.8)]")} />
                        <span className="z-10 font-medium tracking-wide">{item.label}</span>
                    </button>
                ))}
            </nav>

            <div className="p-4 border-t border-white/5">
                <div className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-black/20 border border-white/5">
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse" />
                    <span className="text-xs text-gray-400 font-mono">SYSTEM ONLINE</span>
                </div>
            </div>
        </aside>
    );
}
