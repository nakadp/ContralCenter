import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { Monitor } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';

// Define data interface
interface HostNodeData extends Record<string, unknown> {
    label: string;
    ports?: string[];
}

// v9.0 Variants: "Straight Flow"
// 1. Flowing Gradient Border Animation
// Strong movement of the light beam around the border
const strokeFlowVariants: Variants = {
    animate: {
        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        transition: { duration: 3, repeat: Infinity, ease: "linear" }
    }
};

// 2. Pulse Glow (Ambient)
// Staged blur levels for depth - Increased by 20%
const ambientGlowVariants: Variants = {
    animate: {
        boxShadow: [
            "0 0 24px 6px rgba(0, 242, 255, 0.5), 0 0 72px 18px rgba(0, 242, 255, 0.3)",
            "0 0 24px 6px rgba(255, 0, 229, 0.5), 0 0 72px 18px rgba(255, 0, 229, 0.3)",
            "0 0 24px 6px rgba(0, 242, 255, 0.5), 0 0 72px 18px rgba(0, 242, 255, 0.3)"
        ],
        transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
    }
};

const HostNode = ({ data, selected }: NodeProps<Node<HostNodeData>>) => {
    const ports = data.ports || ['port-0', 'port-1', 'port-2'];

    // Boosted glow for selected state (+50% range and intensity)
    const selectedGlowVariants: Variants = {
        animate: {
            boxShadow: [
                "0 0 36px 9px rgba(0, 242, 255, 0.75), 0 0 108px 27px rgba(0, 242, 255, 0.45)",
                "0 0 36px 9px rgba(255, 0, 229, 0.75), 0 0 108px 27px rgba(255, 0, 229, 0.45)",
                "0 0 36px 9px rgba(0, 242, 255, 0.75), 0 0 108px 27px rgba(0, 242, 255, 0.45)"
            ],
            transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
        }
    };

    return (
        <div className="flex flex-col items-center gap-3 relative group z-10">

            {/* Container for the Glass Box */}
            {/* Standard upright orientation (Square/Squircle) */}
            <div className="relative w-32 h-32">

                {/* 1. The Moving Gradient Border Frame */}
                <motion.div
                    variants={strokeFlowVariants}
                    animate="animate"
                    // p-[4px] for a thick, distinct "Beam" border
                    className="absolute inset-0 rounded-[2rem] p-[4px] bg-gradient-to-br from-[#00f2ff] via-[#ffffff] to-[#ff00e5] bg-[length:200%_200%]"
                >
                    {/* 2. Combined Shadow Layer (Applied to the frame) */}
                    <motion.div
                        initial="animate"
                        animate="animate"
                        variants={selected ? selectedGlowVariants : ambientGlowVariants}
                        className="absolute inset-0 rounded-[2rem] opacity-90"
                    />

                    {/* 3. Inner Dark Core (The actual content box) */}
                    {/* Matches the border radius minus padding for flush fit */}
                    <div className="w-full h-full rounded-[1.7rem] bg-[#050505]/90 backdrop-blur-2xl flex items-center justify-center overflow-hidden relative border border-white/5">

                        {/* Internal Light Fog - Radial Source */}
                        <div className="absolute inset-[-50%] bg-[radial-gradient(circle_at_center,rgba(0,242,255,0.4)_0%,transparent_65%)] blur-[30px] mix-blend-screen opacity-60 pointer-events-none" />

                        {/* Top Sheen */}
                        <div className="absolute top-0 w-full h-[45%] bg-gradient-to-b from-white/20 to-transparent rounded-t-[1.7rem] pointer-events-none" />

                        {/* 4. Monitor Icon - STRAIGHT & Clean */}
                        <div className="relative z-10 w-full h-full flex items-center justify-center">
                            <Monitor
                                className="w-20 h-20 text-[#00f2ff]"
                                style={{
                                    filter: "drop-shadow(0 0 10px rgba(0, 242, 255, 0.8))",
                                    strokeWidth: 1.5
                                }}
                            />
                        </div>
                    </div>
                </motion.div>

                {/* 5. Extruded Ports */}
                <div className="absolute top-0 h-full -right-6 flex flex-col justify-center gap-4 py-6 z-30">
                    {ports.map((portId) => (
                        <Handle
                            key={portId}
                            type="source"
                            position={Position.Right}
                            id={portId}
                            // Important: Stop propagation to prevent selecting the node when clicking connection points if needed
                            // But here we just want visual styles
                            className="!relative !w-3 !h-3 rounded-full !border-[1.5px] border-[#00f2ff] bg-[#00f2ff] shadow-[0_0_10px_#00f2ff] transition-transform hover:scale-150"
                            style={{ right: 'auto', top: 'auto', transform: 'none' }}
                        />
                    ))}
                </div>
            </div>

            {/* Bottom Text */}
            <div className="text-center leading-none mt-4">
                <p className="text-[13px] font-bold text-white tracking-[0.1em] drop-shadow-[0_0_8px_rgba(0,242,255,0.8)]">
                    HOST PC
                </p>
                <p className="text-[10px] text-cyan-200/80 font-mono tracking-wider mt-1 scale-90">
                    (Aether Core)
                </p>
            </div>
        </div>
    );
};

export default HostNode;
