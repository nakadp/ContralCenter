import { useState } from 'react';
import LeftNav from './components/Sidebar/LeftNav';
import RightPanel from './components/Sidebar/RightPanel';
import TopologyMap from './components/Topology/TopologyMap';

function App() {
  return (
    <div className="flex w-screen h-screen overflow-hidden scanlines relative text-white selection:bg-aether-cyan selection:text-black">
      {/* Left Navigation */}
      <LeftNav />

      {/* Center Content - Flex 1 */}
      <main className="flex-1 relative overflow-hidden bg-black/20 flex flex-col justify-center items-center">
        <TopologyMap />
      </main>

      {/* Right Sidebar */}
      <RightPanel />
    </div>
  );
}

export default App;
