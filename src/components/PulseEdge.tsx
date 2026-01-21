import React, { memo } from 'react';
import { getSmoothStepPath, type EdgeProps } from '@xyflow/react';
import { motion } from 'framer-motion';

const PulseEdge = ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data }: EdgeProps) => {
    // 0. Extend path endpoints to reach node centers
    // We offset the start/end points "inward" relative to the node based on handle position.
    // Reduced offset to 10px to just cover the connection point without overshooting.
    const offset = 10;
    const sx = sourcePosition === 'right' ? sourceX - offset : sourcePosition === 'left' ? sourceX + offset : sourceX;
    const sy = sourcePosition === 'bottom' ? sourceY - offset : sourcePosition === 'top' ? sourceY + offset : sourceY;
    const tx = targetPosition === 'left' ? targetX + offset : targetPosition === 'right' ? targetX - offset : targetX;
    const ty = targetPosition === 'top' ? targetY + offset : targetPosition === 'bottom' ? targetY - offset : targetY;

    // 1. Generate rounded smooth step path
    const [edgePath] = getSmoothStepPath({
        sourceX: sx, sourceY: sy, sourcePosition,
        targetX: tx, targetY: ty, targetPosition,
        borderRadius: 36, // Reduced by 10% (was 40)
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
        LAYER 1: The Containment Pipe (Backing)
        Dark foundation to make the pipe pop against background.
      */}
            <path
                id={id}
                className="react-flow__edge-path"
                d={edgePath}
                stroke="#000000"
                strokeWidth={14}
                fill="none"
                strokeOpacity={0.9}
                style={{ strokeLinecap: 'round' }}
            />

            {/* 
        LAYER 2: Global Atmospheric Glow (The Halo)
        Wide, blurred glow to create the "emitting light" effect.
      */}
            <path
                d={edgePath}
                fill="none"
                strokeWidth={20}
                stroke={primaryColor}
                strokeOpacity={0.4}
                className="blur-md"
            />



            {/* 
        LAYER 4: The Solid Pipe Structure (Glass Tube)
        The visible physical tube wall. Overlays the highlights to restrict them to edges.
      */}
            <path
                d={edgePath}
                fill="none"
                strokeWidth={10}
                stroke={primaryColor}
                strokeOpacity={0.3} // Low opacity to see the plasma inside clearly
            />

            {/* 
        LAYER 5: The Pulse Current (Plasma Flow)
        The moving energy stream inside the pipe.
      */}
            {/* 
        LAYER 5: The Pulse Current (Moving Halo)
        Soft, boundary-less light pulse.
      */}
            <motion.path
                d={edgePath}
                fill="none"
                strokeWidth={12} // Slightly wider
                stroke={primaryColor}
                strokeDasharray="40 160" // Longer, softer pulse
                initial={{ strokeDashoffset: 200 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{
                    duration: duration,
                    repeat: Infinity,
                    ease: "linear"
                }}
                style={{
                    willChange: 'stroke-dashoffset',
                    strokeLinecap: 'round',
                    strokeOpacity: 0.8,
                    // High blur to remove boundaries, plus a glow
                    filter: `blur(8px) drop-shadow(0 0 8px ${primaryColor}) brightness(1.5)`
                }}
            />
        </>
    );
};

// Use memo to prevent re-renders if props haven't changed
export default memo(PulseEdge);
