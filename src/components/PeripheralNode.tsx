import React from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { Mouse, Keyboard, Server, HelpCircle } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';

// Define the custom data type for this node
interface PeripheralNodeData extends Record<string, unknown> {
    label: string;
    icon: string;
}

// v9.0 Variants: "Straight Flow" (Copied from HostNode)
const strokeFlowVariants: Variants = {
    animate: {
        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        transition: { duration: 3, repeat: Infinity, ease: "linear" }
    }
};

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

const PeripheralNode = ({ data }: NodeProps<Node<PeripheralNodeData>>) => {
    // Map icon string to component
    const getIcon = () => {
        switch (data.icon) {
            case 'mouse': return <Mouse className="w-20 h-20 text-[#00f2ff]" style={{ filter: "drop-shadow(0 0 10px rgba(0, 242, 255, 0.8))", strokeWidth: 1.5 }} />;
            case 'keyboard': return <Keyboard className="w-20 h-20 text-[#00f2ff]" style={{ filter: "drop-shadow(0 0 10px rgba(0, 242, 255, 0.8))", strokeWidth: 1.5 }} />;
            case 'dock': return <Server className="w-20 h-20 text-[#00f2ff]" style={{ filter: "drop-shadow(0 0 10px rgba(0, 242, 255, 0.8))", strokeWidth: 1.5 }} />;
            default: return <HelpCircle className="w-20 h-20 text-[#00f2ff]" style={{ filter: "drop-shadow(0 0 10px rgba(0, 242, 255, 0.8))", strokeWidth: 1.5 }} />;
        }
    };

    return (
        <div className="flex flex-col items-center gap-3 relative group z-10">

            {/* Container for the Glass Box */}
            <div className="relative w-32 h-32">

                {/* 1. The Moving Gradient Border Frame */}
                <motion.div
                    variants={strokeFlowVariants}
                    animate="animate"
                    className="absolute inset-0 rounded-[2rem] p-[4px] bg-gradient-to-br from-[#00f2ff] via-[#ffffff] to-[#ff00e5] bg-[length:200%_200%]"
                >
                    {/* 2. Combined Shadow Layer */}
                    <motion.div
                        variants={ambientGlowVariants}
                        animate="animate"
                        className="absolute inset-0 rounded-[2rem] opacity-90"
                    />

                    {/* 3. Inner Dark Core */}
                    <div className="w-full h-full rounded-[1.7rem] bg-[#050505]/90 backdrop-blur-2xl flex items-center justify-center overflow-hidden relative border border-white/5">

                        {/* Internal Light Fog */}
                        <div className="absolute inset-[-50%] bg-[radial-gradient(circle_at_center,rgba(0,242,255,0.4)_0%,transparent_65%)] blur-[30px] mix-blend-screen opacity-60 pointer-events-none" />

                        {/* Top Sheen */}
                        <div className="absolute top-0 w-full h-[45%] bg-gradient-to-b from-white/20 to-transparent rounded-t-[1.7rem] pointer-events-none" />

                        {/* 4. Icon */}
                        <div className="relative z-10 w-full h-full flex items-center justify-center">
                            {getIcon()}
                        </div>
                    </div>
                </motion.div>

                {/* 5. Connection Handles (Left Side) - Updated to Left */}
                <div className="absolute top-1/2 -translate-y-1/2 -left-6 flex flex-col justify-center items-center z-30">
                    <Handle
                        type="target"
                        position={Position.Left}
                        id="port-0"
                        className="!relative !w-3 !h-3 rounded-full !border-[1.5px] border-[#00f2ff] bg-[#00f2ff] shadow-[0_0_10px_#00f2ff] transition-transform hover:scale-150"
                        style={{ left: 'auto', right: 'auto', transform: 'none' }}
                    />
                </div>
            </div>

            {/* Bottom Text */}
            <div className="text-center leading-none mt-4">
                <p className="text-[13px] font-bold text-white tracking-[0.1em] drop-shadow-[0_0_8px_rgba(0,242,255,0.8)]">
                    {data.label}
                </p>
                <p className="text-[10px] text-cyan-200/80 font-mono tracking-wider mt-1 scale-90">
                    (Connected)
                </p>
            </div>
        </div>
    );
};

export default PeripheralNode;
