// src/components/FieldsMap.tsx

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import { type LatLngTuple, Layer } from "leaflet";
import type { Field, FieldBoundary } from "@/lib/map-types";
import type { Feature } from 'geojson';
import { useNavigate } from "react-router"; // Para la navegación

// Componentes Shadcn
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface FieldsMapProps {
  fields: Field[];
}

// Helper: centroid preciso del anillo exterior (coords: number[][][] -> [lng,lat] arrays)
const computePolygonCentroid = (coords: number[][][]): LatLngTuple => {
  const ring = coords[0];
  const n = ring.length;
  if (n === 0) return [-26.83, -65.20];

  // asegurarse de que el anillo esté cerrado
  const closed = ring[0][0] === ring[n - 1][0] && ring[0][1] === ring[n - 1][1];
  const m = closed ? n - 1 : n;

  let A = 0;
  let Cx = 0;
  let Cy = 0;

  for (let i = 0; i < m; i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[(i + 1) % m][0];
    const yj = ring[(i + 1) % m][1];
    const cross = xi * yj - xj * yi;
    A += cross;
    Cx += (xi + xj) * cross;
    Cy += (yi + yj) * cross;
  }

  A = A / 2;
  if (A === 0) {
    // Polígono degenerado -> fallback a promedio
    let sumLng = 0;
    let sumLat = 0;
    for (let i = 0; i < m; i++) {
      sumLng += ring[i][0];
      sumLat += ring[i][1];
    }
    return [sumLat / m, sumLng / m];
  }

  const centroidX = Cx / (6 * A);
  const centroidY = Cy / (6 * A);

  // coords están en [lng, lat], Leaflet usa [lat, lng]
  return [centroidY, centroidX];
};

// Componente para centrar el mapa dinámicamente (invalida tamaño y evita pequeños saltos)
const MapFlyTo: React.FC<{ center: LatLngTuple; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  // ejecutar en efecto cuando cambie center/zoom
  useEffect(() => {
    // asegurar que Leaflet recalibre tamaño (evita offsets cuando cambió el contenedor)
    setTimeout(() => map.invalidateSize(), 0);
    const current = map.getCenter();
    const latDiff = Math.abs(current.lat - center[0]);
    const lngDiff = Math.abs(current.lng - center[1]);
    const threshold = 0.0005; // umbral pequeño para evitar saltos innecesarios
    if (latDiff > threshold || lngDiff > threshold) {
      map.flyTo(center, zoom);
    }
  }, [map, center, zoom]);
  return null;
};

export function FieldsMap({ fields }: FieldsMapProps) {
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const navigate = useNavigate(); // Hook para navegar

  // Obtenemos el centro (invertimos [Lng, Lat] a [Lat, Lng] para Leaflet)
  const mapCenter: LatLngTuple = fields[0] 
    ? computePolygonCentroid(fields[0].boundary.geometry.coordinates)
    : [-26.83, -65.20]; // Fallback

  const handleFieldClick = (fieldFeature: FieldBoundary) => {
    const fieldData = fields.find(f => f.id === fieldFeature.id);
    if (fieldData) {
      setSelectedField(fieldData);
    }
  };

  const getFieldTotalArea = (field: Field) => {
    return field.plots.reduce((acc, plot) => acc + plot.properties.area, 0).toFixed(2);
  };

  // Función para asignar eventos a cada Feature
  const onEachField = (feature: Feature, layer: Layer) => {
    layer.on({
      click: () => handleFieldClick(feature as FieldBoundary),
    });
  };

  // Creamos la colección de "Features" para mostrar (solo los límites)
  const fieldBoundaries = fields.map(f => f.boundary);
  const geoJsonData: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: fieldBoundaries,
  };

  return (
    <>
      <MapContainer
        center={mapCenter}
        zoom={12}
        style={{ height: "500px", width: "800px", borderRadius: "0.5rem" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <GeoJSON
          data={geoJsonData}
          style={{ color: "#3b82f6", fillColor: "#3b82f6", fillOpacity: 0.2, weight: 2 }}
          onEachFeature={onEachField}
        />

        {/* Centrado dinámico al seleccionar un campo */}
        {selectedField && (
          <MapFlyTo center={[
            ...computePolygonCentroid(selectedField.boundary.geometry.coordinates)
          ]} zoom={14} />
        )}
      </MapContainer>

      {/* Sheet de Shadcn para mostrar detalles */}
      <Sheet open={!!selectedField} onOpenChange={(open) => !open && setSelectedField(null)}>
        <SheetContent className="z-[9999]">
          {selectedField && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedField.boundary.properties.name}</SheetTitle>
                <SheetDescription>
                  Información detallada del campo seleccionado.
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID</span>
                  <span>{selectedField.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">N° de Parcelas</span>
                  <span>{selectedField.plots.length}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-muted-foreground">Área Total</span>
                  <span>{getFieldTotalArea(selectedField)} ha.</span>
                </div>
              </div>
              <Button 
                className="w-full mt-4"
                onClick={() => navigate(`/fields/${selectedField.id}`)}
              >
                Gestionar Parcelas
              </Button>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

// Exportamos 'default' para que funcione con React.lazy
export default FieldsMap;
