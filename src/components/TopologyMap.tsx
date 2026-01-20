import { useEffect, useMemo, useState } from 'react';
import { ReactFlow, Controls, Node, Edge, useNodesState, useEdgesState, BaseEdge, EdgeProps, getBezierPath, Handle, Position } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useHardware } from '../hooks/useHardware';
import { useStore } from '../store';
import { motion } from 'framer-motion';
import { Monitor, Keyboard, Mouse, Smartphone, HardDrive, Cpu, Activity, Network } from 'lucide-react';
import { cn } from '../lib/utils';
import { invoke } from '@tauri-apps/api/core';
import { SafetyModal } from './SafetyModal';

// --- Custom Edge Component for "Pulse" Effect ---
const PulseEdge = ({
    sourceX, sourceY, targetX, targetY,
    sourcePosition, targetPosition,
    style = {}, markerEnd, data
}: EdgeProps) => {
    const [edgePath] = getBezierPath({
        sourceX, sourceY, sourcePosition,
        targetX, targetY, targetPosition,
    });

    // Dynamic speed based on data.load (0-100)
    // Formula: T = 3s * (1 - L) + 0.2s * L
    const load = (data?.load as number) || 0;
    const loadFactor = Math.min(Math.max(load / 100, 0), 1);
    const duration = 3 * (1 - loadFactor) + 0.2 * loadFactor;

    // Color: Cyan for Net/Input, Magenta for High Load/System
    const isHighLoad = load > 80;
    const color = isHighLoad ? '#FF00E5' : '#00F2FF';

    return (
        <>
            <BaseEdge path={edgePath} markerEnd={markerEnd} style={{ ...style, stroke: color, opacity: 0.2, strokeWidth: 2 }} />
            <path
                d={edgePath}
                fill="none"
                stroke={color}
                strokeWidth={isHighLoad ? 3 : 2}
                strokeDasharray="10, 50"
                strokeLinecap="round"
                className="animate-pulse-flow"
                style={{
                    animation: `dashOffset ${duration}s linear infinite`,
                    filter: `drop-shadow(0 0 ${isHighLoad ? 8 : 4}px ${color})`
                }}
            />
            <style>{`
                @keyframes dashOffset {
                    from { stroke-dashoffset: 100; }
                    to { stroke-dashoffset: 0; }
                }
            `}</style>
        </>
    );
};

const PCNode = () => {
    return (
        <div className="relative group">
            {/* Host Core Ripple (SVG) */}
            <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none">
                <svg className="w-[300px] h-[300px] absolute opacity-30">
                    <circle cx="150" cy="150" r="50" fill="none" stroke="#00F2FF" strokeWidth="1" className="animate-[ping_3s_linear_infinite]" />
                    <circle cx="150" cy="150" r="70" fill="none" stroke="#00F2FF" strokeWidth="1" className="animate-[ping_4s_linear_infinite]" style={{ animationDelay: '1s' }} />
                </svg>
            </div>

            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center justify-center w-32 h-32"
            >
                {/* Glass Hexagon/Square Container */}
                <div className="w-20 h-20 rounded-2xl bg-black/40 border-2 border-accent-cyan shadow-[0_0_30px_rgba(0,242,255,0.3)] backdrop-blur-xl flex items-center justify-center mb-3 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-accent-cyan/20 to-transparent opacity-50" />
                    <Monitor className="w-10 h-10 text-accent-cyan z-10" />
                    {/* Virtual Ports on Right Side */}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-2 translate-x-1/2">
                        {[1, 2, 3, 4].map(i => <div key={i} className="w-2 h-2 rounded-full bg-accent-cyan shadow-[0_0_5px_#00F2FF]" />)}
                    </div>
                </div>

                <div className="text-sm font-bold text-white tracking-widest font-mono text-center">AETHER CORE</div>
                <div className="text-[10px] text-accent-cyan font-mono">ONLINE</div>
            </motion.div>

            {/* Hidden Handles mapped to the virtual ports visually */}
            <Handle type="source" position={Position.Right} id="port-1" style={{ top: '35%', opacity: 0 }} />
            <Handle type="source" position={Position.Right} id="port-2" style={{ top: '45%', opacity: 0 }} />
            <Handle type="source" position={Position.Right} id="port-3" style={{ top: '55%', opacity: 0 }} />
            <Handle type="source" position={Position.Right} id="port-4" style={{ top: '65%', opacity: 0 }} />
        </div>
    );
};

