import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import Database from "@tauri-apps/plugin-sql";

export interface Device {
    id: string; // Hardware ID from Rust
    name: string; // Friendly name from Rust
    class: string;
    alias?: string; // User defined alias
    icon?: string; // User defined icon
}

export function useHardware() {
    const [devices, setDevices] = useState<Device[]>([]);
    const [loading, setLoading] = useState(true);
    const [db, setDb] = useState<Database | null>(null);

    // Initialize DB
    useEffect(() => {
        Database.load("sqlite:aether.db").then(setDb).catch(console.error);
    }, []);

    const fetchDevices = useCallback(async () => {
        try {
            // 1. Get raw devices from Rust
            const rawDevices = await invoke<Device[]>("get_devices");

            // 2. Get aliases from DB if available
            let aliases: Record<string, { alias: string, icon: string }> = {};

            if (db) {
                const rows = await db.select<any[]>("SELECT * FROM device_aliases");
                rows.forEach((row) => {
                    aliases[row.hardware_id] = { alias: row.alias, icon: row.icon };
                });
            }

            // 3. Merge
            const merged = rawDevices.map(d => ({
                ...d,
                alias: aliases[d.id]?.alias,
                icon: aliases[d.id]?.icon,
            }));

            setDevices(merged);
        } catch (e) {
            console.error("Failed to fetch devices", e);
        } finally {
            setLoading(false);
        }
    }, [db]);

    // Initial fetch and listener
    useEffect(() => {
        fetchDevices();

        const unlisten = listen("device-change", () => {
            console.log("Device change detected, refreshing...");
            fetchDevices();
        });

        return () => {
            unlisten.then(f => f());
        };
    }, [fetchDevices]);

    const setAlias = async (id: string, alias: string) => {
        if (!db) return;
        await db.execute(
            "INSERT INTO device_aliases (hardware_id, alias) VALUES ($1, $2) ON CONFLICT(hardware_id) DO UPDATE SET alias = $2",
            [id, alias]
        );
        fetchDevices();
    };

    return { devices, loading, setAlias, refresh: fetchDevices };
}
