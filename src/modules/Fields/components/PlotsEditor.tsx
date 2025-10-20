// src/components/PlotsEditor.tsx

import { useState, useCallback } from "react";
import { MapContainer, TileLayer, FeatureGroup, GeoJSON } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import type { Field, Plot } from "@/lib/map-types";
import { type LatLngTuple, type LeafletEvent } from "leaflet";
import L from "leaflet";
import { MapFlyTo } from "./common/MapFlyTo";
import { computePolygonAreaHectares, computePolygonCentroid } from "../utils/geometry";
import { usePlotLayerSync } from "../hooks/usePlotLayerSync";
import { PlotDetailsSheet } from "./Plots/PlotDetailsSheet";
import { PlotEditDialog } from "./Plots/PlotEditDialog";

interface PlotsEditorProps {
  field: Field;
}

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

  const handleSelectPlot = useCallback((plot: Plot) => setSelectedPlot(plot), []);
  const { layerMapRef, handleFeatureGroupRef, removePlotLayer, featureGroup } = usePlotLayerSync({
    plots,
    onSelectPlot: handleSelectPlot,
  });

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
    removePlotLayer(id);
    setPlots((current) => current.filter((p) => (p.id == null ? true : String(p.id) !== String(id))));
    setSelectedPlot(null);
  };

  // Centro (convertido a [Lat, Lng])
  const mapCenter: LatLngTuple = computePolygonCentroid(field.boundary.geometry.coordinates);

  // --- Manejadores de CRUD (leaflet-draw) ---

  const handleCreated = (e: LeafletEvent) => {
    const layer = (e as unknown as { layer?: L.Layer }).layer as ILayerWithGeo | undefined;
    if (!layer || typeof layer.toGeoJSON !== "function") return;
    const newFeature = layer.toGeoJSON() as Plot;

    newFeature.id = `plot-${Date.now()}`;
    const coords = (newFeature.geometry?.coordinates as number[][][]) || [];
    const newArea = computePolygonAreaHectares(coords);
    newFeature.properties = {
      name: "Nueva Parcela",
      variety: "Sin Asignar",
      area: newArea,
    };

    // Persistimos el nuevo plot; el hook sincronizará la capa canonical.
    setPlots((currentPlots) => [...currentPlots, newFeature]);

    // Eliminamos la capa creada por Draw para evitar duplicados visuales/edición.
    if (featureGroup) {
      featureGroup.removeLayer(layer);
    } else {
      layer.remove();
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
    setPlots((current) => current.map((plot) => (plot.id === editingPlot.id ? editingPlot : plot)));
    setEditingPlot(null);
  };

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
          style={{ color: "#3b82f6", fill: false, weight: 3, dashArray: "5, 5" }}
        />

        {/* Grupo de Features (Aquí es donde ocurre la edición) */}
        <FeatureGroup ref={handleFeatureGroupRef}>
          {featureGroup && (
            <EditControl
              position="topright"
              onCreated={handleCreated}
              onEdited={handleEdited}
              onDeleted={handleDeleted}
              draw={{
                polygon: {
                  allowIntersection: false,
                  shapeOptions: {
                    color: "#16a34a",
                  },
                },
                rectangle: false,
                circle: false,
                circlemarker: false,
                marker: false,
                polyline: false,
              }}
            />
          )}

      {/* Las parcelas se sincronizan mediante usePlotLayerSync creando L.geoJSON equivalentes a las de Draw. */}
        </FeatureGroup>
      </MapContainer>
      <PlotDetailsSheet
        plot={selectedPlot}
        open={Boolean(selectedPlot)}
        onClose={() => setSelectedPlot(null)}
        onEdit={(plot) => {
          setEditingPlot(plot);
          setSelectedPlot(null);
        }}
        onDelete={(plot) => handleDeletePlot(plot.id)}
      />

      <PlotEditDialog
        plot={editingPlot}
        onUpdate={(plot) => setEditingPlot(plot)}
        onClose={() => setEditingPlot(null)}
        onSave={handleSavePlotDetails}
      />
    </>
  );
}

// Exportamos 'default' para que funcione con React.lazy
export default PlotsEditor;
