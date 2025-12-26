import { useEffect, useState } from 'react';
import { onValue, ref } from 'firebase/database';
import { database } from '../firebase';

export interface Bus {
    id: string;
    name: string;
    lat: number;
    lng: number;
    heading?: number;
    timestamp: number;
    lastUpdated?: string;
}

export const useBusData = () => {
    const [buses, setBuses] = useState<Bus[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const locationsRef = ref(database, 'locations');
        const statusRef = ref(database, 'status');

        let locationsData: any = {};
        let statusData: any = {};

        const updateBuses = () => {
            if (!locationsData) {
                setBuses([]);
                return;
            }

            const busList = Object.keys(locationsData).map(key => {
                const busData = locationsData[key];
                // Check status from the separate status node
                const isOnline = statusData && statusData[key] === 'online';

                // If not online, skip (return null and filter out)
                if (!isOnline) return null;

                return {
                    id: key,
                    name: busData.name || key,
                    lat: busData.lat || busData.latitude || 0,
                    lng: busData.lng || busData.longitude || 0,
                    heading: busData.heading || 0,
                    timestamp: busData.timestamp || Date.now(),
                    lastUpdated: busData.lastUpdated
                } as Bus;
            }).filter((bus): bus is Bus => bus !== null && bus.lat !== 0 && bus.lng !== 0);

            setBuses(busList);
            setLoading(false);
        };

        const unsubscribeLocations = onValue(locationsRef, (snapshot) => {
            locationsData = snapshot.val();
            updateBuses();
        });

        const unsubscribeStatus = onValue(statusRef, (snapshot) => {
            statusData = snapshot.val();
            updateBuses();
        });

        return () => {
            unsubscribeLocations();
            unsubscribeStatus();
        };
    }, []);

    return { buses, loading };
};
