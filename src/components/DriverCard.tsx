import { motion } from "framer-motion";
import { Play, CheckCircle } from "lucide-react";
import { clsx } from "clsx";
import { DriverInfo, useStore } from "../store";

interface DriverCardProps {
    driver: DriverInfo;
}

export function DriverCard({ driver }: DriverCardProps) {
    const launchDriver = useStore((state) => state.launchDriver);

    return (
        <motion.div
            whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.08)" }}
            className={clsx(
                "relative p-4 rounded-xl border transition-all duration-300",
                // Liquid Glass Base
                "backdrop-blur-2xl bg-white/5 border-white/10",
                driver.isRunning ? "shadow-[0_0_15px_rgba(34,197,94,0.15)]" : "shadow-none"
            )}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {/* Status Dot */}
                    <div className="relative flex h-3 w-3">
                        {driver.isRunning && (
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        )}
                        <span
                            className={clsx(
                                "relative inline-flex rounded-full h-3 w-3",
                                driver.isRunning ? "bg-green-500" : "bg-red-500"
                            )}
                        ></span>
                    </div>

                    <div>
                        <h4 className="text-white font-medium text-sm">{driver.name}</h4>
                        <p className="text-xs text-gray-400">
                            {driver.isRunning ? "Active & Running" : "Process Stopped"}
                        </p>
                    </div>
                </div>

                {!driver.isRunning && (
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => launchDriver(driver.path)}
                        className="p-2 rounded-full bg-accent-cyan/10 text-accent-cyan hover:bg-accent-cyan/20 transition-colors"
                        title="Launch Driver"
                    >
                        <Play className="w-4 h-4 fill-current" />
                    </motion.button>
                )}

                {driver.isRunning && (
                    <CheckCircle className="w-5 h-5 text-green-500 opacity-50" />
                )}
            </div>

            {/* Decorative Refraction Gradient (Subtle) */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/5 to-transparent opacity-20 pointer-events-none" />
        </motion.div>
    );
}
