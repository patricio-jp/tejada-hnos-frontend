import type { FeatureCollection, Feature, Polygon } from 'geojson';
import type { Field, FieldBoundary, Plot } from '@/lib/map-types';

/**
 * Convierte un array de campos (Fields) con sus parcelas (plots) 
 * en un FeatureCollection que puede ser usado por el InteractiveMap
 */
export function fieldsToFeatureCollection(fields: Field[]): FeatureCollection {
  const features: Feature[] = [];

  fields.forEach(field => {
    // 1. Agregar el boundary del campo
    if (field.boundary) {
      features.push({
        ...field.boundary,
        properties: {
          ...field.boundary.properties,
          type: 'field-boundary',
          fieldId: field.id,
        }
      });
    } else if (field.location) {
      // Caso: Campo del backend sin boundary estructurado
      features.push({
        type: 'Feature',
        id: field.id,
        geometry: field.location as Polygon,
        properties: {
          name: field.name,
          type: 'field-boundary',
          fieldId: field.id,
          color: '#3b82f6'
        }
      });
    }

    // 2. Agregar todas las parcelas del campo
    if (field.plots && field.plots.length > 0) {
      field.plots.forEach(plot => {
        // Casteamos a 'any' para manejar la flexibilidad entre datos de backend/frontend
        const p = plot as any;
        
        // Detectamos geometría (puede venir como 'geometry' o 'location')
        const plotGeometry = p.geometry || p.location;

        if (plotGeometry) {
          // Creamos el objeto feature por separado para evitar errores de sintaxis
          const plotFeature = {
            type: 'Feature',
            id: p.id,
            geometry: plotGeometry,
            properties: {
              ...(p.properties || {}),
              // Aseguramos obtener el nombre de donde sea que venga
              name: p.name || p.properties?.name || 'Parcela',
              type: 'plot',
              fieldId: field.id,
            }
          };

          // Empujamos al array
          features.push(plotFeature as any);
        }
      });
    }
  });

  return {
    type: 'FeatureCollection',
    features
  };
}

/**
 * Convierte un FeatureCollection de vuelta a la estructura de campos
 */
export function featureCollectionToFields(featureCollection: FeatureCollection): Field[] {
  const fieldsMap = new Map<string, Field>();

  featureCollection.features.forEach(feature => {
    const props = (feature.properties || {}) as Record<string, any>;
    
    // CASO 1: Detección de NUEVO polígono (recién dibujado)
    const isNewDrawing = props.isNewPolygon || (!props.type && !props.fieldId);

    if (isNewDrawing) {
      const tempId = (feature.id as string) || `temp-${Date.now()}`;
      fieldsMap.set(tempId, {
        id: tempId,
        boundary: {
          type: 'Feature',
          id: tempId,
          geometry: feature.geometry as Polygon,
          properties: {
            name: 'Nuevo Campo',
            color: '#3b82f6',
            ...(props as any),
            type: 'field-boundary'
          } as any
        },
        plots: [],
        name: '',
        address: '',
        area: 0
      });
      return;
    }

    // CASO 2: Features existentes
    const fieldId = props.fieldId;
    if (!fieldId) return; 

    if (!fieldsMap.has(fieldId)) {
      fieldsMap.set(fieldId, {
        id: fieldId,
        plots: [],
        boundary: undefined as any 
      } as Field);
    }

    const field = fieldsMap.get(fieldId)!;

    if (props.type === 'field-boundary') {
      field.boundary = feature as unknown as FieldBoundary;
      if (props.name) field.name = props.name;
      
    } else if (props.type === 'plot') {
      if (!field.plots) field.plots = [];
      
      const existingPlotIndex = field.plots.findIndex(p => p.id === feature.id);
      if (existingPlotIndex >= 0) {
        field.plots[existingPlotIndex] = feature as unknown as Plot;
      } else {
        field.plots.push(feature as unknown as Plot);
      }
    }
  });

  return Array.from(fieldsMap.values()).filter(f => f.boundary) as Field[];
}

/**
 * Calcula el centro geográfico de un FeatureCollection
 */
export function calculateCenter(featureCollection: FeatureCollection): { longitude: number; latitude: number; zoom: number } {
  if (!featureCollection.features.length) {
    return { longitude: -65.207, latitude: -26.832, zoom: 13 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  const processCoords = (coords: any) => {
    // coords can be nested arrays or a single [lon, lat]
    if (!coords) return;
    if (typeof coords[0] === 'number' && typeof coords[1] === 'number') {
      const [lon, lat] = coords as [number, number];
      minX = Math.min(minX, lon);
      minY = Math.min(minY, lat);
      maxX = Math.max(maxX, lon);
      maxY = Math.max(maxY, lat);
    } else if (Array.isArray(coords)) {
      for (const c of coords) processCoords(c);
    }
  };

  for (const feature of featureCollection.features) {
    const geom: any = (feature as any).geometry;
    if (!geom) continue;

    if (geom.type === 'Point') {
      processCoords(geom.coordinates);
    } else if (geom.type === 'MultiPoint' || geom.type === 'LineString' || geom.type === 'MultiLineString') {
      processCoords(geom.coordinates);
    } else if (geom.type === 'Polygon' || geom.type === 'MultiPolygon') {
      processCoords(geom.coordinates);
    } else {
      // Fallback para cualquier otra estructura con coordinates
      if (geom.coordinates) processCoords(geom.coordinates);
    }
  }

  if (!isFinite(minX) || !isFinite(minY) || !isFinite(maxX) || !isFinite(maxY)) {
    // Si no se pudieron calcular coordenadas válidas, devolver valores por defecto
    return { longitude: -65.207, latitude: -26.832, zoom: 13 };
  }

  const longitude = (minX + maxX) / 2;
  const latitude = (minY + maxY) / 2;

  // Estimación simple de zoom basada en la extensión máxima (en grados)
  const lonDiff = maxX - minX;
  const latDiff = maxY - minY;
  const maxDiff = Math.max(lonDiff, latDiff);

  let zoom = 13;
  if (maxDiff > 0) {
    // heurística: zoom ~= log2(360 / span) + ajuste
    const raw = Math.log2(360 / maxDiff);
    zoom = Math.round(raw) + 1;
    if (zoom < 1) zoom = 1;
    if (zoom > 20) zoom = 20;
  }

  return { longitude, latitude, zoom };
}