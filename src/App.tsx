import { useEffect } from "react";
import { Layout } from "./components/Layout";
import { Card } from "./components/Card";
import { Activity, Cpu, Network, Zap } from "lucide-react";
// import { useHardware } from "./hooks/useHardware";
import { listen } from "@tauri-apps/api/event";
import { TopologyMap } from "./components/TopologyMap";
import { RGBPanel } from "./components/RGBPanel";
import { IoTMonitor } from "./components/IoTMonitor";
import { DriverHub } from "./components/DriverHub";
import { useStore } from "./store";
import { cn } from "./lib/utils";

function App() {
  const { initListeners, latestTelemetry } = useStore();



  useEffect(() => {
    initListeners();

    const unlisten = listen("ipad-command", (event) => {
      console.log("Remote Command Recv:", event.payload);
      // Future: Switch on payload (toggle_fan, toggle_rgb, etc)
    });

    return () => {
      unlisten.then(f => f());
    };
  }, [initListeners]);

  // Format helper
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + sizes[i]; // Simplify to 1 decimal
  };

  const getMetricColor = (val: number) => {
    if (val > 80) return "text-accent-magenta";
    if (val > 50) return "text-yellow-400";
    return "text-accent-cyan";
  };

  return (
    <Layout>
      {/* HUD Header */}
      <header className="flex items-center justify-between mb-6 px-2 h-16 shrink-0 z-20">
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold text-white tracking-widest font-mono">TOPOLOGY_MAP</h2>
          <div className="h-0.5 w-12 bg-accent-cyan/50 mt-1" />
        </div>

        {/* HUD Stats Strip */}
        <div className="flex items-center gap-4 bg-black/40 border border-white/10 px-6 py-2 rounded-full backdrop-blur-md">
          {/* CPU */}
          <div className="flex items-center gap-3 border-r border-white/10 pr-6">
            <Cpu className="w-4 h-4 text-accent-cyan" />
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-gray-400 font-mono opacity-50">CPU:</span>
              <span className={cn("text-lg font-bold font-mono text-hud w-12 text-right", getMetricColor(latestTelemetry?.cpu_load || 0))}>
                {latestTelemetry?.cpu_load.toFixed(0)}%
              </span>
              <span className="text-xs text-gray-400 font-mono opacity-50">55°C</span>
            </div>
          </div>

          {/* GPU (Mock) */}
          <div className="flex items-center gap-3 border-r border-white/10 pr-6">
            <Activity className="w-4 h-4 text-accent-magenta" />
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-gray-400 font-mono opacity-50">GPU:</span>
              <span className="text-lg font-bold font-mono text-hud text-accent-magenta w-10 text-right">8%</span>
              <span className="text-xs text-gray-400 font-mono opacity-50">42°C</span>
            </div>
          </div>

          {/* Network */}
          <div className="flex items-center gap-3">
            <Network className="w-4 h-4 text-white/70" />
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-sm">
                <span className="text-gray-500 text-xs mr-1 opacity-50">↓</span>
                {formatBytes(latestTelemetry?.net_down || 0)}/s
              </span>
              <span className="font-mono text-sm">
                <span className="text-gray-500 text-xs mr-1 opacity-50">↑</span>
                {formatBytes(latestTelemetry?.net_up || 0)}/s
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">

        {/* Left: Topology (8 cols) */}
        <div className="lg:col-span-9 h-full min-h-0 flex flex-col">
          <Card className="flex-1 relative overflow-hidden group p-0 bg-transparent border-0 ring-1 ring-white/5">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
            <TopologyMap />
          </Card>
        </div>

        {/* Right: Details Panel (4 cols) */}
        <div className="lg:col-span-3 h-full min-h-0 flex flex-col gap-4 overflow-y-auto pr-2 pb-2">

          {/* Device Details Header */}
          <div className="p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md flex items-start justify-between shrink-0">
            <div>
              <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-1">DEVICE DETAILS:</div>
              <div className="text-xl font-bold text-white">Logitech G Pro X</div>
            </div>
            <button className="text-gray-500 hover:text-white transition-colors">✕</button>
          </div>

          {/* RGB Control */}
          <div className="shrink-0 h-[320px]">
            <RGBPanel />
          </div>

          {/* Driver Integration */}
          <div className="shrink-0">
            <DriverHub />
          </div>

          {/* Telemetry Chart */}
          <div className="flex-1 min-h-[200px]">
            <IoTMonitor />
          </div>

          {/* Environment Tiny Panel */}
          <div className="p-4 rounded-xl border border-white/10 bg-black/40 flex items-center justify-between shrink-0">
            <div>
              <div className="text-[10px] text-gray-500 font-mono">Indoor Temp</div>
              <div className="text-lg font-bold text-white">24°C</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 font-mono">Humidity</div>
              <div className="text-lg font-bold text-white">45%</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-gray-500 font-mono">PC Power</div>
              <div className="text-lg font-bold text-white flex items-center justify-end gap-1">
                <Zap className="w-3 h-3 text-yellow-400 fill-yellow-400" /> 120W
              </div>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}

export default App;
