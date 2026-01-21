import React from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { Mouse, Keyboard, Server, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

// Define the custom data type for this node
interface PeripheralNodeData extends Record<string, unknown> {
    label: string;
    icon: string;
}


const PeripheralNode = ({ data, selected }: NodeProps<Node<PeripheralNodeData>>) => {
    // Map icon string to component
    const getIcon = () => {
        const color = selected ? '#ff00e5' : '#00f2ff';
        const shadowColor = selected ? 'rgba(255, 0, 229, 0.8)' : 'rgba(0, 242, 255, 0.8)';
        const commonProps = {
            className: "w-20 h-20 transition-colors duration-300",
            style: {
                filter: `drop-shadow(0 0 10px ${shadowColor})`,
                strokeWidth: 1.5,
                color: color
            }
        };

        switch (data.icon) {
            case 'mouse': return <Mouse {...commonProps} />;
            case 'keyboard': return <Keyboard {...commonProps} />;
            case 'dock': return <Server {...commonProps} />;
            default: return <HelpCircle {...commonProps} />;
        }
    };

    return (
        <div className="flex flex-col items-center gap-3 relative group z-10">

            {/* Container for the Glass Box */}
            <div className="relative w-32 h-32">

                {/* 1. The Moving Gradient Border Frame */}
                <motion.div
                    animate={{
                        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className={`absolute inset-0 rounded-[2rem] p-[4px] bg-[length:200%_200%] transition-colors duration-500`}
                    style={{
                        backgroundImage: selected
                            ? 'linear-gradient(to bottom right, #ff00e5, #ffffff, #ff00e5)'
                            : 'linear-gradient(to bottom right, #00f2ff, #ffffff, #00f2ff)'
                    }}
                >
                    {/* 2. Combined Shadow Layer */}
                    <motion.div
                        animate={{
                            boxShadow: selected
                                ? "0 0 36px 9px rgba(255, 0, 229, 0.75), 0 0 108px 27px rgba(255, 0, 229, 0.45)"
                                : "0 0 24px 6px rgba(0, 242, 255, 0.5), 0 0 72px 18px rgba(0, 242, 255, 0.3)"
                        }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 rounded-[2rem] opacity-90"
                    />

                    {/* 3. Inner Dark Core */}
                    <div className="w-full h-full rounded-[1.7rem] bg-[#050505]/90 backdrop-blur-2xl flex items-center justify-center overflow-hidden relative border border-white/5">

                        {/* Internal Light Fog */}
                        <div
                            className="absolute inset-[-50%] blur-[30px] mix-blend-screen opacity-60 pointer-events-none transition-colors duration-500"
                            style={{
                                background: selected
                                    ? 'radial-gradient(circle at center, rgba(255,0,229,0.4) 0%, transparent 65%)'
                                    : 'radial-gradient(circle at center, rgba(0,242,255,0.4) 0%, transparent 65%)'
                            }}
                        />

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
                        className={`!relative !w-3 !h-3 rounded-full !border-[1.5px] transition-all duration-300 hover:scale-150`}
                        style={{
                            left: 'auto',
                            right: 'auto',
                            transform: 'none',
                            borderColor: selected ? '#ff00e5' : '#00f2ff',
                            backgroundColor: selected ? '#ff00e5' : '#00f2ff',
                            boxShadow: selected ? '0 0 10px #ff00e5' : '0 0 10px #00f2ff'
                        }}
                    />
                </div>
            </div>

            {/* Bottom Text */}
            <div className="text-center leading-none mt-4">
                <p
                    className="text-[13px] font-bold text-white tracking-[0.1em] transition-all duration-300"
                    style={{ filter: selected ? 'drop-shadow(0 0 8px rgba(255,0,229,0.8))' : 'drop-shadow(0 0 8px rgba(0,242,255,0.8))' }}
                >
                    {data.label}
                </p>
                <p
                    className={`text-[10px] font-mono tracking-wider mt-1 scale-90 transition-colors duration-300 ${selected ? 'text-fuchsia-200/80' : 'text-cyan-200/80'}`}
                >
                    (Connected)
                </p>
            </div>
        </div>
    );
};

export default PeripheralNode;
