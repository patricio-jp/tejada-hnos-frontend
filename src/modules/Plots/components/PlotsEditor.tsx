// src/components/PlotsEditor.tsx

import { useState, useCallback } from "react";
import type { Field, Plot } from "@/lib/map-types";
import type { FeatureCollection, Feature, Polygon } from "geojson";
import { computePolygonCentroid } from "@/common/utils/geometry";
import { hexToRGBA } from "@/common/utils/color-utils";
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
  // computePolygonCentroid retorna [lat, lng] pero necesitamos [lng, lat]
  const fieldCenter = computePolygonCentroid(field.boundary.geometry.coordinates);
  const initialViewState = {
    longitude: fieldCenter[1], // lng es el segundo elemento
    latitude: fieldCenter[0],  // lat es el primer elemento
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

  // Handler para cuando se selecciona una parcela en el mapa
  const handleFeatureSelect = useCallback((feature: Feature | null, index: number | null) => {
    if (feature && index !== null) {
      // Verificar que no sea el boundary del campo
      if (feature.properties?.isFieldBoundary) {
        console.log('Seleccionaste el límite del campo (no editable)');
        setSelectedPlot(null);
        return;
      }
      
      // El índice 0 es el field boundary, así que restamos 1
      const plotIndex = index - 1;
      if (plotIndex >= 0 && plotIndex < plots.length) {
        const plot = plots[plotIndex];
        setSelectedPlot(plot);
        console.log('Parcela seleccionada:', plot.properties?.name || plot.id);
      }
    } else {
      setSelectedPlot(null);
    }
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

  // Función para obtener el color del polígono
  const getPlotColor = useCallback((feature: Feature, isSelected: boolean): [number, number, number, number] => {
    // Si es el field boundary, transparente (ya está manejado en InteractiveMap)
    if (feature.properties?.isFieldBoundary) {
      return [0, 0, 0, 0];
    }
    
    // Si está seleccionado, usar color rojo semi-transparente
    if (isSelected) {
      return [255, 100, 100, 120];
    }
    
    // Si el feature tiene un color personalizado, usarlo
    if (feature.properties?.color) {
      return hexToRGBA(feature.properties.color, 100);
    }
    
    // Color por defecto (azul)
    return [0, 100, 255, 100];
  }, []);

  return (
    <>
      <InteractiveMap
        initialData={combinedData}
        onDataChange={handleMapDataChange}
        onFeatureSelect={handleFeatureSelect}
        getPolygonColor={getPlotColor}
        availableModes={['view', 'drawPolygon', 'select', 'edit']}
        defaultMode="select"
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
