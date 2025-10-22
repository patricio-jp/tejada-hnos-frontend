// src/components/PlotsEditor.tsx

import { useState, useCallback } from "react";
import type { Field, Plot } from "@/lib/map-types";
import type { FeatureCollection, Feature, Polygon } from "geojson";
import { computePolygonCentroid } from "@/common/utils/geometry";
import InteractiveMap from "@/common/components/InteractiveMap";
import { plotsToFeatureCollection, featureCollectionToPlots } from "@/common/utils/plot-map-utils";
import { PlotDetailsSheet } from "./PlotDetailsSheet";
import { PlotEditDialog } from "./PlotEditDialog";

interface PlotsEditorProps {
  field: Field;
}

export function PlotsEditor({ field }: PlotsEditorProps) {
  // Inicializar plots desde el field
  const [plots, setPlots] = useState<Plot[]>(field.plots || []);
  const [editingPlot, setEditingPlot] = useState<Plot | null>(null);
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);

  // Convertir plots a FeatureCollection para el mapa
  const mapData = plotsToFeatureCollection(plots);
  
  // Calcular el centro del campo para el mapa
  const fieldCenter = computePolygonCentroid(field.boundary.geometry.coordinates);
  const initialViewState = {
    longitude: fieldCenter[0],
    latitude: fieldCenter[1],
    zoom: 14,
  };

  // Crear un feature del campo para mostrarlo en el mapa (solo visualización)
  const fieldBoundaryFeature: Feature<Polygon> = {
    type: 'Feature',
    id: `field-boundary-${field.id}`,
    geometry: field.boundary.geometry,
    properties: {
      ...field.boundary.properties,
      isFieldBoundary: true, // Marcador especial
    }
  };

  // Combinar el boundary del campo con los plots
  const combinedData: FeatureCollection = {
    type: 'FeatureCollection',
    features: [fieldBoundaryFeature, ...mapData.features]
  };

  // Handler para cuando cambia la data del mapa
  const handleMapDataChange = useCallback((featureCollection: FeatureCollection) => {
    // Filtrar solo los plots (excluir el field boundary)
    const plotFeatures = featureCollection.features.filter(
      f => !f.properties?.isFieldBoundary
    );
    
    const updatedPlots = featureCollectionToPlots(
      { type: 'FeatureCollection', features: plotFeatures },
      plots
    );
    
    setPlots(updatedPlots);
    
    // Actualizar el field con los nuevos plots (esto debería propagarse al componente padre)
    // Por ahora solo actualizamos el estado local
  }, [plots]);

  // Handler para eliminar una parcela
  const handleDeletePlot = useCallback((plot: Plot) => {
    setPlots((current) => current.filter((p) => p.id !== plot.id));
    setSelectedPlot(null);
    setEditingPlot(null);
  }, []);

  // Handler para guardar detalles de la parcela editada
  const handleSavePlotDetails = useCallback(() => {
    if (!editingPlot) return;

    setPlots((current) =>
      current.map((plot) =>
        plot.id === editingPlot.id ? editingPlot : plot
      )
    );

    setSelectedPlot(editingPlot);
    setEditingPlot(null);
  }, [editingPlot]);

  return (
    <>
      <InteractiveMap
        initialData={combinedData}
        onDataChange={handleMapDataChange}
        editable={true}
        initialViewState={initialViewState}
      />

      <PlotDetailsSheet
        plot={selectedPlot}
        open={Boolean(selectedPlot)}
        onClose={() => setSelectedPlot(null)}
        onEdit={(plot) => {
          setEditingPlot({ ...plot });
          setSelectedPlot(null);
        }}
        onDelete={handleDeletePlot}
        onEditGeometry={() => {
          // La edición de geometría ahora se maneja directamente en el mapa
          setSelectedPlot(null);
        }}
      />

      <PlotEditDialog
        plot={editingPlot}
        onUpdate={(plot) => setEditingPlot(plot)}
        onClose={() => setEditingPlot(null)}
        onSave={handleSavePlotDetails}
        onEditGeometry={() => {
          // La edición de geometría ahora se maneja directamente en el mapa
          setEditingPlot(null);
        }}
      />
    </>
  );
}

// Exportamos 'default' para que funcione con React.lazy
export default PlotsEditor;
