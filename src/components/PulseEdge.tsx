import React, { memo } from 'react';
import { getSmoothStepPath, type EdgeProps } from '@xyflow/react';
import { motion } from 'framer-motion';

const PulseEdge = ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data }: EdgeProps) => {
    // 1. Generate rounded smooth step path
    const [edgePath] = getSmoothStepPath({
        sourceX, sourceY, sourcePosition,
        targetX, targetY, targetPosition,
        borderRadius: 40, // Industrial rounded corners
    });

    // 2. Data-driven logic
    // Casting data.load to number, defaulting to 27 (idling) if undefined
    const load = typeof data?.load === 'number' ? data.load : 27;
    // Higher load = Faster flow (lower duration)
    const duration = Math.max(1, 4.0 - (load / 100) * 3);

    const isHighLoad = load > 80;
    // Cyan (#00f2ff) for normal, Magenta (#ff00e5) for high load/warning
    const primaryColor = isHighLoad ? "#ff00e5" : "#00f2ff";

    return (
        <>
            {/* 
        LAYER 1: The Containment Pipe (Physical Glass Tube)
        Static, dark foundation.
      */}
            <path
                id={id}
                className="react-flow__edge-path"
                d={edgePath}
                stroke="#050505"
                strokeWidth={8}
                fill="none"
                strokeOpacity={0.4}
                style={{ strokeLinecap: 'round' }}
            />

            {/* 
        LAYER 2: Atmospheric Glow (Static Neon)
        Static blur. NO ANIMATION on this layer to save GPU.
        Provides the "blooming" effect around the pipe.
      */}
            <path
                d={edgePath}
                fill="none"
                strokeWidth={4}
                stroke={primaryColor}
                strokeOpacity={0.3}
                // Tailwind blur-sm is efficient.
                className="blur-sm"
            />

            {/* 
        LAYER 3: The Pulse Current (Energy Stream)
        The only moving part. Thin, crisp, bright.
      */}
            <motion.path
                d={edgePath}
                fill="none"
                strokeWidth={2}
                stroke={primaryColor}
                // "10px solid, 150px gap" creates distinct energy packets
                strokeDasharray="10 150"
                initial={{ strokeDashoffset: 160 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{
                    duration: duration,
                    repeat: Infinity,
                    ease: "linear"
                }}
                style={{
                    // Hardware acceleration hint
                    willChange: 'stroke-dashoffset',
                    strokeLinecap: 'round',
                    // Slight localized glow for the packet itself
                    filter: `drop-shadow(0 0 2px ${primaryColor})`
                }}
            />
        </>
    );
};

// Use memo to prevent re-renders if props haven't changed
export default memo(PulseEdge);
