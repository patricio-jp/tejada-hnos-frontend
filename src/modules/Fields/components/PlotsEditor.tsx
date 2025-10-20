// src/components/PlotsEditor.tsx

import { useState, useRef, useEffect, useCallback } from "react";
import { MapContainer, TileLayer, FeatureGroup, GeoJSON, useMap } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import type { Field, Plot } from "@/lib/map-types";
import { type LatLngTuple, type LeafletEvent } from "leaflet";
import L from 'leaflet'; // Import L para el hack de _leaflet_id
import type { GeoJsonObject } from "geojson";

// Componentes Shadcn
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface PlotsEditorProps {
  field: Field;
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

// Calcula el área geodésica de un polígono (anillo exterior) y devuelve hectáreas
const computePolygonAreaHectares = (coords: number[][][]): number => {
  // coords: array de [lng, lat]
  if (!coords || coords.length === 0) return 0;
  const ring = coords[0];
  const R = 6378137; // radio de la Tierra en metros (WGS84)
  const rad = Math.PI / 180;

  let total = 0;
  const n = ring.length;
  if (n < 3) return 0;

  for (let i = 0; i < n; i++) {
    const p1 = ring[i];
    const p2 = ring[(i + 1) % n];
    const lon1 = p1[0] * rad;
    const lat1 = p1[1] * rad;
    const lon2 = p2[0] * rad;
    const lat2 = p2[1] * rad;
    total += (lon2 - lon1) * (Math.sin(lat1) + Math.sin(lat2));
  }

  const area = Math.abs(total * R * R / 2); // en metros cuadrados
  const hectares = area / 10000;
  return Number(hectares.toFixed(4));
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

export function PlotsEditor({ field }: PlotsEditorProps) {

  // Inicializar plots garantizando que tengan 'area' calculada
  const [plots, setPlots] = useState<Plot[]>(() =>
    (field.plots || []).map((p, idx) => {
      const coords = (p.geometry?.coordinates as number[][][]) || [];
      const area = p.properties?.area ?? computePolygonAreaHectares(coords);
      const ensuredId = p.id ?? `plot-mock-${idx}`;
      return {
        ...p,
        id: ensuredId,
        properties: { ...(p.properties || {}), area },
      } as Plot;
    })
  );
  const [editingPlot, setEditingPlot] = useState<Plot | null>(null);
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);

  // Ref para vincular las capas de Leaflet con los datos de React
  const layerMapRef = useRef<Map<number, Plot>>(new Map());
  // Ref al FeatureGroup para manipular layers creadas por Leaflet/Draw
  const featureGroupRef = useRef<L.FeatureGroup | null>(null);
  const [featureGroupReady, setFeatureGroupReady] = useState(false);
  const handleFeatureGroupRef = useCallback((group: L.FeatureGroup | null) => {
    featureGroupRef.current = group;
    setFeatureGroupReady(Boolean(group));
  }, []);
  // Ref para mantener las layers creadas a partir del mock (para poder actualizarlas/removerlas)
  const mockLayerRef = useRef<Map<string, L.GeoJSON>>(new Map());

  // Small internal types for layers created by draw/geojson
  type ILayerWithGeo = L.Layer & {
    toGeoJSON?: () => Plot;
    _leaflet_id?: number;
    on?: (ev: string, cb: (...args: unknown[]) => void) => void;
    feature?: { id?: string | number } | Plot;
  };

  // NOTE: We rely on EditControl detecting the parent FeatureGroup automatically.

  const handleDeletePlot = (id?: string | number) => {
    if (id == null) return;
    const fg = featureGroupRef.current;
    if (fg && typeof fg.getLayers === "function") {
      const layers = fg.getLayers() as L.Layer[];
      layers.forEach((layer) => {
        const featureId = (layer as unknown as { feature?: { id?: string | number } }).feature?.id;
        if (featureId != null && String(featureId) === String(id)) {
          const eachLayer = (layer as unknown as { eachLayer?: (cb: (l: L.Layer) => void) => void }).eachLayer;
          if (typeof eachLayer === "function") {
            eachLayer((subLayer: L.Layer) => {
              const leafId = (subLayer as unknown as { _leaflet_id?: number })._leaflet_id;
              if (leafId != null) layerMapRef.current.delete(leafId);
            });
          } else {
            const leafId = (layer as unknown as { _leaflet_id?: number })._leaflet_id;
            if (leafId != null) layerMapRef.current.delete(leafId);
          }
          fg.removeLayer(layer);
        }
      });
    }

    setPlots((current) => current.filter((p) => (p.id == null ? true : String(p.id) !== String(id))));
    setSelectedPlot(null);
    mockLayerRef.current.delete(String(id));
  };

  // Centro (convertido a [Lat, Lng])
  const mapCenter: LatLngTuple = [...computePolygonCentroid(field.boundary.geometry.coordinates)];

  // --- Manejadores de CRUD (leaflet-draw) ---

  const handleCreated = (e: LeafletEvent) => {
  const layer = (e as unknown as { layer?: L.Layer }).layer as ILayerWithGeo | undefined;
  if (!layer || typeof layer.toGeoJSON !== 'function') return;
  const newFeature = layer.toGeoJSON() as Plot;

    newFeature.id = `plot-${Date.now()}`;
    const coords = (newFeature.geometry?.coordinates as number[][][]) || [];
    const newArea = computePolygonAreaHectares(coords);
    newFeature.properties = {
      name: "Nueva Parcela",
      variety: "Sin Asignar",
      area: newArea,
    };

    // Actualizamos el estado
    setPlots((currentPlots) => [...currentPlots, newFeature]);

    // Asegurar que la nueva layer quede vinculada al feature y escuche clicks
  layer.feature = newFeature as unknown as { id?: string | number };
    const leafId = layer._leaflet_id;
    if (leafId != null) layerMapRef.current.set(leafId, newFeature);
    if (typeof layer.on === 'function') {
      layer.on('click', () => setSelectedPlot(newFeature));
    }

    // Abrimos el modal para editar detalles
    setEditingPlot(newFeature);
  };

  const handleEdited = (e: LeafletEvent) => {
    const layers = (e as unknown as { layers?: { eachLayer: (cb: (l: L.Layer) => void) => void } }).layers;
    if (!layers) return;

    layers.eachLayer((layer: L.Layer) => {
      const lay = layer as ILayerWithGeo;
      const leafletId = lay._leaflet_id;
      const originalPlot = leafletId != null ? layerMapRef.current.get(leafletId) : undefined;

      if (originalPlot && typeof lay.toGeoJSON === 'function') {
        const updatedFeature = lay.toGeoJSON() as Plot;
        const coords = (updatedFeature.geometry?.coordinates as number[][][]) || [];
        const updatedArea = computePolygonAreaHectares(coords);
        setPlots((currentPlots) =>
          currentPlots.map((p) =>
            String(p.id) === String(originalPlot.id)
              ? { ...p, geometry: updatedFeature.geometry, properties: { ...(p.properties || {}), area: updatedArea } }
              : p
          )
        );
      }
    });
  };

  const handleDeleted = (e: LeafletEvent) => {
    const layers = (e as unknown as { layers?: { eachLayer: (cb: (l: L.Layer) => void) => void } }).layers;
    const deletedPlotIds: Array<string | number> = [];
    if (!layers) return;

    layers.eachLayer((layer: L.Layer) => {
      const leafletId = (layer as unknown as { _leaflet_id?: number })._leaflet_id;
      const plot = leafletId != null ? layerMapRef.current.get(leafletId) : undefined;
      if (plot && plot.id != null) {
        deletedPlotIds.push(plot.id);
        if (leafletId != null) layerMapRef.current.delete(leafletId);
      }
    });

    setPlots((currentPlots) =>
      currentPlots.filter((p) => (p.id == null ? true : !deletedPlotIds.includes(p.id)))
    );
  };

  // --- Manejador para el modal de Shadcn ---
  const handleSavePlotDetails = () => {
    if (!editingPlot) return;

    setPlots(plots.map(p => p.id === editingPlot.id ? editingPlot : p));
    setEditingPlot(null);
  };

  // Sincroniza las parcelas (plots) en el FeatureGroup creando capas L.geoJSON
  useEffect(() => {
    const fg = featureGroupRef.current;
    if (!fg) return;

    const mockLayers = mockLayerRef.current;
    const layerMap = layerMapRef.current;
    const seenIds = new Set<string>();

    plots.forEach((plot, idx) => {
      const id = plot.id != null ? String(plot.id) : `plot-auto-${idx}`;
      seenIds.add(id);

      const previousLayer = mockLayers.get(id);
      if (previousLayer) {
        previousLayer.eachLayer((subLayer) => {
          const lid = (subLayer as unknown as { _leaflet_id?: number })._leaflet_id;
          if (lid != null) layerMap.delete(lid);
        });
        fg.removeLayer(previousLayer);
        mockLayers.delete(id);
      }

      const layer = L.geoJSON(plot as GeoJsonObject, {
        style: { color: "#16a34a", fillColor: "#16a34a", fillOpacity: 0.4, weight: 2 },
      });

      (layer as unknown as { feature?: Plot }).feature = plot;

      layer.eachLayer((subLayer) => {
        const l = subLayer as unknown as {
          on?: (ev: string, cb: (...args: unknown[]) => void) => void;
          _leaflet_id?: number;
        };
        if (typeof l.on === "function") {
          l.on("click", () => setSelectedPlot(plot));
        }
        if (l._leaflet_id != null) {
          layerMap.set(l._leaflet_id, plot);
        }
      });

      fg.addLayer(layer);
      mockLayers.set(id, layer);
    });

    const toRemove: string[] = [];
    mockLayers.forEach((_, id) => {
      if (!seenIds.has(id)) toRemove.push(id);
    });

    toRemove.forEach((id) => {
      const layer = mockLayers.get(id);
      if (!layer) return;
      layer.eachLayer((subLayer) => {
        const lid = (subLayer as unknown as { _leaflet_id?: number })._leaflet_id;
        if (lid != null) layerMap.delete(lid);
      });
      fg.removeLayer(layer);
      mockLayers.delete(id);
    });

    return () => {
      mockLayers.forEach((layer) => {
        layer.eachLayer((subLayer) => {
          const lid = (subLayer as unknown as { _leaflet_id?: number })._leaflet_id;
          if (lid != null) layerMap.delete(lid);
        });
        fg.removeLayer(layer);
      });
      mockLayers.clear();
    };
  }, [plots, featureGroupReady]);

  return (
    <>
      <MapContainer
        center={mapCenter}
        zoom={14}
        style={{ height: "500px", width: "800px", borderRadius: "0.5rem" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapFlyTo center={mapCenter} zoom={14} />

        {/* Límite del Campo (No editable) */}
        <GeoJSON
          data={field.boundary}
          style={{ color: "#3b82f6", fill: false, weight: 3, dashArray: '5, 5' }}
        />

        {/* Grupo de Features (Aquí es donde ocurre la edición) */}
  <FeatureGroup ref={handleFeatureGroupRef}>
          <EditControl
            position="topright"
            onCreated={handleCreated}
            onEdited={handleEdited}
            onDeleted={handleDeleted}
            // Do not pass explicit edit.featureGroup here; EditControl will use the parent FeatureGroup
            draw={{
              polygon: {
                allowIntersection: false,
                shapeOptions: {
                  color: '#16a34a'
                }
              },
              rectangle: false,
              circle: false,
              circlemarker: false,
              marker: false,
              polyline: false,
            }}
          />

          {/* Las parcelas del mock se sincronizan en un useEffect creando L.geoJSON y añadiéndolas al FeatureGroup.
              Esto las hace equivalentes a las creadas por Draw (mismas opciones internas). */}
        </FeatureGroup>
      </MapContainer>
      {/* Sheet para mostrar detalles rápidos de la parcela seleccionada */}
      <Sheet open={!!selectedPlot} onOpenChange={(open) => !open && setSelectedPlot(null)}>
        <SheetContent className="z-[9999]">
          {selectedPlot && (
            <>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">{selectedPlot.properties.name}</h3>
                <div className="grid gap-3">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>ID</span>
                    <span>{selectedPlot.id}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Variedad</span>
                    <span>{selectedPlot.properties.variety}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold">
                    <span>Área</span>
                    <span>{selectedPlot.properties.area ?? 0} ha</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    className="flex-1"
                    onClick={() => {
                      // Abrir el Dialog de edición
                      setEditingPlot(selectedPlot);
                      setSelectedPlot(null);
                    }}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleDeletePlot(selectedPlot.id)}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
      {/* Modal de Shadcn para editar detalles de la parcela */}
      <Dialog open={!!editingPlot} onOpenChange={(open) => !open && setEditingPlot(null)}>
        <DialogContent className="z-[9999]">
          <DialogHeader>
            <DialogTitle>Editar Parcela: {editingPlot?.properties.name}</DialogTitle>
          </DialogHeader>
          {editingPlot && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Nombre</Label>
                <Input
                  id="name"
                  value={editingPlot.properties.name}
                  onChange={(e) => setEditingPlot({
                    ...editingPlot,
                    properties: { ...editingPlot.properties, name: e.target.value }
                  })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="variety" className="text-right">Variedad</Label>
                <Input
                  id="variety"
                  value={editingPlot.properties.variety}
                  onChange={(e) => setEditingPlot({
                    ...editingPlot,
                    properties: { ...editingPlot.properties, variety: e.target.value }
                  })}
                  className="col-span-3"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPlot(null)}>Cancelar</Button>
            <Button onClick={handleSavePlotDetails}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Exportamos 'default' para que funcione con React.lazy
export default PlotsEditor;
