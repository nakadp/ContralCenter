import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Lock } from 'lucide-react';
import { Button } from './Button';

interface SafetyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    deviceName: string;
    isCritical: boolean; // Triggers Red/Magenta warning
}

export function SafetyModal({ isOpen, onClose, onConfirm, deviceName, isCritical }: SafetyModalProps) {
    if (!isOpen) return null;

    const borderColor = isCritical ? 'border-accent-magenta' : 'border-accent-cyan';
    const glowColor = isCritical ? 'shadow-[0_0_50px_rgba(255,0,229,0.5)]' : 'shadow-[0_0_30px_rgba(0,242,255,0.3)]';
    const textColor = isCritical ? 'text-accent-magenta' : 'text-accent-cyan';

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className={`relative w-[400px] bg-black/60 border-2 ${borderColor} ${glowColor} backdrop-blur-xl rounded-xl p-6 overflow-hidden`}
                >
                    {/* Animated Background Grid */}
                    <div className="absolute inset-0 z-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />

                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className={`p-4 rounded-full bg-white/5 border ${borderColor} mb-4`}>
                            {isCritical ? <Lock className="w-8 h-8 text-accent-magenta" /> : <AlertTriangle className="w-8 h-8 text-accent-cyan" />}
                        </div>

                        <h3 className={`text-xl font-bold font-mono tracking-widest ${textColor} mb-2 uppercase`}>
                            {isCritical ? 'Security Override' : 'Device Control'}
                        </h3>

                        <p className="text-gray-300 text-sm mb-6">
                            You are about to modify state for: <br />
                            <span className="font-bold text-white">{deviceName}</span>
                            {isCritical && (
                                <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded text-red-200 text-xs font-mono glitch-text">
                                    CRITICAL SYSTEM COMPONENT DETECTED
                                </div>
                            )}
                        </p>

                        <div className="flex gap-4 w-full">
                            <Button variant="ghost" className="flex-1" onClick={onClose}>
                                CANCEL
                            </Button>
                            <button
                                onClick={() => {
                                    // Trigger visually
                                    onConfirm();
                                }}
                                className={`flex-1 px-4 py-2 font-mono font-bold text-black uppercase transition-all
                                    ${isCritical
                                        ? 'bg-accent-magenta hover:bg-accent-magenta/80 shadow-[0_0_20px_rgba(255,0,229,0.4)]'
                                        : 'bg-accent-cyan hover:bg-accent-cyan/80 shadow-[0_0_20px_rgba(0,242,255,0.4)]'
                                    } rounded`}
                            >
                                CONFIRM
                            </button>
                        </div>
                    </div>

                    {/* CSS Glitch Keyframes (Inline for scoped effect) */}
                    <style>{`
                        @keyframes glitch-skew {
                            0% { transform: skew(0deg); }
                            20% { transform: skew(-2deg); }
                            40% { transform: skew(2deg); }
                            60% { transform: skew(-1deg); }
                            80% { transform: skew(1deg); }
                            100% { transform: skew(0deg); }
                        }
                        .glitch-text {
                            animation: glitch-skew 0.3s infinite;
                        }
                    `}</style>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
