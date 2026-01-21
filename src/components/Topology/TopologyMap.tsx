import { useMemo } from 'react';
import { ReactFlow, Background, Controls, type Node, type Edge, useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import HUDCapsule from '../UI/HUDCapsule';
import HostNode from '../HostNode';
import PeripheralNode from '../PeripheralNode';
import PulseEdge from '../PulseEdge';

const initialNodes: Node[] = [
    { id: 'host', position: { x: 0, y: 0 }, data: { label: 'HOST PC' }, type: 'host' },
    { id: 'p1', position: { x: -300, y: 150 }, data: { label: 'NEURAL LINK', icon: 'mouse' }, type: 'peripheral' },
    { id: 'p2', position: { x: 300, y: 150 }, data: { label: 'BIO-SYNTH', icon: 'keyboard' }, type: 'peripheral' },
    { id: 'p3', position: { x: 0, y: 300 }, data: { label: 'QUANTUM NET', icon: 'dock' }, type: 'peripheral' },
];

const edgeStyle = { stroke: '#00f2ff', strokeWidth: 2 };

const initialEdges: Edge[] = [
    { id: 'e1-host', source: 'host', sourceHandle: 'port-0', target: 'p1', targetHandle: 'port-0', type: 'pulse', style: edgeStyle },
    { id: 'e2-host', source: 'host', sourceHandle: 'port-1', target: 'p2', targetHandle: 'port-0', type: 'pulse', style: edgeStyle },
    { id: 'e3-host', source: 'host', sourceHandle: 'port-2', target: 'p3', targetHandle: 'port-0', type: 'pulse', style: edgeStyle },
];

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
