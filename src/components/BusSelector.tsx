import { Search, Navigation } from 'lucide-react';
import { useBusData, type Bus } from '../hooks/useBusData';
import { useUserLocation } from '../hooks/useUserLocation';
import { getDistance } from '../utils/distance';
import { useState, useMemo } from 'react';

export const BusSelector = () => {
    const { buses } = useBusData();
    const { location } = useUserLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');

    const filteredBuses = buses.filter(b =>
        b.name.toLowerCase().includes(search.toLowerCase())
    );

    const nearestBus = useMemo(() => {
        if (!location || buses.length === 0) return null;
        let minDistance = Infinity;
        let closest: (Bus & { distance: number }) | null = null;

        buses.forEach(bus => {
            const dist = getDistance(location.lat, location.lng, bus.lat, bus.lng);
            if (dist < minDistance) {
                minDistance = dist;
                closest = { ...bus, distance: dist };
            }
        });

        return closest;
    }, [buses, location]);

    return (
        <div className="absolute bottom-6 left-4 right-4 z-[1000] flex flex-col gap-2">
            {/* Toggle / Search Bar */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-4 border border-white/50 cursor-pointer transition-all active:scale-95"
            >
                <div className="flex items-center gap-3 text-gray-500">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder={buses.length > 0 ? `Search ${buses.length} active buses...` : "Waiting for buses..."}
                        className="bg-transparent w-full outline-none text-gray-900 placeholder-gray-500"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onClick={(e) => e.stopPropagation()} // Prevent closing/opening when typing
                    />
                </div>
            </div>

            {/* Nearest Bus Badge */}
            {nearestBus && !isOpen && (
                <div className="bg-blue-600 text-white p-3 rounded-2xl shadow-lg flex items-center justify-between cursor-pointer animate-fade-in mt-2" onClick={() => setIsOpen(true)}>
                    <div className="flex items-center gap-2">
                        <Navigation size={16} className="fill-current" />
                        <span className="text-sm font-medium">Nearest: <strong>{nearestBus.name}</strong></span>
                    </div>
                    <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                        {(nearestBus.distance / 1000).toFixed(1)} km
                    </span>
                </div>
            )}

            {/* List */}
            {isOpen && (
                <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 max-h-[40vh] overflow-y-auto scrollbar-hide">
                    <div className="p-2">
                        {filteredBuses.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 text-sm">
                                No active buses found.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-1">
                                {filteredBuses.map(bus => (
                                    <button
                                        key={bus.id}
                                        className="w-full text-left p-3 hover:bg-blue-50/50 rounded-xl transition-colors flex items-center justify-between group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                {bus.name.substring(0, 2)}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-800">{bus.name}</h3>
                                                <p className="text-[10px] text-gray-500">
                                                    Last active: {new Date(bus.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                            Active
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
