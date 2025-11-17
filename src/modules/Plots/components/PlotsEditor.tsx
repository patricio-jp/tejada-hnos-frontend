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
      // Filtrar plots que pertenecen al field actual (por si acaso el backend retorna todos)
      const filteredPlots = hookPlots.filter((plot: any) => {
        // Si el plot tiene fieldId, verificar que coincida
        if (plot.fieldId && plot.fieldId !== field.id) {
          return false;
        }
        return true;
      });
      setPlots(filteredPlots);
    }
  }, [hookPlots, field.id]);

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
    if (feature && feature.id) {
      // Buscar el plot por ID en lugar de por índice
      const plot = plots.find(p => p.id === feature.id);
      if (plot) {
        setSelectedPlot(plot);
        const plotName = (plot as any).name || (plot as any).properties?.name || plot.id;
        console.log('Parcela seleccionada:', plotName);
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
      setIsSavingChanges(true);
      
      console.log('editingPlot completo:', editingPlot);
      console.log('editingPlot.id:', (editingPlot as any).id);
      console.log('typeof editingPlot.id:', typeof (editingPlot as any).id);
      console.log('editingPlot.properties?.id:', (editingPlot as any).properties?.id);
      
      const plotId = (editingPlot as any).id;
      if (!plotId || typeof plotId !== 'string') {
        throw new Error(`Plot ID inválido. tipo: ${typeof plotId}, valor: ${plotId}`);
      }
      
      // Manejar ambas estructuras de plot
      const plotName = (editingPlot as any).properties?.name || (editingPlot as any).name;
      let plotArea = (editingPlot as any).properties?.area || (editingPlot as any).area || 0;
      // Convertir a número si es string
      plotArea = typeof plotArea === 'string' ? parseFloat(plotArea) : plotArea;
      
      // Para variety, extraer el ID si es un objeto, o usar el valor directo si es string
      // Buscar en estas ubicaciones: varietyId, variety (para compatibilidad)
      let plotVarietyId = (editingPlot as any).varietyId || 
                          (editingPlot as any).properties?.varietyId ||
                          (editingPlot as any).variety || 
                          (editingPlot as any).properties?.variety;
      
      // Si es un objeto (la variedad completa), extraer el ID
      if (typeof plotVarietyId === 'object' && plotVarietyId?.id) {
        plotVarietyId = plotVarietyId.id;
      } else if (typeof plotVarietyId === 'object') {
        // Si es un objeto pero no tiene id, usar null
        plotVarietyId = null;
      }
      
      console.log('Actualizando plot:', { plotId, plotName, plotArea, plotVarietyId });
      console.log('editingPlot.varietyId:', (editingPlot as any).varietyId);
      console.log('editingPlot completo al guardar:', editingPlot);
      
      const updatePayload = {
        name: plotName,
        area: plotArea,
        varietyId: plotVarietyId || undefined,
      };
      console.log('Payload a enviar:', updatePayload);
      
      // Llamar a updatePlot con los parámetros correctos
      await updatePlot(plotId, updatePayload);

      // Cerrar ambos diálogos después de guardar exitosamente
      setSelectedPlot(null);
      setEditingPlot(null);
      
      // Mostrar mensaje de éxito (opcional)
      console.log('Plot actualizado exitosamente');
    } catch (error) {
      console.error('Error saving plot details:', error);
    } finally {
      setIsSavingChanges(false);
    }
  }, [editingPlot, updatePlot]);

  // Función para obtener el color del polígono
  const getPlotColor = useCallback((feature: Feature | null, isSelected: boolean): [number, number, number, number] => {
    // Verificación defensiva
    if (!feature) {
      return [100, 150, 100, 100]; // Verde por defecto
    }
    
    // Si es el field boundary, transparente (ya está manejado en InteractiveMap)
    if (feature.properties?.isFieldBoundary) {
      return [0, 0, 0, 0];
    }
    
    // Verificar si este feature corresponde al plot seleccionado
    const featureId = feature.id || feature.properties?.id || feature.properties?.plotId;
    const selectedPlotId = selectedPlot?.id;
    const isCurrentlySelected = isSelected || (featureId && selectedPlotId && featureId === selectedPlotId);
    
    // Si está seleccionado, usar color rojo semi-transparente
    if (isCurrentlySelected) {
      return [255, 100, 100, 120];
    }
    
    // Si el feature tiene un color personalizado, usarlo
    if (feature.properties?.color) {
      return hexToRGBA(feature.properties.color, 100);
    }
    
    // Color por defecto (azul)
    return [0, 100, 255, 100];
  }, [selectedPlot]);

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
