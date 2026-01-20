import { useEffect } from "react";
import { Layout } from "./components/Layout";
import { Card } from "./components/Card";
// import { useHardware } from "./hooks/useHardware";
import { listen } from "@tauri-apps/api/event";
import { Thermometer, Droplets, Zap, X } from "lucide-react";
import { TopologyMap } from "./components/TopologyMap";
import { RGBPanel } from "./components/RGBPanel";
import { IoTMonitor } from "./components/IoTMonitor";
import { DriverHub } from "./components/DriverHub";
import { useStore } from "./store";

function App() {
  const { initListeners } = useStore();



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

  return (
    <Layout>
      {/* Global Background Grid with Animation */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/bg-grid.svg')] bg-[length:50px_50px] opacity-20 animate-grid-scan" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      </div>

      {/* Main Content Grid - Adjusted for Full Height No Scroll */}
      <div className="flex-1 flex min-h-0 z-10 overflow-hidden">

        {/* Left: Topology (Flex-1) */}
        <div className="flex-1 h-full min-h-0 flex flex-col relative p-6 pr-0">
          {/* Topology uses standard GlassCard now */}
          <Card className="flex-1 relative overflow-hidden group p-0 border-white/10 bg-black/40">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm -z-10" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            <TopologyMap />
          </Card>
        </div>

        {/* Right: Details Panel (Fixed Width) - NO SCROLL */}
        <div className="w-[22vw] min-w-[320px] max-w-[400px] h-full min-h-0 flex flex-col gap-4 overflow-hidden shrink-0 p-4">

          {/* CONTAINER 1: Device Details Big Card (Flex 5.5) */}
          <Card className="flex-[5.5] min-h-0 flex flex-col gap-3 p-4 border-white/20 bg-black/40 backdrop-blur-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

            {/* Internal: Header (Flex 0.4) */}
            <div className="flex-[0.4] min-h-[50px] flex items-center justify-between shrink-0 relative overflow-hidden group border-b border-white/10 mb-2">
              <div className="relative z-10 w-full">
                <div className="flex justify-between items-start">
                  <div className="text-[clamp(10px,0.8vw,12px)] text-white/50 font-bold uppercase tracking-[0.3em] mb-1">DEVICE DETAILS:</div>
                  <button className="text-white/30 hover:text-white transition-colors"><X size={14} /></button>
                </div>
                <div className="text-base font-bold text-white tracking-wider mt-0.5" style={{ fontSize: 'clamp(14px, 1vw, 16px)' }}>LOGITECH G PRO X</div>
              </div>
            </div>

            {/* Internal: RGB (Flex 1) */}
            <div className="flex-1 min-h-0">
              <RGBPanel />
            </div>

            {/* Internal: Driver (Flex 0.8) */}
            <div className="flex-[0.8] min-h-0">
              <DriverHub />
            </div>

            {/* Internal: Telemetry (Flex 1) */}
            <div className="flex-1 min-h-0">
              <IoTMonitor />
            </div>
          </Card>

          {/* CONTAINER 2: IoT Footer (Flex 1) */}
          <Card className="flex-1 min-h-0 py-2 px-3 rounded-xl border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md grid grid-cols-3 divide-x divide-white/10 relative overflow-hidden items-center">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />

            <div className="relative z-10 flex flex-col items-center justify-center p-1 h-full">
              <Thermometer size={16} className="text-accent-cyan/60 mb-1" />
              <div className="text-sm font-bold text-white font-mono">24<span className="text-[10px] text-white/30">°C</span></div>
              <div className="text-[9px] text-white/30 uppercase tracking-wider mt-1">Indoor</div>
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center p-1 h-full">
              <Droplets size={16} className="text-accent-cyan/60 mb-1" />
              <div className="text-sm font-bold text-white font-mono">45<span className="text-[10px] text-white/30">%</span></div>
              <div className="text-[9px] text-white/30 uppercase tracking-wider mt-1">Humidity</div>
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center p-1 h-full">
              <Zap size={16} className="text-accent-cyan/60 mb-1" />
              <div className="text-sm font-bold text-white font-mono">120<span className="text-[10px] text-white/30">W</span></div>
              <div className="text-[9px] text-white/30 uppercase tracking-wider mt-1">PC Power</div>
            </div>
          </Card>

        </div>
      </div>
    </Layout>
  );
}

export default App;
