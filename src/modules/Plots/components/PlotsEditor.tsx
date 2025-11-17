// src/components/PlotsEditor.tsx

import { useState, useCallback, useMemo, useEffect } from "react";
import type { Field, Plot } from "@/lib/map-types";
import type { FeatureCollection, Feature, Polygon } from "geojson";
import { computePolygonCentroid } from "@/common/utils/geometry";
import { hexToRGBA } from "@/common/utils/color-utils";
import InteractiveMap from "@/common/components/InteractiveMap";
import { plotsToFeatureCollection, featureCollectionToPlots } from "@/common/utils/plot-map-utils";
import { PlotDetailsSheet } from "./PlotDetailsSheet";
import { PlotEditDialog } from "./PlotEditDialog";
import { Button } from "@/components/ui/button";
import { PenTool, Loader2 } from "lucide-react";
import { usePlots } from "../hooks/usePlots";

interface PlotsEditorProps {
  field: Field;
}

export function PlotsEditor({ field }: PlotsEditorProps) {
  const { plots: hookPlots, loading: apiLoading, createPlot, updatePlot, deletePlot } = usePlots(field.id);
  
  // Estado local del mapa (para ediciones temporales)
  // Inicializar con plots que vienen en el field, luego actualizar con los del hook
  const [plots, setPlots] = useState<any[]>(field.plots || []);
  const [editingPlot, setEditingPlot] = useState<Plot | null>(null);
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);
  const [mapMode, setMapMode] = useState<'view' | 'drawPolygon' | 'select' | 'edit'>('select');
  const [isSavingChanges, setIsSavingChanges] = useState(false);

  // Actualizar plots cuando el hook carga nuevos datos
  useEffect(() => {
    if (hookPlots && hookPlots.length > 0) {
      setPlots(hookPlots);
    }
  }, [hookPlots]);

  // Convertir plots a FeatureCollection para el mapa (memoizado)
  const mapData = useMemo(() => plotsToFeatureCollection(plots), [plots]);
  
  // Obtener geometría del field (buscar en diferentes ubicaciones posibles)
  const getFieldGeometry = useCallback(() => {
    if (field.boundary?.geometry) {
      return field.boundary.geometry;
    } else if ((field as any).geometry) {
      return (field as any).geometry;
    } else if ((field as any).location) {
      // La geometría podría estar en 'location'
      return (field as any).location;
    }
    return null;
  }, [field]);

  const fieldGeometry = getFieldGeometry();
  
  // Calcular el centro del campo para el mapa (memoizado)
  const initialViewState = useMemo(() => {
    if (!fieldGeometry) {
      // Fallback a vista por defecto
      return { longitude: -75.5, latitude: 6.0, zoom: 12 };
    }

    try {
      const coordinates = (fieldGeometry as any).coordinates;
      if (!coordinates || !Array.isArray(coordinates)) {
        return { longitude: -75.5, latitude: 6.0, zoom: 12 };
      }

      const fieldCenter = computePolygonCentroid(coordinates);
      return {
        longitude: fieldCenter[1], // lng es el segundo elemento
        latitude: fieldCenter[0],  // lat es el primer elemento
        zoom: 14,
      };
    } catch (error) {
      console.error('Error calculating field center:', error);
      return { longitude: -75.5, latitude: 6.0, zoom: 12 };
    }
  }, [fieldGeometry]);

  // Crear un feature del campo para mostrarlo en el mapa (solo visualización) - memoizado
  const fieldBoundaryFeature: Feature<Polygon> = useMemo(() => {
    if (!fieldGeometry) {
      // Si no hay geometría, retornar un feature vacío
      return {
        type: 'Feature',
        id: `field-boundary-${field.id}`,
        geometry: { type: 'Polygon', coordinates: [] },
        properties: { isFieldBoundary: true }
      } as Feature<Polygon>;
    }

    return {
      type: 'Feature',
      id: `field-boundary-${field.id}`,
      geometry: fieldGeometry as Polygon,
      properties: {
        name: field.name,
        isFieldBoundary: true, // Marcador especial
      }
    } as Feature<Polygon>;
  }, [field.id, field.name, fieldGeometry]);

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
    
    // Guardar cambios en el backend
    handleSavePlotsChanges(updatedPlots);
  }, [plots]);

  // Handler para guardar cambios en el backend
  const handleSavePlotsChanges = useCallback(async (updatedPlots: Plot[]) => {
    setIsSavingChanges(true);
    try {
      // Por ahora solo actualizamos el estado local
      // En una implementación completa, enviaríamos cambios al backend
      console.log('Cambios en plots guardados (local):', updatedPlots);
    } catch (error) {
      console.error('Error saving plot changes:', error);
    } finally {
      setIsSavingChanges(false);
    }
  }, []);

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
  const handleDeletePlot = useCallback(async (plot: Plot) => {
    try {
      await deletePlot(plot.id as string);
      setPlots((current) => current.filter((p) => p.id !== plot.id));
      setSelectedPlot(null);
      setEditingPlot(null);
      setMapMode('select'); // Volver al modo selección después de eliminar
    } catch (error) {
      console.error('Error deleting plot:', error);
    }
  }, [deletePlot]);

  // Handler para iniciar edición de geometría
  const handleEditGeometry = useCallback((_plot: Plot) => {
    setSelectedPlot(null); // Cerrar el sheet
    setMapMode('edit'); // Activar modo de edición en el mapa
    // La parcela permanece seleccionada en el mapa para que se pueda editar
  }, []);

  // Handler para guardar detalles de la parcela editada
  const handleSavePlotDetails = useCallback(async () => {
    if (!editingPlot) return;

    try {
      // Convertir del formato de map-types al formato de API
      await updatePlot(editingPlot.id as string, {
        name: editingPlot.properties.name,
        area: editingPlot.properties.area || 0,
        varietyId: editingPlot.properties.variety,
        geometry: editingPlot.geometry,
      });

      setPlots((current) =>
        current.map((plot) =>
          plot.id === editingPlot.id ? editingPlot : plot
        )
      );

      setEditingPlot(null);
    } catch (error) {
      console.error('Error saving plot details:', error);
    }
  }, [editingPlot, updatePlot]);

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

  // Handler para cuando se cierra el diálogo de edición (para deseleccionar)
  const handleCloseEditDialog = useCallback(() => {
    setEditingPlot(null);
    setSelectedPlot(null);
    // Forzar actualización del mapa creando nueva referencia de plots
    setPlots((current) => [...current]);
  }, []);

  const isLoading = apiLoading || isSavingChanges;

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Dibuja parcelas dentro del campo o selecciona una existente para ver sus detalles.
        </div>
        <Button
          onClick={() => setMapMode('drawPolygon')}
          variant={mapMode === 'drawPolygon' ? 'default' : 'outline'}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <PenTool className="mr-2 h-4 w-4" />
          )}
          {mapMode === 'drawPolygon' ? 'Dibujando...' : 'Crear Nueva Parcela'}
        </Button>
      </div>

      <InteractiveMap
        initialData={combinedData}
        onDataChange={handleMapDataChange}
        onFeatureSelect={handleFeatureSelect}
        getPolygonColor={getPlotColor}
        availableModes={['view', 'drawPolygon', 'select', 'edit']}
        visibleButtons={['view', 'select']}
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
        onClose={handleCloseEditDialog}
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
