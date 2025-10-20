import { useEffect } from "react";
import { useMap } from "react-leaflet";
import type { LatLngTuple } from "leaflet";

interface MapFlyToProps {
  center: LatLngTuple;
  zoom: number;
}

export const MapFlyTo: React.FC<MapFlyToProps> = ({ center, zoom }) => {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 0);
    const current = map.getCenter();
    const latDiff = Math.abs(current.lat - center[0]);
    const lngDiff = Math.abs(current.lng - center[1]);
    const threshold = 0.0005;
    if (latDiff > threshold || lngDiff > threshold) {
      map.flyTo(center, zoom);
    }
    return () => clearTimeout(timer);
  }, [map, center, zoom]);

  return null;
};
