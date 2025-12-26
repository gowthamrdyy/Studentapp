import { useState } from 'react';
import { Map } from './components/Map';
import { Header } from './components/Header';
import { BusList } from './components/BusList';
import type { Bus } from './hooks/useBusData';

function App() {
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);

  return (
    <div className="w-full h-screen flex flex-col bg-gray-100 overflow-hidden">
      {/* Header */}
      <Header />

      {/* Map - Top Half */}
      <div className="flex-1 relative min-h-0">
        <Map selectedBus={selectedBus} />
      </div>

      {/* Bus List - Bottom Half */}
      <div className="h-1/2 bg-white rounded-t-3xl shadow-2xl overflow-hidden flex flex-col">
        <BusList onSelectBus={setSelectedBus} selectedBusId={selectedBus?.id} />
      </div>
    </div>
  );
}

export default App;
