import React, { memo, useEffect, useRef } from 'react';
import { getSmoothStepPath, type EdgeProps } from '@xyflow/react';
import { octavedNoise } from '../utils/noise';

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
        borderRadius: 45, // Updated to 45 as requested
    });

    // 2. Data-driven logic
    // Casting data.load to number, defaulting to 27 (idling) if undefined
    const load = typeof data?.load === 'number' ? data.load : 27;
    // Higher load = Faster flow (lower duration in original, higher speed here)
    // Original duration: Math.max(1, 4.0 - (load / 100) * 3); -> 4s to 1s
    // Reference speed: 1. Let's map load to speed. 
    // Low load (27) -> Slow speed. High load (>80) -> Fast speed.
    const isHighLoad = load > 80;

    // Refs for animation
    const pathRef = useRef<SVGPathElement>(null); // The visible electric path
    // Use multiple refs for layers if we want to match the reference's multi-pass glow
    const blur1Ref = useRef<SVGPathElement>(null);
    const blur2Ref = useRef<SVGPathElement>(null);
    const hiddenPathRef = useRef<SVGPathElement>(null); // The hidden path for geometry

    const timeRef = useRef(0);
    const frameRef = useRef<number | null>(null);

    useEffect(() => {
        const path = pathRef.current;
        const blur1 = blur1Ref.current;
        const blur2 = blur2Ref.current;
        const hiddenPath = hiddenPathRef.current;

        if (!path || !hiddenPath) return;

        // Constants from reference
        const octaves = 10; // Match reference
        const lacunarity = 1.6;
        const gain = 0.7;
        const amplitude = 0.12; // chaos
        // The reference uses `amplitude = chaos` where chaos=0.12.

        const frequency = 10;
        const baseFlatness = 0;
        const displacement = 60; // Match reference (was 30)

        const animate = () => {
            // Increment time
            // Reference: timeRef.current += deltaTime * speed;
            // Assuming 60fps, deltaTime ~ 0.016. speed = 1.
            // My previous fixed step 0.01 * speed is roughly similar but let's tune.
            // Reference speed default is 1.
            timeRef.current += 0.02 * (isHighLoad ? 2 : 1); // Dynamic speed

            const length = hiddenPath.getTotalLength();
            if (length === 0) {
                frameRef.current = requestAnimationFrame(animate);
                return;
            }

            // Reference uses `getRoundedRectPoint` which is uniform. 
            // SVG `getPointAtLength` is also uniform.

            // Reference samples `approximatePerimeter / 2`. 
            // length / 2 is huge if length is 500px -> 250 samples.
            const sampleCount = Math.floor(length / 2);

            let d = "";

            for (let i = 0; i <= sampleCount; i++) {
                const progress = i / sampleCount;
                const point = hiddenPath.getPointAtLength(progress * length);

                // Reference: noise(progress * 8, ...)
                // My previous: progress * 4.

                const xNoise = octavedNoise(
                    progress * 8,
                    octaves,
                    lacunarity,
                    gain,
                    amplitude,
                    frequency,
                    timeRef.current,
                    0,
                    baseFlatness
                );

                const yNoise = octavedNoise(
                    progress * 8,
                    octaves,
                    lacunarity,
                    gain,
                    amplitude,
                    frequency,
                    timeRef.current,
                    1,
                    baseFlatness
                );

                const dx = point.x + xNoise * displacement;
                const dy = point.y + yNoise * displacement;

                if (i === 0) {
                    d += `M ${dx},${dy}`;
                } else {
                    d += ` L ${dx},${dy}`;
                }
            }

            path.setAttribute("d", d);
            if (blur1) blur1.setAttribute("d", d);
            if (blur2) blur2.setAttribute("d", d);

            frameRef.current = requestAnimationFrame(animate);
        };

        frameRef.current = requestAnimationFrame(animate);

        return () => {
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
        };
    }, [edgePath, isHighLoad]);

    // Data-driven selection state
    const targetSelected = data?.targetSelected === true;

    // Color Logic: 
    // If selected -> Magenta (#ff00e5)
    // Else -> Cyan (#00f2ff)
    const activeColor = targetSelected ? "#ff00e5" : "#00f2ff";

    // Glow Intensity Logic:
    // If selected -> Increase by 20% (multiply opacity by 1.2)
    const glowMultiplier = targetSelected ? 1.2 : 1.0;

    return (
        <>
            {/* 
        HIDDEN LAYER: Geometry Reference
      */}
            <path
                ref={hiddenPathRef}
                d={edgePath}
                fill="none"
                stroke="none"
                style={{ opacity: 0, pointerEvents: 'none' }}
                aria-hidden="true"
                shapeRendering="geometricPrecision"
            />

            {/*
        LAYER 1: The Containment Pipe (Backing)
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
                shapeRendering="geometricPrecision"
            />

            {/*
        LAYER 2: Global Atmospheric Glow (Static Halo - Restored for base color band)
      */}
            <path
                d={edgePath}
                fill="none"
                strokeWidth={20}
                stroke={activeColor}
                strokeOpacity={0.3 * glowMultiplier} // Increased from 0.1 to restore "color band" presence
                className="blur-md"
                shapeRendering="geometricPrecision"
            />

            {/*
        LAYER 4: The Solid Pipe Structure (Glass Tube)
      */}
            <path
                d={edgePath}
                fill="none"
                strokeWidth={10}
                stroke={activeColor}
                strokeOpacity={0.4 * glowMultiplier} // Increased significantly to be the visible "base"
                shapeRendering="geometricPrecision"
            />

            {/*
        LAYER 5: The Electric Current (Electric Jitter)
        Recreation of reference layers but dimmed:
      */}

            {/* Wide Glow (Layer 3 in reference equivalent) - Dimmed */}
            <path
                ref={blur2Ref}
                d={edgePath}
                fill="none"
                stroke={activeColor}
                strokeWidth={4}
                style={{ filter: 'blur(4px)', opacity: 0.3 * glowMultiplier }} // Reduced from 0.5
                shapeRendering="geometricPrecision"
            />

            {/* Main Beam (Layer 2 in reference equivalent) - Dimmed */}
            <path
                ref={blur1Ref}
                d={edgePath}
                fill="none"
                stroke={activeColor}
                strokeWidth={2}
                style={{ filter: 'blur(1px)', opacity: 0.6 * glowMultiplier }} // Reduced from 0.8
                shapeRendering="geometricPrecision"
            />

            {/* Core Core (Layer 1 almost) - Dimmed & removed drop-shadow bloom */}
            <path
                ref={pathRef}
                d={edgePath}
                fill="none"
                stroke={activeColor}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                    // filter: `drop-shadow(0 0 2px ${primaryColor})`, // Removed heavy bloom
                    opacity: 0.8 * glowMultiplier, // Reduced from 1.0
                    vectorEffect: 'non-scaling-stroke'
                }}
                shapeRendering="geometricPrecision"
            />

        </>
    );
};

// Use memo to prevent re-renders if props haven't changed
export default memo(PulseEdge);