const DeviceNode = ({ data }: any) => {
    const isCritical = data.label?.toLowerCase().includes('mouse') || data.label?.toLowerCase().includes('keyboard');
    // const color = isCritical ? 'text-accent-magenta border-accent-magenta shadow-accent-magenta' : 'text-accent-cyan border-accent-cyan shadow-accent-cyan';
    const glowColor = isCritical ? '#FF00E5' : '#00F2FF';

    // Icon Selection
    const Icon = data.label?.toLowerCase().includes('mouse') ? Mouse :
        data.label?.toLowerCase().includes('keyboard') ? Keyboard :
            data.label?.toLowerCase().includes('phone') ? Smartphone :
                HardDrive;

    return (
        <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center group cursor-pointer"
        >
            <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />

            {/* Vertical Layout: Icon Box -> Label */}
            <div className={`w-16 h-16 rounded-xl bg-black/40 border border-white/10 backdrop-blur-md flex items-center justify-center mb-2 transition-all duration-300 group-hover:border-${isCritical ? 'accent-magenta' : 'accent-cyan'} group-hover:shadow-[0_0_20px_${glowColor}40]`}>
                <Icon className={`w-8 h-8 text-gray-400 transition-colors duration-300 group-hover:text-white ${isCritical ? 'group-hover:text-accent-magenta' : 'group-hover:text-accent-cyan'}`} />
            </div>

            <div className="text-center">
                <div className="text-xs font-bold text-white max-w-[120px] truncate font-mono group-hover:text-hud shadow-black drop-shadow-md">{data.label}</div>
                <div className="text-[9px] text-gray-500 font-mono uppercase">{data.id}</div>
            </div>
        </motion.div>
    );
};

