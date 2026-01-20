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
        <aside className="w-20 h-full border-r border-white/5 bg-black/20 backdrop-blur-xl flex flex-col items-center z-40 py-6 gap-8">
            {/* Logo Icon */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-cyan/20 to-accent-magenta/20 flex items-center justify-center border border-white/10 animate-pulse">
                <div className="w-4 h-4 rounded-full bg-accent-cyan shadow-[0_0_10px_rgba(0,242,255,0.8)]" />
            </div>

            <nav className="flex-1 w-full flex flex-col items-center space-y-4">
                {NAV_ITEMS.map((item) => (
                    <motion.button
                        key={item.id}
                        onClick={() => setActive(item.id)}
                        className="group relative flex items-center justify-center w-12 h-12"
                        whileHover={{ scale: 1.1, rotateX: 10, rotateY: 10, z: 20 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    >
                        {active === item.id && (
                            <motion.div
                                layoutId="active-nav"
                                className="absolute inset-0 bg-accent-cyan/10 border-l-2 border-accent-cyan rounded-r-lg shadow-[0_0_15px_rgba(0,242,255,0.2)] backdrop-blur-sm"
                                initial={false}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                        )}

                        <item.icon
                            className={cn(
                                "w-6 h-6 z-10 transition-all duration-300",
                                active === item.id
                                    ? "text-accent-cyan drop-shadow-[0_0_5px_rgba(0,242,255,0.8)]"
                                    : "text-gray-500 group-hover:text-gray-300"
                            )}
                        />

                        {/* Hover Tooltip (Optional, forUX) */}
                        <div className="absolute left-14 px-2 py-1 bg-black/80 border border-white/10 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                            {item.label}
                        </div>
                    </motion.button>
                ))}
            </nav>

            <div className="mt-auto flex flex-col gap-4">
                <button className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                    <Settings className="w-5 h-5 text-gray-500" />
                </button>
                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e] animate-pulse mx-auto" />
            </div>
        </aside>
    );
}
