import { divIcon } from 'leaflet';
import { Marker, Popup } from 'react-leaflet';
import { renderToString } from 'react-dom/server';
import type { Bus } from '../hooks/useBusData';
import { useAnimatedPosition } from '../hooks/useAnimatedPosition';
import { getBearing } from '../utils/bearing';
import { useRef } from 'react';

interface BusMarkerProps {
    bus: Bus;
    isSelected?: boolean;
}

// Function to create a custom HTML icon
const createBusIcon = (heading: number, isSelected: boolean = false) => {
    // Top-down bus SVG
    const busSvg = `
    <svg viewBox="0 0 100 200" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <!-- Shadow/Glow -->
        <filter id="glow">
            <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
            <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
        </filter>
        
        <!-- Bus Body -->
        <rect x="15" y="10" width="70" height="180" rx="15" ry="15" fill="${isSelected ? '#22c55e' : '#2563eb'}" stroke="white" stroke-width="4" filter="url(#glow)" />
        
        <!-- Windshield (Front) -->
        <path d="M 20 25 Q 50 15 80 25 L 80 50 Q 50 45 20 50 Z" fill="#93c5fd" opacity="0.9" />
        
        <!-- Rear Window -->
        <rect x="25" y="170" width="50" height="15" rx="2" fill="#93c5fd" opacity="0.8" />
        
        <!-- Roof Details/AC -->
        <rect x="30" y="80" width="40" height="60" rx="5" fill="rgba(255,255,255,0.2)" />
        <line x1="15" y1="120" x2="85" y2="120" stroke="rgba(255,255,255,0.1)" stroke-width="2" />
        
        <!-- Headlights -->
        <circle cx="25" cy="12" r="4" fill="#fbbf24" />
        <circle cx="75" cy="12" r="4" fill="#fbbf24" />
        
        <!-- Side Mirrors -->
        <rect x="5" y="30" width="10" height="15" rx="2" fill="${isSelected ? '#166534' : '#1e40af'}" />
        <rect x="85" y="30" width="10" height="15" rx="2" fill="${isSelected ? '#166534' : '#1e40af'}" />
    </svg>
    `;

    const html = renderToString(
        <div className="relative group">
            {/* Pulsing effect underneath */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-400 opacity-20 animate-ping ${isSelected ? 'w-24 h-24' : 'w-16 h-16'}`} />

            <div
                className={`transition-all duration-300 ${isSelected ? 'scale-110 z-50 drop-shadow-2xl' : 'drop-shadow-lg'}`}
                style={{
                    width: isSelected ? '50px' : '40px',
                    height: isSelected ? '100px' : '80px', // Aspect ratio 1:2
                    transform: `rotate(${heading}deg)`,
                    transition: 'transform 0.5s ease-out'
                }}
                dangerouslySetInnerHTML={{ __html: busSvg }}
            />
        </div>
    );

    return divIcon({
        html: html,
        className: 'bg-transparent', // Remove default leaflet square bg style
        iconSize: [50, 100], // Match the div size + padding
        iconAnchor: [25, 50], // Center it (half width, half height)
        popupAnchor: [0, -50], // Popup above the bus
    });
};

export const BusMarker = ({ bus, isSelected = false }: BusMarkerProps) => {
    // Store previous position to calculate bearing if needed
    const prevPos = useRef({ lat: bus.lat, lng: bus.lng });

    // Calculate heading if not stored
    let heading = bus.heading || 0;

    // Calculate new heading if moved significantly
    if (prevPos.current.lat !== bus.lat || prevPos.current.lng !== bus.lng) {
        const newHeading = getBearing(prevPos.current.lat, prevPos.current.lng, bus.lat, bus.lng);
        // Filter out small jitter (less than 1 degree)
        if (Math.abs(newHeading - heading) > 1) {
            heading = newHeading;
        }
        prevPos.current = { lat: bus.lat, lng: bus.lng };
    }

    // Use our custom hook to interpolate position smoothly
    // 2000ms duration ensures smooth glide between 3-5s typical firebase updates
    const animatedPos = useAnimatedPosition({
        lat: bus.lat,
        lng: bus.lng,
        heading: heading || 0
    }, 2000);

    return (
        <Marker
            position={[animatedPos.lat, animatedPos.lng]}
            icon={createBusIcon(animatedPos.heading, isSelected)}
            zIndexOffset={isSelected ? 1000 : 0}
        >
            <Popup className="bus-popup">
                <div className="p-2 min-w-[150px]">
                    <h3 className="font-bold text-lg text-blue-900">{bus.name}</h3>
                    <p className="text-xs text-gray-500">
                        Status: <span className="font-semibold text-green-600">Online</span>
                        <br />
                        Last updated: {new Date(bus.timestamp).toLocaleTimeString()}
                    </p>
                </div>
            </Popup>
        </Marker>
    );
};