export function TopologyMap() {
    const { devices } = useHardware();
    const { latestTelemetry } = useStore(); // Get real-time stats for pulse speed
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedDevice, setSelectedDevice] = useState<{ id: string, name: string } | null>(null);

    const nodeTypes = useMemo(() => ({ pc: PCNode, device: DeviceNode }), []);
    const edgeTypes = useMemo(() => ({ pulse: PulseEdge }), []);

    // Format helper
    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + sizes[i];
    };

    const getMetricColor = (val: number) => {
        if (val > 80) return "text-accent-magenta";
        if (val > 50) return "text-yellow-400";
        return "text-accent-cyan";
    };

    useEffect(() => {
        const pcNode: Node = {
            id: 'pc-1',
            type: 'pc',
            position: { x: 0, y: 0 },
            data: { label: 'CORE' },
            draggable: false,
        };

        // Mock devices if none found (VISUAL FIX)
        const activeDevices = devices.length > 0 ? devices : [
            { id: 'mock-1', name: 'Neural Link', alias: 'Neural Link' },
            { id: 'mock-2', name: 'Bio-Synth', alias: 'Bio-Synth' },
            { id: 'mock-3', name: 'Quantum Net', alias: 'Quantum Net' },
            { id: 'mock-4', name: 'Cyber-Deck', alias: 'Cyber-Deck' }
        ];

        const deviceNodes: Node[] = activeDevices.map((device, index) => {
            // Semi-circle layout on the right
            const count = devices.length;
            const spread = Math.PI / 1.5; // Spread over ~120 degrees
            const startAngle = -spread / 2;
            const step = spread / (count > 1 ? count - 1 : 1);
            const angle = startAngle + (index * step);

            const radius = 350; // Increased radius for better spacing
            return {
                id: device.id,
                type: 'device',
                position: {
                    x: 150 + Math.cos(angle) * radius, // Offset from center
                    y: Math.sin(angle) * radius,
                },
                data: { label: device.alias || device.name, id: device.id },
            };
        });

        // Use real telemetry load
        const currentLoad = latestTelemetry?.net_down ? (latestTelemetry.net_down > 500000 ? 100 : Math.min(latestTelemetry.net_down / 5000, 100)) : 10;

        const deviceEdges: Edge[] = activeDevices.map((device, i) => ({
            id: `e-pc-${device.id}`,
            source: 'pc-1',
            sourceHandle: `port-${(i % 4) + 1}`, // Cycle through 4 virtual ports
            target: device.id,
            type: 'pulse',
            animated: false,
            data: { load: currentLoad },
            style: { strokeWidth: 2 },
        }));

        setNodes([pcNode, ...deviceNodes]);
        setEdges(deviceEdges);
    }, [devices, latestTelemetry?.net_down, setNodes, setEdges]); // Update when net_down changes

    const handleNodeClick = (_: React.MouseEvent, node: Node) => {
        if (node.type === 'device') {
            setSelectedDevice({ id: node.id, name: node.data.label as string });
            setModalOpen(true);
        }
    };

    const handleConfirmToggle = async () => {
        if (!selectedDevice) return;
        try {
            await invoke('toggle_device', { id: selectedDevice.id, enable: false });
        } catch (e) {
            console.error(e);
        }
        setModalOpen(false);
    };

    const isCritical = selectedDevice ? ['mouse', 'keyboard', 'system'].some(k => selectedDevice.name.toLowerCase().includes(k)) : false;

    return (
        <div className="w-full h-full min-h-[400px] relative">
            {/* HUD Injection - Top Right within Topology */}
            <div className="absolute top-4 right-4 z-50 pointer-events-none select-none">
                <div className="flex items-center gap-4 bg-black/40 px-6 py-2 rounded-full backdrop-blur-2xl border border-white/20 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
                    {/* CPU */}
                    <div className="flex items-center gap-3 border-r border-white/10 pr-6">
                        <Cpu className="w-4 h-4 text-accent-cyan" />
                        <div className="flex items-baseline gap-1 font-mono tracking-tighter">
                            <span className="text-xs text-gray-400 opacity-50">CPU:</span>
                            <span className={cn("text-lg font-bold w-12 text-right", getMetricColor(latestTelemetry?.cpu_load || 0))}>
                                {latestTelemetry?.cpu_load.toFixed(0)}%
                            </span>
                            <span className="text-xs text-gray-400 opacity-50">55°C</span>
                        </div>
                    </div>

                    {/* GPU (Mock) */}
                    <div className="flex items-center gap-3 border-r border-white/10 pr-6">
                        <Activity className="w-4 h-4 text-accent-magenta" />
                        <div className="flex items-baseline gap-1 font-mono tracking-tighter">
                            <span className="text-xs text-gray-400 opacity-50">GPU:</span>
                            <span className="text-lg font-bold text-accent-magenta w-10 text-right">8%</span>
                            <span className="text-xs text-gray-400 opacity-50">42°C</span>
                        </div>
                    </div>

                    {/* Network */}
                    <div className="flex items-center gap-3">
                        <Network className="w-4 h-4 text-white/70" />
                        <div className="flex items-baseline gap-3 font-mono tracking-tighter">
                            <span className="text-sm">
                                <span className="text-gray-500 text-xs mr-1 opacity-50">↓</span>
                                {formatBytes(latestTelemetry?.net_down || 0)}/s
                            </span>
                            <span className="text-sm">
                                <span className="text-gray-500 text-xs mr-1 opacity-50">↑</span>
                                {formatBytes(latestTelemetry?.net_up || 0)}/s
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={handleNodeClick}
                fitView
                proOptions={{ hideAttribution: true }}
                className="bg-transparent"
                minZoom={0.5}
                maxZoom={1.5}
            >
                {/* Remove default Background, using global BG now */}
                <Controls className="bg-white/10 border-white/10 text-white fill-white rounded-lg backdrop-blur-md" showInteractive={false} />
            </ReactFlow>

            <SafetyModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={handleConfirmToggle}
                deviceName={selectedDevice?.name || 'Unknown Device'}
                isCritical={isCritical}
            />
        </div>
    );
}
