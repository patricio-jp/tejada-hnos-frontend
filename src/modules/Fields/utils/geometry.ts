import type { LatLngTuple } from "leaflet";

// Precise centroid for the exterior ring (coordinates in [lng, lat])
export const computePolygonCentroid = (coords: number[][][]): LatLngTuple => {
  const ring = coords[0];
  const n = ring.length;
  if (n === 0) return [-26.83, -65.2];

  const closed = ring[0][0] === ring[n - 1][0] && ring[0][1] === ring[n - 1][1];
  const m = closed ? n - 1 : n;

  let areaTimesSix = 0;
  let centroidX = 0;
  let centroidY = 0;

  for (let i = 0; i < m; i += 1) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[(i + 1) % m];
    const cross = xi * yj - xj * yi;
    areaTimesSix += cross;
    centroidX += (xi + xj) * cross;
    centroidY += (yi + yj) * cross;
  }

  const area = areaTimesSix / 2;
  if (area === 0) {
    let sumLng = 0;
    let sumLat = 0;
    for (let i = 0; i < m; i += 1) {
      sumLng += ring[i][0];
      sumLat += ring[i][1];
    }
    return [sumLat / m, sumLng / m];
  }

  const centroidLng = centroidX / (6 * area);
  const centroidLat = centroidY / (6 * area);
  return [centroidLat, centroidLng];
};

// Compute geodesic area (exterior ring) expressed in hectares
export const computePolygonAreaHectares = (coords: number[][][]): number => {
  if (!coords || coords.length === 0) return 0;
  const ring = coords[0];
  const n = ring.length;
  if (n < 3) return 0;

  const radius = 6378137; // WGS84 semi-major axis in meters
  const toRad = Math.PI / 180;
  let total = 0;

  for (let i = 0; i < n; i += 1) {
    const [lon1, lat1] = ring[i];
    const [lon2, lat2] = ring[(i + 1) % n];
    const lon1Rad = lon1 * toRad;
    const lat1Rad = lat1 * toRad;
    const lon2Rad = lon2 * toRad;
    const lat2Rad = lat2 * toRad;
    total += (lon2Rad - lon1Rad) * (Math.sin(lat1Rad) + Math.sin(lat2Rad));
  }

  const areaMeters = Math.abs((total * radius * radius) / 2);
  return Number((areaMeters / 10000).toFixed(4));
};
