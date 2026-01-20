import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Fan, Lightbulb, Wifi, Cast, Power, Music, Cpu, Thermometer } from 'lucide-react';
import './index.css';

// --- Types ---
type View = 'connect' | 'dashboard';

// --- Connect Screen ---
const ConnectScreen = ({ onConnect }: { onConnect: (ip: string) => void }) => {
  const [ip, setIp] = useState('');

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black text-white p-8 font-mono">
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-6 max-w-md w-full"
      >
        <div className="text-4xl font-bold tracking-[0.2em] text-cyan-400">AETHER</div>
        <div className="text-xs text-gray-500 uppercase tracking-widest mb-8">Remote Command Interface</div>

        <input
          type="text"
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          placeholder="ENTER HOST IP"
          className="w-full bg-gray-900 border border-gray-700 text-center text-xl p-4 rounded-lg focus:border-cyan-400 focus:outline-none focus:shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all placeholder:text-gray-700"
        />

        <button
          onClick={() => onConnect(ip)}
          className="w-full bg-cyan-900/30 border border-cyan-500/50 text-cyan-400 p-4 rounded-lg font-bold tracking-widest hover:bg-cyan-500 hover:text-black transition-all shadow-[0_0_15px_rgba(34,211,238,0.2)]"
        >
          INITIATE UPLINK
        </button>
      </motion.div>
    </div>
  );
};

// --- Dashboard Component ---
const Dashboard = ({ ws }: { ws: WebSocket | null }) => {
  const [telemetry, setTelemetry] = useState({ cpu: 0, temp: 0, gpu: 0, ram: 0 });

  useEffect(() => {
    if (!ws) return;

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'TELEM_UPDATE') {
          const data = msg.data;
          // Map PC telemetry to iPad View
          setTelemetry({
            cpu: Math.round(data.cpu_load || 0),
            temp: Math.round(data.temperature || 0),
            gpu: 0, // Not yet in sysinfo struct
            ram: Math.round(data.memory_load || 0)
          });
        }
      } catch (e) {
        // Ignore non-json
      }
    };
  }, [ws]);

  const sendCommand = (cmd: string) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(cmd);
    }
  };

  return (
    <div className="h-screen bg-black text-white p-6 grid grid-cols-3 gap-6 font-sans overflow-hidden">
      {/* Column 1: Telemetry */}
      <div className="col-span-1 flex flex-col gap-4">
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 flex flex-col gap-2 h-1/3 justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-2 text-cyan-400 mb-2">
            <Cpu size={20} /> <span className="text-xs font-bold tracking-widest">CPU LOAD</span>
          </div>
          <div className="text-5xl font-mono font-bold text-white">{telemetry.cpu}%</div>
          <div className="w-full bg-gray-800 h-1 mt-2 rounded-full overflow-hidden">
            <div className="bg-cyan-400 h-full" style={{ width: `${telemetry.cpu}%` }} />
          </div>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 flex flex-col gap-2 h-1/3 justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-2 text-orange-400 mb-2">
            <Thermometer size={20} /> <span className="text-xs font-bold tracking-widest">THERMAL</span>
          </div>
          <div className="text-5xl font-mono font-bold text-white">{telemetry.temp}°C</div>
          <div className="w-full bg-gray-800 h-1 mt-2 rounded-full overflow-hidden">
            <div className="bg-orange-400 h-full" style={{ width: `${telemetry.temp}%` }} />
          </div>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 flex flex-col gap-2 h-1/3 justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-2 text-purple-400 mb-2">
            <Activity size={20} /> <span className="text-xs font-bold tracking-widest">RAM USAGE</span>
          </div>
          <div className="text-5xl font-mono font-bold text-white">{telemetry.ram}%</div>
          <div className="w-full bg-gray-800 h-1 mt-2 rounded-full overflow-hidden">
            <div className="bg-purple-400 h-full" style={{ width: `${telemetry.ram}%` }} />
          </div>
        </div>
      </div>

      {/* Column 2: Controls */}
      <div className="col-span-1 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4 h-full">
          <button onClick={() => sendCommand('toggle_fan')} className="bg-gray-900/80 border border-gray-700 rounded-2xl flex flex-col items-center justify-center gap-4 hover:bg-cyan-900/20 hover:border-cyan-500 active:scale-95 transition-all">
            <Fan size={48} className="text-gray-400" />
            <span className="font-bold text-gray-300">FANS</span>
          </button>
          <button onClick={() => sendCommand('toggle_rgb')} className="bg-gray-900/80 border border-gray-700 rounded-2xl flex flex-col items-center justify-center gap-4 hover:bg-magenta-900/20 hover:border-magenta-500 active:scale-95 transition-all">
            <Lightbulb size={48} className="text-gray-400" />
            <span className="font-bold text-gray-300">LIGHTS</span>
          </button>
          <button onClick={() => sendCommand('toggle_sleep')} className="bg-gray-900/80 border border-gray-700 rounded-2xl flex flex-col items-center justify-center gap-4 hover:bg-yellow-900/20 hover:border-yellow-500 active:scale-95 transition-all">
            <Power size={48} className="text-gray-400" />
            <span className="font-bold text-gray-300">SLEEP</span>
          </button>
          <button onClick={() => sendCommand('toggle_app')} className="bg-gray-900/80 border border-gray-700 rounded-2xl flex flex-col items-center justify-center gap-4 hover:bg-green-900/20 hover:border-green-500 active:scale-95 transition-all">
            <Cast size={48} className="text-gray-400" />
            <span className="font-bold text-gray-300">DISPLAY</span>
          </button>
        </div>
      </div>

      {/* Column 3: Media/Status */}
      <div className="col-span-1 bg-gray-900/30 border border-gray-800 rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4">
          <Wifi className="text-green-500 w-6 h-6 animate-pulse" />
        </div>
        <div className="flex flex-col h-full justify-end">
          <div className="flex items-center gap-4 mb-4 opacity-50">
            <Music size={24} />
            <span className="text-sm tracking-widest">NOW PLAYING</span>
          </div>
          <div className="text-3xl font-bold mb-2">Cyberpunk 2077 OST</div>
          <div className="text-xl text-gray-400 mb-8">V's Theme</div>

          <div className="flex gap-4">
            <button className="flex-1 bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200">PREV</button>
            <button className="flex-1 bg-accent-magenta text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(255,0,229,0.4)]">PAUSE</button>
            <button className="flex-1 bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200">NEXT</button>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [view, setView] = useState<View>('connect');
  const [ws, setWs] = useState<WebSocket | null>(null);

  const connect = (ip: string) => {
    if (!ip) return;
    try {
      const socket = new WebSocket(`ws://${ip}:8080/ws`);
      socket.onopen = () => {
        console.log('Connected');
        setWs(socket);
        setView('dashboard');
      };
      socket.onerror = (e) => {
        console.error('Connection Failed', e);
        alert('Connection Failed. Check IP and Firewall.');
      };
    } catch (e) {
      alert('Invalid IP or Socket Error');
    }
  };

  return (
    <div className="w-full h-full bg-black">
      {view === 'connect' ? (
        <ConnectScreen onConnect={connect} />
      ) : (
        <Dashboard ws={ws} />
      )}
    </div>
  );
}

export default App;
