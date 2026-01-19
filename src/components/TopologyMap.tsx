import { useEffect, useMemo, useState } from 'react';
import { ReactFlow, Background, Controls, Node, Edge, useNodesState, useEdgesState, BaseEdge, EdgeProps, getBezierPath } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useHardware } from '../hooks/useHardware';
import { motion } from 'framer-motion';
import { Monitor, Cpu, Keyboard, Mouse } from 'lucide-react';
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
    // High load = Fast pulse (0.5s), Low load = Slow pulse (3s)
    const load = (data?.load as number) || 10;
    const duration = Math.max(0.2, 3 - (load / 40));
    const color = load > 70 ? '#ff00e5' : '#00F2FF'; // Magenta if high load

    return (
        <>
            <BaseEdge path={edgePath} markerEnd={markerEnd} style={{ ...style, stroke: color, opacity: 0.3 }} />
            <path
                d={edgePath}
                fill="none"
                stroke={color}
                strokeWidth={3}
                strokeDasharray="10, 100" // The pulse dash
                strokeLinecap="round"
                className="animate-pulse-flow"
                style={{
                    animation: `dashOffset ${duration}s linear infinite`,
                    filter: `drop-shadow(0 0 5px ${color})`
                }}
            />
            <style>{`
                @keyframes dashOffset {
                    from { stroke-dashoffset: 200; }
                    to { stroke-dashoffset: 0; }
                }
            `}</style>
        </>
    );
};

const PCNode = ({ data }: any) => {
    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center justify-center p-4 rounded-full bg-black/60 border-2 border-accent-cyan shadow-[0_0_30px_rgba(0,242,255,0.3)] backdrop-blur-xl w-32 h-32 relative group"
        >
            <div className="absolute inset-0 rounded-full border border-accent-cyan/30 animate-ping opacity-20" />
            <Monitor className="w-10 h-10 text-accent-cyan mb-2 z-10" />
            <div className="text-xs font-bold text-white tracking-widest z-10">{data.label}</div>
            <div className="text-[10px] text-accent-cyan z-10">ONLINE</div>
        </motion.div>
    );
};

const DeviceNode = ({ data }: any) => {
    const isCritical = data.label?.toLowerCase().includes('mouse') || data.label?.toLowerCase().includes('keyboard');

    return (
        <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className={`flex items-center p-3 rounded-lg bg-white/5 border border-white/10 backdrop-blur-md 
                ${isCritical ? 'hover:border-accent-magenta/50 hover:bg-accent-magenta/10 hover:shadow-[0_0_15px_rgba(255,0,229,0.2)]' : 'hover:border-accent-cyan/50 hover:bg-accent-cyan/10 hover:shadow-[0_0_15px_rgba(0,242,255,0.2)]'} 
                transition-all min-w-[150px] cursor-pointer`}
        >
            <div className={`w-8 h-8 rounded bg-white/10 flex items-center justify-center mr-3 border border-white/5`}>
                {data.label?.toLowerCase().includes('mouse') ? <Mouse className="w-4 h-4 text-gray-300" /> :
                    data.label?.toLowerCase().includes('keyboard') ? <Keyboard className="w-4 h-4 text-gray-300" /> :
                        <Cpu className="w-4 h-4 text-gray-300" />}
            </div>
            <div>
                <div className="text-xs font-bold text-white truncate max-w-[100px]">{data.label}</div>
                <div className="text-[10px] text-gray-500">{data.id}</div>
            </div>
        </motion.div>
    );
};

export function TopologyMap() {
    const { devices } = useHardware();
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

    // Safety Modal Logic
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedDevice, setSelectedDevice] = useState<{ id: string, name: string } | null>(null);

    const nodeTypes = useMemo(() => ({
        pc: PCNode,
        device: DeviceNode,
    }), []);

    const edgeTypes = useMemo(() => ({
        pulse: PulseEdge
    }), []);

    useEffect(() => {
        // Central Node
        const pcNode: Node = {
            id: 'pc-1',
            type: 'pc',
            position: { x: 0, y: 0 },
            data: { label: 'CORE' },
            draggable: false,
        };

        // Peripheral Nodes (Circular Layout)
        const deviceNodes: Node[] = devices.map((device, index) => {
            const angle = (index / devices.length) * 2 * Math.PI;
            const radius = 250;
            return {
                id: device.id,
                type: 'device',
                position: {
                    x: Math.cos(angle) * radius,
                    y: Math.sin(angle) * radius,
                },
                data: { label: device.alias || device.name, id: device.id },
            };
        });

        // Mock Telemetry Load for Pulse Speed
        // In real app, subscribe to system stats
        const mockLoad = 30; // 30% load

        const deviceEdges: Edge[] = devices.map((device) => ({
            id: `e-pc-${device.id}`,
            source: 'pc-1',
            target: device.id,
            type: 'pulse',
            animated: false, // handled by custom edge
            data: { load: mockLoad + (Math.random() * 50) }, // Randomize slightly for variety
            style: { strokeWidth: 1 },
        }));

        setNodes([pcNode, ...deviceNodes]);
        setEdges(deviceEdges);
    }, [devices, setNodes, setEdges]);

    const handleNodeClick = (_: React.MouseEvent, node: Node) => {
        if (node.type === 'device') {
            setSelectedDevice({ id: node.id, name: node.data.label as string });
            setModalOpen(true);
        }
    };

    const handleConfirmToggle = async () => {
        if (!selectedDevice) return;

        try {
            const result = await invoke('toggle_device', {
                id: selectedDevice.id,
                enable: false // In a real toggle we'd check current state. For now "Disable" is the dangerous action.
            });
            console.log("Device Action Result:", result);
        } catch (e) {
            console.error("Device Action Failed:", e);
        }
        setModalOpen(false);
    };

    const isCritical = selectedDevice ?
        ['mouse', 'keyboard', 'system'].some(k => selectedDevice.name.toLowerCase().includes(k)) : false;

    return (
        <div className="w-full h-full min-h-[400px]">
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
                className="bg-black/20"
            >
                <Background color="#1a1a1a" gap={20} className="opacity-20" />
                <Controls className="bg-white/10 border-white/10 text-white fill-white" />
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
