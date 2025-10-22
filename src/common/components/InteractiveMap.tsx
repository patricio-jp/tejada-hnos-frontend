import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';

// --- Imports del Mapa ---
import Map, { type MapRef } from 'react-map-gl/maplibre';
import DeckGL from '@deck.gl/react';
import { GeoJsonLayer, ScatterplotLayer } from '@deck.gl/layers';
import type { FeatureCollection, Feature, Polygon, Position } from 'geojson';
import 'maplibre-gl/dist/maplibre-gl.css'; // Estilos de MapLibre

// --- Imports de Shadcn/ui y Lucide (Iconos) ---
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PenTool, Edit, Trash2, Eye, MapPin } from 'lucide-react'; // Iconos

// ====================================================================

// --- 1. Tipos y Constantes ---

type Mode = 'view' | 'drawPolygon' | 'select' | 'edit';

interface InteractiveMapProps {
  initialData?: FeatureCollection;
  onDataChange?: (data: FeatureCollection) => void;
  onFeatureSelect?: (feature: Feature | null, index: number | null) => void;
  editable?: boolean;
  initialViewState?: {
    longitude: number;
    latitude: number;
    zoom: number;
  };
  // Control de UI
  showControls?: boolean; // Mostrar/ocultar TODO el panel de controles (default: true)
  visibleButtons?: Mode[]; // Qué botones mostrar en el panel (default: todos los availableModes)
  
  // Control de funcionalidad
  availableModes?: Mode[]; // Modos funcionalmente disponibles (por defecto todos)
  defaultMode?: Mode; // Modo inicial (por defecto 'view')
  mode?: Mode; // Modo controlado externamente (opcional)
  onModeChange?: (mode: Mode) => void; // Callback cuando cambia el modo
  
  // Personalización
  getPolygonColor?: (feature: Feature, isSelected: boolean) => [number, number, number, number]; // Color personalizado por feature
}

// --- 2. Configuración de Maptiler ---
const MAPTILER_API_KEY = '905AeAMAGxEbxDPflAwf'; 

const MAPTILER_STYLE_URL = `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_API_KEY}`;


// --- 3. El Componente de React ---

