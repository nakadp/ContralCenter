import { useEffect } from "react";
import { Layout } from "./components/Layout";
import { Card } from "./components/Card";
import { Button } from "./components/Button";
import { Activity, Cpu, HardDrive, Network } from "lucide-react";
import { useHardware } from "./hooks/useHardware";
import { TopologyMap } from "./components/TopologyMap";
import { RGBPanel } from "./components/RGBPanel";
import { IoTMonitor } from "./components/IoTMonitor";
import { DriverHub } from "./components/DriverHub";
import { useStore } from "./store";

function App() {
  const { devices, refresh } = useHardware();
  const { initListeners, latestTelemetry } = useStore();

  useEffect(() => {
    initListeners();
  }, [initListeners]);

  // Format helper
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Layout>
      <header className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Aether Core <span className="text-accent-cyan text-sm align-top">v0.9</span></h2>
          <p className="text-gray-400">Phase 4: Integration / Liquid Glass</p>
        </div>
        <div className="flex gap-4">
          <Button variant="ghost" onClick={refresh}>Refresh Hardware</Button>
          <Button variant="primary" glow>System Ready</Button>
        </div>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm font-medium">CPU LOAD</span>
            <Cpu className="w-5 h-5 text-accent-cyan" />
          </div>
          <div className="text-3xl font-bold text-white mb-2">{latestTelemetry?.cpu_load.toFixed(1) || 0}%</div>
          <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-accent-cyan transition-all duration-500 ease-out" style={{ width: `${latestTelemetry?.cpu_load || 0}%` }} />
          </div>
        </Card>

        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm font-medium">MEMORY</span>
            <Activity className="w-5 h-5 text-accent-magenta" />
          </div>
          <div className="text-3xl font-bold text-white mb-2">{formatBytes(latestTelemetry?.memory_load || 0)}</div>
          <div className="text-xs text-gray-500">Used</div>
        </Card>

        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm font-medium">NETWORK</span>
            <Network className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-white font-mono text-sm">↓ {formatBytes(latestTelemetry?.net_down || 0)}/s</span>
            <span className="text-gray-400 font-mono text-xs">↑ {formatBytes(latestTelemetry?.net_up || 0)}/s</span>
          </div>
        </Card>

        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm font-medium">DEVICES</span>
            <HardDrive className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-2">{devices.length}</div>
          <div className="text-xs text-green-400">Total Detectable</div>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Topology Map (2/3 width) */}
        <Card className="lg:col-span-2 h-[400px] relative overflow-hidden group p-0 bg-transparent border-0">
          <TopologyMap />
        </Card>

        {/* RGB Control (1/3 width) */}
        <div className="lg:col-span-1 h-[400px]">
          <RGBPanel />
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* IoT Monitor (2/3 width) */}
        <div className="lg:col-span-2 h-[350px]">
          <IoTMonitor />
        </div>

        {/* Driver Hub (1/3 width) */}
        <div className="lg:col-span-1 h-[350px]">
          <DriverHub />
        </div>
      </div>
    </Layout>
  );
}

export default App;
