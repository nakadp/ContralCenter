import React, { useState, useEffect } from 'react';
import {
    X, Edit3, Trash2, Power, CircuitBoard,
    Mouse, Keyboard, Monitor, Speaker, Server,
    HardDrive, Smartphone, Printer, Cpu, Wifi
} from 'lucide-react';

interface DeviceDetailsPanelProps {
    nodeId: string;
    deviceData: {
        label: string;
        hardwareId?: string;
        status?: string;
        batteryLevel?: number;
        deviceType?: string; // Original detected type
    };
    customName?: string;
    customIcon?: string;
    isDisabled: boolean;
    onClose: () => void;
    onRename: (newName: string) => void;
    onIconChange: (newIcon: string) => void;
    onToggleDisable: () => void;
    onDelete: () => void;
}

const AVAILABLE_ICONS = [
    { id: 'mouse', icon: Mouse, label: 'Mouse' },
    { id: 'keyboard', icon: Keyboard, label: 'Keyboard' },
    { id: 'monitor', icon: Monitor, label: 'Display' },
    { id: 'audio', icon: Speaker, label: 'Audio' },
    { id: 'hub', icon: Server, label: 'Hub' },
    { id: 'drive', icon: HardDrive, label: 'Storage' },
    { id: 'phone', icon: Smartphone, label: 'Mobile' },
    { id: 'printer', icon: Printer, label: 'Printer' },
    { id: 'cpu', icon: Cpu, label: 'Component' },
    { id: 'network', icon: Wifi, label: 'Network' },
];

export default function DeviceDetailsPanel({
    nodeId,
    deviceData,
    customName,
    customIcon,
    isDisabled,
    onClose,
    onRename,
    onIconChange,
    onToggleDisable,
    onDelete
}: DeviceDetailsPanelProps) {
    const [nameInput, setNameInput] = useState(customName || deviceData.label);
    const [isEditingName, setIsEditingName] = useState(false);

    // Sync input when prop changes (e.g. selecting a different node)
    useEffect(() => {
        setNameInput(customName || deviceData.label);
    }, [nodeId, customName, deviceData.label]);

    const handleNameSubmit = () => {
        onRename(nameInput);
        setIsEditingName(false);
    };

    return (
        <div className="pointer-events-auto w-80 h-full bg-black/80 backdrop-blur-2xl border-l border-white/10 flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <CircuitBoard className="w-5 h-5 text-cyan-400" />
                    <span className="text-sm font-bold tracking-widest text-white uppercase">Device Config</span>
                </div>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Content Container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

                {/* 1. Identity Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between group">
                        {isEditingName ? (
                            <div className="flex items-center gap-2 w-full">
                                <input
                                    type="text"
                                    value={nameInput}
                                    onChange={(e) => setNameInput(e.target.value)}
                                    onBlur={handleNameSubmit}
                                    onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
                                    className="w-full bg-white/5 border border-cyan-500/50 rounded px-2 py-1 text-sm text-cyan-100 placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
                                    autoFocus
                                />
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsEditingName(true)}
                                className="w-full text-left"
                            >
                                <h2 className="text-xl font-bold text-white leading-tight break-words hover:text-cyan-400 transition-colors">
                                    {nameInput}
                                    <Edit3 className="inline-block w-4 h-4 ml-2 text-white/30" />
                                </h2>
                            </button>
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase tracking-wider text-white/40">Hardware ID</span>
                            <code className="text-[10px] text-cyan-200/80 bg-cyan-950/30 px-2 py-1 rounded break-all border border-cyan-900/50">
                                {deviceData.hardwareId || 'UNKNOWN_ID'}
                            </code>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] uppercase tracking-wider text-white/40">Status</span>
                                <span className={`text-xs font-mono ${isDisabled ? 'text-red-400' : 'text-green-400'}`}>
                                    {isDisabled ? 'DISABLED' : (deviceData.status || 'ACTIVE')}
                                </span>
                            </div>
                            {deviceData.batteryLevel !== undefined && (
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] uppercase tracking-wider text-white/40">Power</span>
                                    <span className="text-xs font-mono text-yellow-400">
                                        {deviceData.batteryLevel}%
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. Visual Customization */}
                <div className="space-y-4">
                    <span className="text-xs font-bold text-white/90 uppercase tracking-widest border-l-2 border-fuchsia-500 pl-2">
                        Visual Override
                    </span>
                    <div className="grid grid-cols-5 gap-2">
                        {AVAILABLE_ICONS.map((item) => {
                            const IconComp = item.icon;
                            const isSelected = (customIcon || deviceData.deviceType) === item.id;

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => onIconChange(item.id)}
                                    title={item.label}
                                    className={`
                                        aspect-square flex items-center justify-center rounded-lg border transition-all duration-200
                                        ${isSelected
                                            ? 'bg-fuchsia-500/20 border-fuchsia-500 text-fuchsia-200 shadow-[0_0_15px_rgba(217,70,239,0.3)]'
                                            : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:text-white'
                                        }
                                    `}
                                >
                                    <IconComp className="w-5 h-5" />
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 3. Management Zone (Danger) */}
                <div className="pt-8 mt-auto space-y-3">
                    <span className="text-xs font-bold text-red-400/90 uppercase tracking-widest border-l-2 border-red-500 pl-2">
                        Danger Zone
                    </span>

                    <button
                        onClick={onToggleDisable}
                        className={`
                            w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-300
                            ${isDisabled
                                ? 'bg-green-900/20 border-green-500/30 text-green-400 hover:bg-green-500/20'
                                : 'bg-red-950/30 border-red-500/30 text-red-400 hover:bg-red-500/10'
                            }
                        `}
                    >
                        <span className="text-xs font-bold uppercase tracking-wider">
                            {isDisabled ? 'Enable Device' : 'Disable Device'}
                        </span>
                        <Power className={`w-4 h-4 ${isDisabled ? 'rotate-180' : ''}`} />
                    </button>

                    <button
                        onClick={onDelete}
                        className="w-full flex items-center justify-between px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white/40 hover:text-red-400 hover:border-red-500/50 hover:bg-red-950/20 transition-all duration-300 group"
                    >
                        <span className="text-xs font-bold uppercase tracking-wider">Remove Node</span>
                        <Trash2 className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                    </button>

                    <p className="text-[10px] text-white/30 text-center px-4 leading-relaxed">
                        Removing a node hides it from the topology map. Re-scan to detect if still connected.
                    </p>
                </div>
            </div>
        </div>
    );
}
