// Calculate bearing (angle in degrees) between two points
export const getBearing = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const startLat = lat1 * Math.PI / 180;
    const startLng = lng1 * Math.PI / 180;
    const destLat = lat2 * Math.PI / 180;
    const destLng = lng2 * Math.PI / 180;

    const y = Math.sin(destLng - startLng) * Math.cos(destLat);
    const x = Math.cos(startLat) * Math.sin(destLat) -
        Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);

    let brng = Math.atan2(y, x);
    brng = brng * 180 / Math.PI;
    return (brng + 360) % 360;
};
