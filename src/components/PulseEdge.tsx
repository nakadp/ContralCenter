import React, { memo } from 'react';
import { BaseEdge, type EdgeProps, getBezierPath } from '@xyflow/react';

const PulseEdge = ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
}: EdgeProps) => {
    const [edgePath] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetPosition,
        targetX,
        targetY,
    });

    return (
        <>
            {/* 1. Base dim path (the "wire") */}
            <BaseEdge path={edgePath} markerEnd={markerEnd} style={{ ...style, strokeOpacity: 0.2 }} />

            {/* 2. Animated packet */}
            <circle r="3" fill="#00f2ff" filter="url(#glow)">
                <animateMotion dur="2s" repeatCount="indefinite" path={edgePath}>
                    {/* Create a pause effect at the start/end if needed, but linear is fine for flow */}
                </animateMotion>
            </circle>

            {/* Optional: Second packet with delay for continuous flow feel */}
            <circle r="2" fill="#00f2ff" opacity="0.6">
                <animateMotion dur="2s" begin="1s" repeatCount="indefinite" path={edgePath} />
            </circle>

            {/* Defs for glow filter - only needs to be defined once in the app, but safe to include here if id is unique or global */}
            {/* Since we might have many edges, it's better to put defs in the global SVG or TopologyMap. 
          For now, let's assume global CSS glow or simple box-shadow equivalent won't work inside SVG easily.
          We'll rely on the fill color. The <defs> should be in TopologyMap to avoid duplicates.
      */}
        </>
    );
};

export default memo(PulseEdge);
