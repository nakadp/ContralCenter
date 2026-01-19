import { create } from 'zustand';
import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';

// Types
export interface RGBDevice {
    name: string;
    index: number;
    modes: string[];
    led_count: number;
}

export interface TelemetryData {
    temperature: number;
    humidity: number;
    power: number;
    cpu_load: number;
    memory_load: number;
    net_up: number;
    net_down: number;
    timestamp: string; // Added on frontend receive
}

export interface DriverInfo {
    name: string;
    isRunning: boolean;
    path: string; // Launch path
    icon?: string;
}

interface AppState {
    // RGB
    rgbDevices: RGBDevice[];
    fetchRgbDevices: () => Promise<void>;
    setRgbColor: (index: number, r: number, g: number, b: number) => Promise<void>;

    // IoT & Telemetry
    telemetryHistory: TelemetryData[];
    latestTelemetry: TelemetryData | null;

    // Drivers
    drivers: DriverInfo[];
    checkDriverStatus: (name: string) => Promise<void>;
    launchDriver: (path: string) => Promise<void>;

    // Init
    initListeners: () => void;
}

export const useStore = create<AppState>((set, get) => ({
    // --- RGB ---
    rgbDevices: [],
    fetchRgbDevices: async () => {
        try {
            const devices = await invoke<RGBDevice[]>('scan_rgb_devices');
            set({ rgbDevices: devices });
        } catch (e) {
            console.error("Failed to specific RGB devices", e);
        }
    },
    setRgbColor: async (index, r, g, b) => {
        await invoke('set_rgb_color', { index, r, g, b });
    },

    // --- IoT ---
    telemetryHistory: [],
    latestTelemetry: null,

    // --- Drivers ---
    // Hardcoded list for now, ideally dynamic or config based
    drivers: [
        { name: "LGHAudio", isRunning: false, path: "C:\\Program Files\\LGHUB\\lghub.exe" }, // Example process name often found
        { name: "lghub", isRunning: false, path: "C:\\Program Files\\LGHUB\\lghub.exe" },
        { name: "Steam", isRunning: false, path: "C:\\Program Files (x86)\\Steam\\steam.exe" }
    ],
    checkDriverStatus: async (name) => {
        try {
            const isRunning = await invoke<boolean>('check_driver_status', { name });
            set((state) => ({
                drivers: state.drivers.map(d =>
                    d.name === name ? { ...d, isRunning } : d
                )
            }));
        } catch (e) {
            console.error(`Failed to check driver ${name}`, e);
        }
    },
    launchDriver: async (path) => {
        await invoke('launch_driver', { path });
        // Optimistic update not needed, polling or re-check will handle it
    },

    // --- Init ---
    initListeners: () => {
        // Listen for IoT Data
        listen<Omit<TelemetryData, 'timestamp'>>('iot-data', (event) => {
            const newData = { ...event.payload, timestamp: new Date().toLocaleTimeString() };
            set((state) => {
                const history = [...state.telemetryHistory, newData].slice(-50); // Keep last 50
                return {
                    telemetryHistory: history,
                    latestTelemetry: newData
                };
            });
        });

        // Initial Fetch
        get().fetchRgbDevices();

        // Poll Drivers Status every 5s
        setInterval(() => {
            const { drivers, checkDriverStatus } = get();
            drivers.forEach(d => checkDriverStatus(d.name));
        }, 5000);
    }
}));
