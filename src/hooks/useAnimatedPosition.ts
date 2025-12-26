import { useEffect, useRef, useState } from 'react';

interface Position {
    lat: number;
    lng: number;
    heading: number; // In degrees
}

export const useAnimatedPosition = (targetPos: Position, duration: number = 2000) => {
    const [currentPos, setCurrentPos] = useState(targetPos);
    const frameRef = useRef<number | undefined>(undefined);
    const startTimeRef = useRef<number | undefined>(undefined);
    const startPosRef = useRef<Position>(targetPos);

    useEffect(() => {
        // If target changes, start animation
        startPosRef.current = currentPos;
        startTimeRef.current = undefined; // Reset start time

        // Calculate heading if not provided or significant movement? 
        // We will just interpolate the given heading for now.

        const animate = (time: number) => {
            if (startTimeRef.current === undefined) {
                startTimeRef.current = time;
            }

            const elapsed = time - startTimeRef.current;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out function for smoother stop
            // const ease = 1 - Math.pow(1 - progress, 3);
            const ease = progress; // Linear is often better for continuous tracking updates 

            const lat = startPosRef.current.lat + (targetPos.lat - startPosRef.current.lat) * ease;
            const lng = startPosRef.current.lng + (targetPos.lng - startPosRef.current.lng) * ease;

            // Interpolate heading (handle 359->1 wrap around)
            // For now simple lerp
            // const heading = startPosRef.current.heading + (targetPos.heading - startPosRef.current.heading) * ease;
            // Let's rely on calculated bearing or provided heading without lerp for rotation to avoid spin issues for now
            // or perform smart angle lerp later.

            // Simply use target heading or calculate it
            const heading = targetPos.heading;


            setCurrentPos({ lat, lng, heading });

            if (progress < 1) {
                frameRef.current = requestAnimationFrame(animate);
            }
        };

        frameRef.current = requestAnimationFrame(animate);

        return () => {
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
        };
    }, [targetPos.lat, targetPos.lng, targetPos.heading, duration]);

    return currentPos;
};
