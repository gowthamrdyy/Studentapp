import { useState } from 'react';
import { useBusData, type Bus } from '../hooks/useBusData';
import { Bus as BusIcon, MapPin, Radio, Search } from 'lucide-react';

interface BusListProps {
    onSelectBus: (bus: Bus) => void;
    selectedBusId?: string;
}

export const BusList = ({ onSelectBus, selectedBusId }: BusListProps) => {
    const { buses, loading } = useBusData();
    const [search, setSearch] = useState('');

    const filteredBuses = buses.filter(bus =>
        bus.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </div>

            {/* Header + Search */}
            <div className="px-4 pb-3 border-b border-gray-100 space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900">Active Buses</h2>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                        <Radio size={12} className="animate-pulse" />
                        <span>{buses.length} Online</span>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
                    <Search size={16} className="text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search bus (AA1, AB1...)"
                        className="bg-transparent flex-1 text-sm outline-none text-gray-700 placeholder-gray-400"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Bus Grid */}
            <div className="flex-1 overflow-y-auto p-4">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                    </div>
                ) : filteredBuses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <BusIcon size={48} className="mb-2 opacity-50" />
                        <p className="text-sm">{search ? 'No buses found' : 'No buses online'}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        {filteredBuses.map(bus => (
                            <div
                                key={bus.id}
                                onClick={() => onSelectBus(bus)}
                                className={`rounded-2xl p-4 border hover:shadow-md transition-all active:scale-95 cursor-pointer ${selectedBusId === bus.id
                                        ? 'bg-blue-600 border-blue-600 text-white'
                                        : 'bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-100'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${selectedBusId === bus.id
                                            ? 'bg-white text-blue-600'
                                            : 'bg-blue-600 text-white'
                                        }`}>
                                        <BusIcon size={20} />
                                    </div>
                                    <div className={`w-2.5 h-2.5 rounded-full animate-pulse shadow-sm ${selectedBusId === bus.id
                                            ? 'bg-green-300 shadow-green-300/50'
                                            : 'bg-green-500 shadow-green-500/50'
                                        }`} />
                                </div>
                                <h3 className={`font-bold text-lg ${selectedBusId === bus.id ? 'text-white' : 'text-gray-900'}`}>
                                    {bus.name}
                                </h3>
                                <div className={`flex items-center gap-1 text-xs mt-1 ${selectedBusId === bus.id ? 'text-blue-100' : 'text-gray-500'
                                    }`}>
                                    <MapPin size={10} />
                                    <span>Tap to locate</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
