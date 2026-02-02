import { useState } from 'react';
import LeftNav from './components/Sidebar/LeftNav';
import RightPanel from './components/Sidebar/RightPanel';
import TopologyMap from './components/Topology/TopologyMap';
import DataAnalysisView from './components/DataAnalysis/DataAnalysisView';
import AnalysisParameters from './components/DataAnalysis/AnalysisParameters';

type ViewType = 'dashboard' | 'analysis';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');

  return (
    <div className="flex w-screen h-screen overflow-hidden scanlines relative text-white selection:bg-aether-cyan selection:text-black">
      {/* Left Navigation */}
      <LeftNav currentView={currentView} onSelect={setCurrentView} />

      {/* Center Content - Flex 1 */}
      <main className="flex-1 relative overflow-hidden flex flex-col justify-center items-center">
        {currentView === 'dashboard' ? (
          <div className="w-full h-full bg-black/20">
            <TopologyMap />
          </div>
        ) : (
          /* Analysis View: Floating Card Container */
          <div className="w-full h-full p-6 pr-0 flex gap-6">
            {/* Main Chart Card */}
            <div className="flex-1 min-w-0">
              <DataAnalysisView />
            </div>
          </div>
        )}
      </main>

      {/* Right Sidebar */}
      {currentView === 'dashboard' ? (
        <RightPanel />
      ) : (
        /* Analysis View: Floating Right Card */
        <div className="w-[25%] min-w-[320px] p-6 h-full flex-shrink-0">
          <AnalysisParameters />
        </div>
      )}
    </div>
  );
}

export default App;
