import { useMemo, useEffect, useCallback, useState } from 'react';
import {
    ReactFlow,
    Controls,
    useNodesState,
    useEdgesState,
    addEdge,
    reconnectEdge,
    type Node,
    type Edge,
    type Connection
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { invoke } from '@tauri-apps/api/core';
import { ShieldAlert, RefreshCw, Battery, Info } from 'lucide-react';
import SystemMonitor from '../UI/SystemMonitor';
import HostNode from '../HostNode';
import PeripheralNode from '../PeripheralNode';
import PulseEdge from '../PulseEdge';
import DotGrid from '../background/DotGrid';

// Define the backend device interface (PascalCase from Rust/PowerShell)
interface ConnectedDevice {
    InstanceId: string;
    FriendlyName: string;
    DeviceType: string;
    Class: string;
    ParentId?: string;
    Status: string;
    HardwareID?: string;
    ConfigCode?: number;
    BatteryLevel?: number;
}

const LAYOUT = {
    HOST_X: 0,
    DEVICE_X: 500,
    HUB_X: 250,
    VERTICAL_SPACING: 150,
};

const INITIAL_HOST_NODE: Node = {
    id: 'host',
    position: { x: LAYOUT.HOST_X, y: 0 },
    data: {
        label: 'HOST PC',
        ports: ['port-0', 'port-1', 'port-2', 'port-3']
    },
    type: 'host',
};

// Fallback Mock Data Generation
const generateMockNodes = (): ConnectedDevice[] => [
    { InstanceId: 'mock-1', FriendlyName: 'Neural Link Interface', DeviceType: 'mouse', Class: 'Mouse', Status: 'OK', HardwareID: 'HID\\MOCK_01', ConfigCode: 0 },
    { InstanceId: 'mock-2', FriendlyName: 'Bio-Synth Keyboard', DeviceType: 'keyboard', Class: 'Keyboard', Status: 'OK', HardwareID: 'HID\\MOCK_02', ConfigCode: 0 },
    { InstanceId: 'mock-3', FriendlyName: 'Quantum Net Hub', DeviceType: 'hub', Class: 'USB', Status: 'OK', HardwareID: 'USB\\ROOT_HUB', ConfigCode: 0 },
    { InstanceId: 'mock-4', FriendlyName: 'Holo-Display', DeviceType: 'monitor', Class: 'Monitor', ParentId: 'mock-3', Status: 'OK', HardwareID: 'MONITOR\\MOCK_04', ConfigCode: 0 },
    { InstanceId: 'mock-5', FriendlyName: 'Backup Power Core', DeviceType: 'power', Class: 'Battery', Status: 'OK', HardwareID: 'ACPI\\PNP0C0A', ConfigCode: 0, BatteryLevel: 85 },
];

export default function TopologyMap() {
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([INITIAL_HOST_NODE]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const nodeTypes = useMemo(() => ({
        host: HostNode,
        peripheral: PeripheralNode,
    }), []);

    const edgeTypes = useMemo(() => ({
        pulse: PulseEdge,
    }), []);

    // Layout Logic (Tree Construction)
    const buildTopology = useCallback((deviceList: ConnectedDevice[]) => {
        const newNodes: Node[] = [];
        const newEdges: Edge[] = [];

        // Map ID to Device for quick parent lookup
        const deviceMap = new Map(deviceList.map(d => [d.InstanceId, d]));

        // --- 1. RECURSIVE PRUNING LOGIC (Leaf-to-Root) ---
        // We only want to show Hubs that lead to a valid endpoint (Leaf).
        // A Leaf is a non-hub device (Mouse, Keyboard, Monitor).

        const validIds = new Set<string>();

        const isLeaf = (d: ConnectedDevice) => d.DeviceType !== 'hub';

        // Recursive function to validate a node
        const validateNode = (d: ConnectedDevice): boolean => {
            if (validIds.has(d.InstanceId)) return true;

            if (isLeaf(d)) {
                validIds.add(d.InstanceId);
                return true;
            }

            // It's a Hub. Check its children.
            const children = deviceList.filter(child => child.ParentId === d.InstanceId);
            let hasValidChild = false;
            for (const child of children) {
                if (validateNode(child)) hasValidChild = true;
            }

            if (hasValidChild) {
                validIds.add(d.InstanceId);
                return true;
            }

            return false;
        };

        // Initialize validation from leaves
        deviceList.forEach(d => {
            if (isLeaf(d)) validateNode(d);
        });

        // Filter list based on validation
        const cleanList = deviceList.filter(d => validIds.has(d.InstanceId));
        const cleanMap = new Map(cleanList.map(d => [d.InstanceId, d]));


        // --- 2. HOST NODE PORTS (Fixed Channels) ---
        // Port 0: Monitors
        // Port 1-3: Others (Round Robin)

        const hostNode: Node = {
            ...INITIAL_HOST_NODE,
            data: {
                ...INITIAL_HOST_NODE.data,
                ports: ['port-0', 'port-1', 'port-2', 'port-3'] // FIXED 4 PORTS
            }
        };


        // --- 3. BUILD NODES ---
        // Track child counts for layout offsets
        const parentChildCount = new Map<string, number>();

        cleanList.forEach((d) => {
            const parentId = (d.ParentId && cleanMap.has(d.ParentId)) ? d.ParentId : 'host';
            const index = parentChildCount.get(parentId) || 0;
            parentChildCount.set(parentId, index + 1);

            // Simple positioning logic
            let xPos = LAYOUT.DEVICE_X;
            let yPos = 0;

            if (parentId === 'host') {
                // Direct connection
                yPos = (index - 2) * LAYOUT.VERTICAL_SPACING; // Rough spread
            } else {
                // Attached to Hub
                const parent = cleanMap.get(parentId);
                // Parent layout isn't fully resolved in this simple pass, assumes 2-tier max usually.
                // For v4.0 we stick to simple Hub logic:
                xPos = LAYOUT.DEVICE_X + 250;
                // Vertical offset for hub children
                yPos = (index - 1) * (LAYOUT.VERTICAL_SPACING * 0.8);
            }

            if (d.DeviceType === 'hub') {
                xPos = LAYOUT.HUB_X;
                yPos = (index - 1) * LAYOUT.VERTICAL_SPACING;
            }

            // Adjust for nested hubs if needed, but sticking to flat-ish visual for now.

            newNodes.push({
                id: d.InstanceId,
                position: { x: xPos, y: yPos },
                data: {
                    label: d.FriendlyName,
                    icon: d.DeviceType,
                    isHub: d.DeviceType === 'hub',
                    status: d.Status,
                    hardwareId: d.HardwareID,
                    batteryLevel: d.BatteryLevel
                },
                type: 'peripheral',
            });
        });


        // --- 4. BUILD EDGES (Channel Logic) ---
        let hidPortIndex = 1; // Start HIDs at port-1

        cleanList.forEach((d) => {
            // Find parent
            let sourceId = 'host';
            let sourceHandle = '';

            // Check if Parent is in our CLEAN graph
            if (d.ParentId && cleanMap.has(d.ParentId)) {
                sourceId = d.ParentId;
                // For Hubs, we might want dynamic handles too, but basic "port-source-0" is fine for now
                // unless we want to avoid overlap there too. 
                sourceHandle = 'port-source-0';
            } else {
                // Direct to Host - CHANNEL LOGIC
                if (d.DeviceType === 'monitor') {
                    sourceHandle = 'port-0'; // Reserved for Display
                } else {
                    // Distribute across 1-3
                    sourceHandle = `port-${hidPortIndex}`;
                    hidPortIndex = (hidPortIndex % 3) + 1; // Cycle 1 -> 2 -> 3 -> 1
                }
            }

            newEdges.push({
                id: `e-${d.InstanceId}`,
                source: sourceId,
                sourceHandle: sourceHandle,
                target: d.InstanceId,
                targetHandle: 'port-0',
                type: 'pulse',
                data: { load: Math.floor(Math.random() * 80) + 20 },
                style: { stroke: '#00f2ff', strokeWidth: 2 },
                reconnectable: true,
            });
        });

        setNodes([hostNode, ...newNodes]);
        setEdges(newEdges);
    }, [setNodes, setEdges]); // eslint-disable-line react-hooks/exhaustive-deps

    // Fetch devices
    const fetchDevices = async () => {
        setIsRefreshing(true);
        try {
            console.log("Discovery: Scanning hardware (Recursive PnP)...");
            let connectedDevices = await invoke<ConnectedDevice[]>('get_connected_devices');

            if (!connectedDevices || connectedDevices.length === 0) {
                console.warn("Discovery: No hardware found. Hydrating with Mock Data.");
                connectedDevices = generateMockNodes();
            }

            console.log("Discovery: Hydrated", connectedDevices.length, "devices.");
            buildTopology(connectedDevices);
        } catch (error) {
            console.error("Discovery Error:", error);
            // Fallback on error
            buildTopology(generateMockNodes());
        } finally {
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDevices();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Handle Selection for Control Panel
    const onNodeClick = (_: React.MouseEvent, node: Node) => {
        setSelectedNodeId(node.id);
    };

    const onPaneClick = () => {
        setSelectedNodeId(null);
    };

    const handleDisableDevice = async () => {
        if (!selectedNodeId) return;
        try {
            console.log(`Controls: Disabling device ${selectedNodeId} (UAC Triggered)...`);
            await invoke('disable_device', { instanceId: selectedNodeId });
            alert("Commands sent! Please approve the requested permissions in the User Account Control (UAC) prompt window to complete the operation.");
            // Ideally re-fetch after a delay to show status update, but disable might take time/restart
        } catch (e) {
            console.error("Controls Error:", e);
            alert("Failed to disable device: " + e);
        }
    };

    // ReactFlow Handlers
    const onConnect = useCallback((params: Connection) => {
        setEdges((eds) => addEdge({ ...params, type: 'pulse', style: { stroke: '#00f2ff', strokeWidth: 2 } }, eds));
    }, [setEdges]);

    const onReconnect = useCallback((oldEdge: Edge, newConnection: Connection) => {
        setEdges((els) => reconnectEdge(oldEdge, newConnection, els));
    }, [setEdges]);

    // Sync node selection (Visuals)
    useEffect(() => {
        setEdges((eds) =>
            eds.map((edge) => {
                const targetNode = nodes.find((n) => n.id === edge.target);
                const isSelected = targetNode?.selected || false;
                if (edge.data?.targetSelected !== isSelected) {
                    return { ...edge, data: { ...edge.data, targetSelected: isSelected } };
                }
                return edge;
            })
        );
    }, [nodes, setEdges]); // eslint-disable-line react-hooks/exhaustive-deps

    const selectedNode = nodes.find(n => n.id === selectedNodeId);
    // Find device data for selection
    const selectedDeviceData = selectedNode?.data as unknown as { label: string; hardwareId?: string; status?: string; batteryLevel?: number };

    return (
        <div className="w-full h-full relative group">
            <SystemMonitor />

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
                onConnect={onConnect}
                onReconnect={onReconnect}
                onNodeClick={onNodeClick}
                onPaneClick={onPaneClick}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
                className="bg-transparent"
                minZoom={0.5}
                maxZoom={2}
                defaultEdgeOptions={{ type: 'pulse', reconnectable: true }}
            >
                <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: -1 }}>
                    <DotGrid
                        dotSize={5}
                        gap={15}
                        baseColor="#271E37"
                        activeColor="#5227FF"
                        proximity={120}
                        shockRadius={250}
                        shockStrength={5}
                        resistance={750}
                        returnDuration={1.5}
                    />
                </div>
                <Controls className="bg-black/50 border border-white/10 fill-white text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </ReactFlow>

            {/* Control Panel Overlay */}
            <div className="absolute bottom-8 right-8 flex flex-col gap-4 pointer-events-none">
                {/* Scan Button */}
                <div className="pointer-events-auto">
                    <button
                        onClick={() => fetchDevices()}
                        disabled={isRefreshing}
                        className="flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-md border border-cyan-500/30 rounded-lg text-cyan-400 hover:bg-cyan-500/10 transition-all font-mono text-sm uppercase tracking-wider disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        {isRefreshing ? 'Scanning...' : 'Scan Hardware'}
                    </button>
                </div>

                {/* Device Controls */}
                {selectedNode && selectedNode.id !== 'host' && (
                    <div className="pointer-events-auto p-4 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl w-72 animate-in slide-in-from-right-10 fade-in duration-300">
                        <h3 className="text-white font-bold tracking-widest text-sm mb-1 uppercase truncate">
                            {selectedDeviceData.label}
                        </h3>
                        <p className="text-[10px] text-white/50 font-mono mb-2 uppercase break-all">
                            ID: {selectedNode.id}
                        </p>

                        {/* Hardware Details */}
                        <div className="mb-4 space-y-2">
                            <div className="flex items-start gap-2 bg-white/5 p-2 rounded text-[10px] font-mono text-cyan-200/80">
                                <Info className="w-3 h-3 mt-0.5 shrink-0" />
                                <span className="break-all">{selectedDeviceData.hardwareId || 'N/A'}</span>
                            </div>

                            {selectedDeviceData.batteryLevel !== undefined && (
                                <div className="flex items-center gap-2 bg-green-900/20 p-2 rounded text-xs font-mono text-green-400">
                                    <Battery className="w-4 h-4" />
                                    <span>Power: {selectedDeviceData.batteryLevel}%</span>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            <button
                                onClick={handleDisableDevice}
                                className="group flex items-center justify-between px-3 py-2 bg-red-900/20 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500 rounded-lg transition-all"
                            >
                                <span className="text-red-400 font-mono text-xs uppercase group-hover:text-red-300">Interrupt Signal</span>
                                <ShieldAlert className="w-4 h-4 text-red-500" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
