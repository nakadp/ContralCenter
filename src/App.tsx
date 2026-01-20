import { useEffect } from "react";
import { Layout } from "./components/Layout";
import { Card } from "./components/Card";
// import { useHardware } from "./hooks/useHardware";
import { listen } from "@tauri-apps/api/event";
import { X } from "lucide-react";
import { TopologyMap } from "./components/TopologyMap";
import { RGBPanel } from "./components/RGBPanel";
import { IoTMonitor } from "./components/IoTMonitor";
import { DriverHub } from "./components/DriverHub";
import { EnvironmentFooter } from "./components/EnvironmentFooter";
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
        <div className="w-[22vw] min-w-[320px] max-w-[400px] h-screen overflow-hidden shrink-0 flex flex-col gap-4 p-4 relative z-20">

          {/* CONTAINER 1: Device Details Big Card (Flex 1 to fill available space minus footer) */}
          <Card className="flex-1 min-h-0 flex flex-col gap-3 p-4 border-l border-t border-t-white/20 border-l-white/20 border-r-0 border-b-0 bg-black/40 backdrop-blur-3xl relative overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

            {/* Internal: Header (Flex 0.4) */}
            <div className="flex-none min-h-[50px] flex items-center justify-between shrink-0 relative overflow-hidden group border-b border-white/10 mb-1 pb-2">
              <div className="relative z-10 w-full">
                <div className="flex justify-between items-start">
                  <div className="text-[10px] text-white/30 font-bold uppercase tracking-[0.3em] mb-1">DEVICE DETAILS:</div>
                  <button className="text-white/30 hover:text-white transition-colors"><X size={14} /></button>
                </div>
                <div className="text-sm font-bold tracking-tight text-white mt-0.5">LOGITECH G PRO X</div>
              </div>
            </div>


            {/* Internal: RGB (Auto Height) */}
            <div className="shrink-0">
              <RGBPanel />
            </div>

            {/* Internal: Driver (Fixed) */}
            <div className="shrink-0">
              <DriverHub />
            </div>

            {/* Internal: Telemetry (Flex - Fills remaining) */}
            <div className="flex-1 min-h-0 relative">
              <IoTMonitor />
            </div>
          </Card>


          {/* CONTAINER 2: IoT Footer (Fixed Height) */}
          <EnvironmentFooter />

        </div>
      </div>
    </Layout>
  );
}

export default App;
