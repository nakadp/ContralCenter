import { useMemo } from 'react';
import { ReactFlow, Background, Controls, type Node, type Edge, useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import HUDCapsule from '../UI/HUDCapsule';
import HostNode from '../HostNode';
import PeripheralNode from '../PeripheralNode';
import PulseEdge from '../PulseEdge';

// Define the peripherals data
const peripheralsData = [
    { id: 'p1', label: 'NEURAL LINK', icon: 'mouse' },
    { id: 'p2', label: 'BIO-SYNTH', icon: 'keyboard' },
    { id: 'p3', label: 'QUANTUM NET', icon: 'dock' },
];

const LAYOUT = {
    HOST_X: 0,
    DEVICE_X: 500,
    VERTICAL_SPACING: 200, // Adjust spacing as needed
};

// Helper: Generate Layout
const generateLayout = () => {
    const count = peripheralsData.length;
    const totalHeight = (count - 1) * LAYOUT.VERTICAL_SPACING;
    const startY = -totalHeight / 2;

    // Define 4 physical ports for the Host PC
    const hostPorts = ['port-0', 'port-1', 'port-2', 'port-3'];

    const hostNode: Node = {
        id: 'host',
        position: { x: LAYOUT.HOST_X, y: 0 }, // Host always centered vertically relative to cluster center
        data: {
            label: 'HOST PC',
            ports: hostPorts
        },
        type: 'host',
    };

    const peripheralNodes: Node[] = peripheralsData.map((p, i) => ({
        id: p.id,
        position: {
            x: LAYOUT.DEVICE_X,
            y: startY + i * LAYOUT.VERTICAL_SPACING
        },
        data: { label: p.label, icon: p.icon },
        type: 'peripheral',
    }));

    const edgeLoads = [95, 60, 25]; // Example loads: High, Medium, Low

    const edges: Edge[] = peripheralsData.map((p, i) => ({
        id: `e-${p.id}`,
        source: 'host',
        sourceHandle: `port-${i}`,
        target: p.id,
        targetHandle: 'port-0',
        type: 'pulse',
        data: { load: edgeLoads[i] },
        style: { stroke: '#00f2ff', strokeWidth: 2 },
    }));

    return {
        initialNodes: [hostNode, ...peripheralNodes],
        initialEdges: edges,
    };
};

const { initialNodes, initialEdges } = generateLayout();

export default function TopologyMap() {
    const [nodes, , onNodesChange] = useNodesState(initialNodes);
    const [edges, , onEdgesChange] = useEdgesState(initialEdges);

    const nodeTypes = useMemo(() => ({
        host: HostNode,
        peripheral: PeripheralNode,
    }), []);

    const edgeTypes = useMemo(() => ({
        pulse: PulseEdge,
    }), []);

    return (
        <div className="w-full h-full relative group">
            <HUDCapsule />

            {/* Ambient Glow */}
            <div className="absolute inset-0 bg-radial-gradient from-aether-cyan/5 via-transparent to-transparent pointer-events-none" />

            {/* Global SVG Filters */}
            <svg style={{ position: 'absolute', width: 0, height: 0 }}>
                <defs>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
            </svg>

            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
                className="bg-transparent"
                minZoom={0.5}
                maxZoom={2}
            >
                <Background color="#00f2ff" gap={40} size={1} style={{ opacity: 0.03 }} />
                <Controls className="bg-black/50 border border-white/10 fill-white text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </ReactFlow>
        </div>
    );
}
