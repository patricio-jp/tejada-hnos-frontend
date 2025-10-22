// src/components/PlotsEditor.tsx

import { useState, useCallback, useMemo } from "react";
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
  const [mapMode, setMapMode] = useState<'view' | 'drawPolygon' | 'select' | 'edit'>('select');

  // Convertir plots a FeatureCollection para el mapa (memoizado)
  const mapData = useMemo(() => plotsToFeatureCollection(plots), [plots]);
  
  // Calcular el centro del campo para el mapa (memoizado)
  const initialViewState = useMemo(() => {
    // computePolygonCentroid retorna [lat, lng] pero necesitamos [lng, lat]
    const fieldCenter = computePolygonCentroid(field.boundary.geometry.coordinates);
    return {
      longitude: fieldCenter[1], // lng es el segundo elemento
      latitude: fieldCenter[0],  // lat es el primer elemento
      zoom: 14,
    };
  }, [field.boundary.geometry.coordinates]);

  // Crear un feature del campo para mostrarlo en el mapa (solo visualización) - memoizado
  const fieldBoundaryFeature: Feature<Polygon> = useMemo(() => ({
    type: 'Feature',
    id: `field-boundary-${field.id}`,
    geometry: field.boundary.geometry,
    properties: {
      ...field.boundary.properties,
      isFieldBoundary: true, // Marcador especial
    }
  }), [field.id, field.boundary.geometry, field.boundary.properties]);

  // Combinar el boundary del campo con los plots (memoizado)
  const combinedData: FeatureCollection = useMemo(() => ({
    type: 'FeatureCollection',
    features: [fieldBoundaryFeature, ...mapData.features]
  }), [fieldBoundaryFeature, mapData.features]);

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

  // Handler para cerrar el sheet (deseleccionar manualmente)
  const handleCloseSheet = useCallback(() => {
    setSelectedPlot(null);
    // Forzar actualización del mapa creando nueva referencia de plots
    setPlots((current) => [...current]);
  }, []);

  // Handler para eliminar una parcela
  const handleDeletePlot = useCallback((plot: Plot) => {
    setPlots((current) => current.filter((p) => p.id !== plot.id));
    setSelectedPlot(null);
    setEditingPlot(null);
    setMapMode('select'); // Volver al modo selección después de eliminar
  }, []);

  // Handler para iniciar edición de geometría
  const handleEditGeometry = useCallback((_plot: Plot) => {
    setSelectedPlot(null); // Cerrar el sheet
    setMapMode('edit'); // Activar modo de edición en el mapa
    // La parcela permanece seleccionada en el mapa para que se pueda editar
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

  // Handler para cuando cambia el modo del mapa
  const handleModeChange = useCallback((newMode: 'view' | 'drawPolygon' | 'select' | 'edit') => {
    setMapMode(newMode);
  }, []);

  return (
    <>
      <InteractiveMap
        initialData={combinedData}
        onDataChange={handleMapDataChange}
        onFeatureSelect={handleFeatureSelect}
        getPolygonColor={getPlotColor}
        availableModes={['view', 'drawPolygon', 'select', 'edit']}
        mode={mapMode}
        onModeChange={handleModeChange}
        editable={true}
        initialViewState={initialViewState}
      />

      <PlotDetailsSheet
        plot={selectedPlot}
        open={Boolean(selectedPlot)}
        onClose={handleCloseSheet}
        onEdit={(plot) => {
          setEditingPlot({ ...plot });
          setSelectedPlot(null);
        }}
        onDelete={handleDeletePlot}
        onEditGeometry={handleEditGeometry}
      />

      <PlotEditDialog
        plot={editingPlot}
        onUpdate={(plot) => setEditingPlot(plot)}
        onClose={() => setEditingPlot(null)}
        onSave={handleSavePlotDetails}
        onEditGeometry={() => {
          setEditingPlot(null);
          setMapMode('edit'); // Activar modo de edición en el mapa
        }}
      />
    </>
  );
}

// Exportamos 'default' para que funcione con React.lazy
export default PlotsEditor;
