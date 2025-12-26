import { MapContainer, TileLayer, ZoomControl, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import { useBusData, type Bus } from '../hooks/useBusData';
import { BusMarker } from './BusMarker';
import 'leaflet/dist/leaflet.css';

interface MapProps {
    selectedBus: Bus | null;
}

// Component to handle flying to selected bus
const FlyToSelectedBus = ({ selectedBus }: { selectedBus: Bus | null }) => {
    const map = useMap();

    useEffect(() => {
        if (selectedBus) {
            map.flyTo([selectedBus.lat, selectedBus.lng], 17, {
                duration: 1.5
            });
        }
    }, [selectedBus, map]);

    return null;
};

export const Map = ({ selectedBus }: MapProps) => {
    const { buses, loading } = useBusData();

    // Default center (SRM University approx)
    const defaultCenter = { lat: 12.8231, lng: 80.0453 };

    return (
        <div className="w-full h-full relative z-0">
            <MapContainer
                center={[defaultCenter.lat, defaultCenter.lng]}
                zoom={15}
                zoomControl={false}
                className="w-full h-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <ZoomControl position="bottomright" />

                <FlyToSelectedBus selectedBus={selectedBus} />

                {!loading && buses.map(bus => (
                    <BusMarker key={bus.id} bus={bus} isSelected={selectedBus?.id === bus.id} />
                ))}
            </MapContainer>

            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-[1000] backdrop-blur-sm">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            )}
        </div>
    );
};