const InteractiveMap: React.FC<InteractiveMapProps> = ({
  initialData,
  onDataChange,
  onFeatureSelect,
  editable = true,
  initialViewState: initialViewStateProp,
  showControls = true, // Por defecto mostrar controles
  visibleButtons, // Por defecto undefined = mostrar todos los modos disponibles
  availableModes = ['view', 'drawPolygon', 'select', 'edit'], // Por defecto todos los modos
  defaultMode = 'view', // Por defecto modo vista
  mode: externalMode, // Modo controlado externamente
  onModeChange, // Callback cuando cambia el modo
  getPolygonColor, // Función opcional para color personalizado
}) => {
  // --- Estados de React ---
  const mapRef = useRef<MapRef>(null);

  // Estado para la vista del mapa (zoom, centro)
  const [viewState, setViewState] = useState(
    initialViewStateProp || {
      longitude: -65.207, // Un saludo a Tucumán :)
      latitude: -26.832,
      zoom: 13,
    }
  );

  // Estado para nuestros polígonos (formato GeoJSON)
  const [data, setData] = useState<FeatureCollection>(
    initialData || {
      type: 'FeatureCollection',
      features: [],
    }
  );

  // ESTADO CLAVE: El modo de edición (controlado por nuestros botones o por prop externa)
  const [internalMode, setInternalMode] = useState<Mode>(externalMode || defaultMode);
  
  // Si se pasa mode externamente, usarlo; si no, usar el estado interno
  const mode = externalMode !== undefined ? externalMode : internalMode;
  
  // Wrapper para cambiar el modo que también llama onModeChange si está definido
  const changeMode = useCallback((newMode: Mode) => {
    setInternalMode(newMode);
    onModeChange?.(newMode);
  }, [onModeChange]);

  // Estado para los índices de las figuras seleccionadas
  const [selectedFeatureIndexes, setSelectedFeatureIndexes] = useState<number[]>([]);

  // Estado para puntos temporales al dibujar
  const [drawingPoints, setDrawingPoints] = useState<Position[]>([]);

  // Estado para el vértice que se está arrastrando
  const [draggingVertex, setDraggingVertex] = useState<{
    featureIndex: number;
    vertexIndex: number;
  } | null>(null);
  
  // Ref para el canvas de DeckGL
  const deckRef = useRef<any>(null);
  
  // Ref para trackear si el mouse está presionado
  const isMouseDownRef = useRef(false);
  
  // Ref para trackear la última versión de initialData procesada
  const lastInitialDataRef = useRef<FeatureCollection | undefined>(initialData);

  // Sincronizar datos externos con el estado interno
  useEffect(() => {
    if (initialData && initialData !== lastInitialDataRef.current) {
      // Solo actualizar si cambió la referencia
      setData(initialData);
      lastInitialDataRef.current = initialData;
      // Limpiar la selección cuando cambian los datos externamente
      setSelectedFeatureIndexes([]);
    }
  }, [initialData]);

  // Helper para verificar si un modo está disponible funcionalmente
  const isModeAvailable = useCallback((modeToCheck: Mode) => {
    return availableModes.includes(modeToCheck);
  }, [availableModes]);

  // Helper para verificar si un botón debe ser visible
  const isButtonVisible = useCallback((modeToCheck: Mode) => {
    // Si visibleButtons está definido, usar eso
    if (visibleButtons !== undefined) {
      return visibleButtons.includes(modeToCheck);
    }
    // Si no, mostrar todos los modos disponibles
    return availableModes.includes(modeToCheck);
  }, [visibleButtons, availableModes]);

  // --- 4. Handlers (Lógica de dibujo) ---

  // Handler para clicks en DeckGL (para dibujar y seleccionar)
  const handleDeckClick = useCallback((info: any, event: any) => {
    // Si clickeamos un vértice, NO hacer nada aquí (se maneja en onDrag)
    if (info.layer?.id === 'edit-vertices-layer' && info.object && mode === 'edit') {
      // Prevenir el comportamiento por defecto
      event?.stopPropagation?.();
      return false;
    }

    // No hacer nada si estamos arrastrando un vértice
    if (draggingVertex) return;

    // Si estamos dibujando, añadir punto
    if (mode === 'drawPolygon') {
      const { coordinate } = info;
      if (coordinate) {
        const newPoint: Position = [coordinate[0], coordinate[1]];
        setDrawingPoints(prev => [...prev, newPoint]);
      }
      return;
    }

    // Si estamos en modo seleccionar
    if (mode === 'select') {
      // Si clickeamos un polígono, seleccionarlo
      if (info.object && info.layer?.id === 'polygon-layer') {
        // Si es el field boundary, deseleccionar cualquier selección actual
        if (info.object.properties?.isFieldBoundary) {
          console.log('Click en el límite del campo - deseleccionando');
          setSelectedFeatureIndexes([]);
          onFeatureSelect?.(null, null);
          return;
        }
        
        const index = data.features.indexOf(info.object);
        setSelectedFeatureIndexes([index]);
        onFeatureSelect?.(info.object, index);
        console.log('¡Figura seleccionada!', info.object);
      } else {
        // Click en área vacía: deseleccionar
        setSelectedFeatureIndexes([]);
        onFeatureSelect?.(null, null);
        console.log('Figura deseleccionada (click en área vacía)');
      }
    }
  }, [mode, data.features, draggingVertex, onFeatureSelect]);

  // Función para completar el polígono
  const finishDrawing = useCallback(() => {
    if (drawingPoints.length < 3) {
      alert('Necesitas al menos 3 puntos para crear un polígono');
      return;
    }

    // Cerrar el polígono añadiendo el primer punto al final
    const coordinates = [...drawingPoints, drawingPoints[0]];

    const newFeature: Feature<Polygon> = {
      type: 'Feature',
      properties: {
        id: Date.now(),
        name: `Polígono ${data.features.length + 1}`
      },
      geometry: {
        type: 'Polygon',
        coordinates: [coordinates]
      }
    };

    const newData = {
      type: 'FeatureCollection' as const,
      features: [...data.features, newFeature]
    };

    setData(newData);
    onDataChange?.(newData);

    setDrawingPoints([]);
    changeMode('select');
  }, [drawingPoints, data.features, onDataChange, changeMode]);

  // Función para cancelar el dibujo
  const cancelDrawing = useCallback(() => {
    setDrawingPoints([]);
    changeMode('view');
  }, [changeMode]);

  // Función para eliminar las figuras seleccionadas
  const handleDelete = () => {
    if (selectedFeatureIndexes.length === 0) return;

    const newFeatures = data.features.filter(
      (_, index) => !selectedFeatureIndexes.includes(index)
    );

    const newData = {
      type: 'FeatureCollection' as const,
      features: newFeatures,
    };

    setData(newData);
    onDataChange?.(newData);
    
    setSelectedFeatureIndexes([]);
    changeMode('view');
  };

  // Handler para hover sobre el mapa (para actualizar drag)
  const handleVertexDrag = useCallback((info: any) => {
    if (!info.coordinate || mode !== 'edit') return;
    
    console.log('🔄 Drag event:', { draggingVertex, isMouseDown: isMouseDownRef.current, coordinate: info.coordinate });
    
    // Si tenemos un vértice seleccionado para drag
    if (draggingVertex) {
      const { featureIndex, vertexIndex } = draggingVertex;
      const feature = data.features[featureIndex];
      
      console.log('📍 Actualizando vértice', vertexIndex, 'a coordenadas:', info.coordinate);
      
      if (feature && feature.geometry.type === 'Polygon') {
        const coordinates = [...feature.geometry.coordinates[0]];
        
        // Actualizar la posición del vértice
        coordinates[vertexIndex] = [info.coordinate[0], info.coordinate[1]];
        
        // Actualizar también el último punto si es el primer vértice (para cerrar el polígono)
        if (vertexIndex === 0) {
          coordinates[coordinates.length - 1] = [info.coordinate[0], info.coordinate[1]];
        }

        // Crear una copia del feature con las coordenadas actualizadas
        const updatedFeature: Feature<Polygon> = {
          ...feature,
          properties: feature.properties,
          geometry: {
            type: 'Polygon',
            coordinates: [coordinates],
          },
        };

        // Actualizar el estado
        const newFeatures = [...data.features];
        newFeatures[featureIndex] = updatedFeature;

        const newData: FeatureCollection = {
          type: 'FeatureCollection',
          features: newFeatures,
        };

        console.log('💾 Nuevas coordenadas del polígono:', coordinates);
        setData(newData);
      }
    }
  }, [draggingVertex, mode, data]);
  
  // Handler para cuando se suelta el mouse (fin de drag)
  const handleMouseUp = useCallback(() => {
    if (draggingVertex) {
      console.log('✅ Drag finalizado');
      isMouseDownRef.current = false;
      onDataChange?.(data);
      setDraggingVertex(null);
    }
  }, [draggingVertex, data, onDataChange]);
  
  // Handler para detectar el inicio de drag
  const handleDragStart = useCallback((info: any) => {
    // Solo iniciar drag si es un vértice
    if (info.layer?.id === 'edit-vertices-layer' && info.object && mode === 'edit') {
      const vertex = info.object as any;
      console.log('🎯 Inicio de drag en vértice:', vertex);
      isMouseDownRef.current = true;
      setDraggingVertex({
        featureIndex: vertex.featureIndex,
        vertexIndex: vertex.vertexIndex,
      });
      return true; // Indicar que manejamos el drag
    }
    return false;
  }, [mode]);
  
  // Handler para cuando termina el drag
  const handleDragEnd = useCallback(() => {
    if (draggingVertex) {
      console.log('✅ Drag finalizado (DragEnd)');
      isMouseDownRef.current = false;
      onDataChange?.(data);
      setDraggingVertex(null);
    }
  }, [draggingVertex, data, onDataChange]);
  
  // Effect para agregar/remover event listener de mouseup global
  useEffect(() => {
    if (draggingVertex) {
      window.addEventListener('mouseup', handleMouseUp);
      return () => window.removeEventListener('mouseup', handleMouseUp);
    }
  }, [draggingVertex, handleMouseUp]);

  // --- 5. Definición de las Capas ---
  
  // Capa para mostrar polígonos existentes
  const polygonLayer = useMemo(() => new GeoJsonLayer({
    id: 'polygon-layer',
    data,
    pickable: true,
    stroked: true,
    filled: true,
    wireframe: true,
    lineWidthMinPixels: 2,
    getFillColor: (d: Feature) => {
      // Si es field boundary, sin relleno (transparente)
      if (d.properties?.isFieldBoundary) {
        return [0, 0, 0, 0]; // Totalmente transparente
      }
      
      const isSelected = selectedFeatureIndexes.includes(data.features.indexOf(d));
      
      // Si hay función personalizada de color, usarla
      if (getPolygonColor) {
        return getPolygonColor(d, isSelected);
      }
      
      // Colores por defecto
      if (isSelected) {
        return [255, 100, 100, 100]; // Rojo si está seleccionado
      }
      return [0, 100, 255, 100]; // Azul normal
    },
    getLineColor: (d: Feature) => {
      // Si es field boundary, línea gris
      if (d.properties?.isFieldBoundary) {
        return [100, 100, 100, 200]; // Gris oscuro
      }
      
      // Si tiene color personalizado, usar un tono más oscuro para el borde
      if (getPolygonColor && d.properties?.color) {
        const customColor = getPolygonColor(d, false);
        // Hacer el borde más oscuro y opaco
        return [
          Math.max(0, customColor[0] - 50),
          Math.max(0, customColor[1] - 50),
          Math.max(0, customColor[2] - 50),
          255
        ];
      }
      
      // Normal, línea azul
      return [0, 0, 255, 255];
    },
    getLineWidth: (d: Feature) => {
      // Si es field boundary, línea más delgada
      if (d.properties?.isFieldBoundary) {
        return 1.5;
      }
      return 2;
    },
    getDashArray: (d: Feature) => {
      // Si es field boundary, línea punteada
      if (d.properties?.isFieldBoundary) {
        return [5, 5]; // Patrón de guiones: 5px línea, 5px espacio
      }
      return [0, 0]; // Sin guiones para polígonos normales
    },
  }), [data, selectedFeatureIndexes, getPolygonColor]);

  // Capa para mostrar el polígono que se está dibujando
  const drawingLayer = useMemo(() => 
    drawingPoints.length > 0 ? new GeoJsonLayer({
      id: 'drawing-layer',
      data: {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: drawingPoints
          }
        }]
      } as FeatureCollection,
      pickable: false,
      stroked: true,
      lineWidthMinPixels: 2,
      getLineColor: [255, 0, 0, 255],
      getLineWidth: 2,
    }) : null
  , [drawingPoints]);

  // Capa para mostrar puntos de dibujo temporal
  const drawingPointsLayer = useMemo(() => 
    drawingPoints.length > 0 ? new ScatterplotLayer({
      id: 'drawing-points-layer',
      data: drawingPoints.map((p, i) => ({ position: p, index: i })),
      pickable: false,
      filled: true,
      radiusMinPixels: 5,
      radiusMaxPixels: 5,
      getPosition: (d: { position: Position }) => d.position as [number, number],
      getFillColor: [255, 0, 0, 255],
    }) : null
  , [drawingPoints]);

  // Capa para mostrar vértices editables del polígono seleccionado
  const editVerticesLayer = useMemo(() => {
    if (mode !== 'edit' || selectedFeatureIndexes.length === 0) return null;
    
    const selectedFeature = data.features[selectedFeatureIndexes[0]];
    if (!selectedFeature || selectedFeature.geometry.type !== 'Polygon') return null;
    
    const coordinates = selectedFeature.geometry.coordinates[0];
    // Excluir el último punto ya que es duplicado del primero
    const vertices = coordinates.slice(0, -1);
    
    return new ScatterplotLayer({
      id: 'edit-vertices-layer',
      data: vertices.map((p, i) => ({ 
        position: p, 
        vertexIndex: i,
        featureIndex: selectedFeatureIndexes[0]
      })),
      pickable: true,
      filled: true,
      radiusMinPixels: 8,
      radiusMaxPixels: 8,
      getPosition: (d: { position: Position }) => d.position as [number, number],
      getFillColor: (d: { position: Position; vertexIndex: number }) => {
        // Resaltar el vértice que se está arrastrando
        if (draggingVertex && d.vertexIndex === draggingVertex.vertexIndex) {
          return [255, 255, 0, 255]; // Amarillo cuando se arrastra
        }
        return [255, 0, 0, 255]; // Rojo normal
      },
      getLineColor: [255, 255, 255, 255],
      lineWidthMinPixels: 2,
      stroked: true,
      autoHighlight: true,
      highlightColor: [255, 255, 0, 150],
    });
  }, [mode, selectedFeatureIndexes, data, draggingVertex]);

  const layers = useMemo(() => 
    [polygonLayer, drawingLayer, drawingPointsLayer, editVerticesLayer].filter(Boolean)
  , [polygonLayer, drawingLayer, drawingPointsLayer, editVerticesLayer]);

  // --- 6. Renderizado (JSX) ---
  return (
    // TooltipProvider es necesario para que funcionen los tooltips de Shadcn
    <TooltipProvider delayDuration={100}>
      <div style={{ height: '600px', width: '100%', position: 'relative' }}>
        
        {/* --- Panel de Control con Shadcn/ui --- */}
        {showControls && (
          <Card className="absolute top-4 left-4 z-10 w-[280px]">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="mr-2 h-5 w-5" />
                Controles del Mapa
              </CardTitle>
              <CardDescription>
                Usa los botones para gestionar las figuras.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              
              {!editable ? (
                <div className="text-sm text-muted-foreground p-2 bg-gray-50 dark:bg-gray-900 rounded">
                  Modo solo lectura. La edición está deshabilitada.
                </div>
              ) : mode === 'drawPolygon' ? (
                <>
                  <div className="text-sm text-muted-foreground mb-2 p-2 bg-blue-50 dark:bg-blue-950 rounded">
                    Haz clic en el mapa para añadir puntos. Mínimo 3 puntos.
                  </div>
                  <Button
                    variant="default"
                    onClick={finishDrawing}
                    disabled={drawingPoints.length < 3}
                  >
                    <PenTool className="mr-2 h-4 w-4" /> Finalizar Polígono ({drawingPoints.length} puntos)
                  </Button>
                  <Button
                    variant="outline"
                    onClick={cancelDrawing}
                  >
                    Cancelar
                  </Button>
                </>
              ) : (
                <>
                  {isButtonVisible('drawPolygon') && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          onClick={() => changeMode('drawPolygon')}
                          disabled={!isModeAvailable('drawPolygon')}
                        >
                          <PenTool className="mr-2 h-4 w-4" /> Crear Polígono
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Dibuja una nueva figura poligonal</TooltipContent>
                    </Tooltip>
                  )}

                  {isButtonVisible('select') && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={mode === 'select' ? 'default' : 'outline'}
                          onClick={() => {
                            changeMode('select');
                            if (mode === 'edit') {
                              // Al salir del modo edición, mantener la selección
                            }
                          }}
                          disabled={data.features.length === 0 || !isModeAvailable('select')}
                        >
                          <MapPin className="mr-2 h-4 w-4" /> Seleccionar
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Haz clic en un polígono para seleccionarlo
                      </TooltipContent>
                    </Tooltip>
                  )}

                  {isButtonVisible('edit') && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={mode === 'edit' ? 'default' : 'outline'}
                          onClick={() => changeMode('edit')}
                          disabled={selectedFeatureIndexes.length === 0 || !isModeAvailable('edit')}
                        >
                          <Edit className="mr-2 h-4 w-4" /> Editar Vértices
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Arrastra los vértices rojos para editar el polígono seleccionado
                      </TooltipContent>
                    </Tooltip>
                  )}

                  {isButtonVisible('edit') && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={selectedFeatureIndexes.length > 0 ? 'destructive' : 'outline'}
                          onClick={handleDelete}
                          disabled={selectedFeatureIndexes.length === 0}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Eliminar Selección
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Elimina la figura seleccionada</TooltipContent>
                    </Tooltip>
                  )}

                  {isButtonVisible('view') && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={mode === 'view' ? 'default' : 'outline'}
                          onClick={() => {
                            changeMode('view');
                            setSelectedFeatureIndexes([]);
                          }}
                          disabled={!isModeAvailable('view')}
                        >
                          <Eye className="mr-2 h-4 w-4" /> Modo Ver
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Desactiva la edición y el dibujo</TooltipContent>
                    </Tooltip>
                  )}
                </>
              )}

              {/* Información de estado */}
              <div className="mt-2 pt-2 border-t">
                <p className="text-sm text-muted-foreground">
                  Modo Actual: <span className="font-medium text-primary">{mode}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Polígonos: <span className="font-medium text-primary">{data.features.length}</span>
                </p>
                {selectedFeatureIndexes.length > 0 && (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Seleccionado:{' '}
                      <span className="font-medium text-primary">
                        Polígono {selectedFeatureIndexes[0] + 1}
                      </span>
                    </p>
                    {mode === 'edit' && !draggingVertex && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        💡 Arrastra los puntos rojos para editar los vértices
                      </p>
                    )}
                    {draggingVertex && (
                      <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                        ✏️ Arrastrando vértice {draggingVertex.vertexIndex + 1}...
                      </p>
                    )}
                  </>
                )}
              </div>
              
            </CardContent>
          </Card>
        )}

        {/* --- El Mapa (Deck.gl + MapLibre) --- */}
        <DeckGL
          ref={deckRef}
          layers={layers}
          initialViewState={viewState}
          controller={{
            dragPan: !draggingVertex, // Deshabilitar pan solo cuando arrastramos vértice
            dragRotate: false,
            scrollZoom: true,
            touchZoom: true,
            touchRotate: false,
            keyboard: true,
            doubleClickZoom: true,
          }}
          onViewStateChange={(e) => {
            const newViewState = e.viewState as { longitude: number; latitude: number; zoom: number };
            setViewState({
              longitude: newViewState.longitude,
              latitude: newViewState.latitude,
              zoom: newViewState.zoom
            });
          }}
          onClick={handleDeckClick}
          onDragStart={handleDragStart} // Detectar inicio de drag
          onDrag={handleVertexDrag} // Actualizar posición durante drag
          onDragEnd={handleDragEnd} // Detectar fin de drag
          getCursor={({ isHovering }) => {
            if (draggingVertex) return 'grabbing';
            if (isHovering && mode === 'edit') return 'grab';
            if (mode === 'drawPolygon') return 'crosshair';
            if (mode === 'select') return 'pointer';
            return 'default';
          }}
        >
          <Map
            ref={mapRef}
            mapStyle={MAPTILER_STYLE_URL}
          />
        </DeckGL>
      </div>
    </TooltipProvider>
  );
};

export default InteractiveMap;
