// src/common/utils/map-utils.ts
import type { FeatureCollection, Feature, Polygon } from 'geojson';
import type { Field, FieldBoundary, Plot } from '@/lib/map-types';

/**
 * Convierte un array de campos (Fields) con sus parcelas (plots) 
 * en un FeatureCollection que puede ser usado por el InteractiveMap
 */
export function fieldsToFeatureCollection(fields: Field[]): FeatureCollection {
  const features: Feature[] = [];

  fields.forEach(field => {
    // Agregar el boundary del campo
    if (field.boundary) {
      features.push({
        ...field.boundary,
        properties: {
          ...field.boundary.properties,
          type: 'field-boundary', // Etiqueta importante
          fieldId: field.id,
        }
      });
    }

    // Agregar todas las parcelas del campo
    if (field.plots && field.plots.length > 0) {
      field.plots.forEach(plot => {
        features.push({
          ...plot,
          properties: {
            ...plot.properties,
            type: 'plot', // Etiqueta importante
            fieldId: field.id,
          }
        });
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
 * (útil para guardar cambios y detectar nuevos dibujos)
 */
export function featureCollectionToFields(featureCollection: FeatureCollection): Field[] {
  const fieldsMap = new Map<string, Field>();

  featureCollection.features.forEach(feature => {
const props = (feature.properties || {}) as Record<string, any>;
    
    // CASO 1: Detección de NUEVO polígono (recién dibujado)
    // InteractiveMap marca los nuevos con isNewPolygon.
    // Si no tiene 'type' ni 'fieldId', asumimos que es un intento de crear un campo.
    const isNewDrawing = props.isNewPolygon || (!props.type && !props.fieldId);

    if (isNewDrawing) {
      // Usamos el ID temporal que genera InteractiveMap o creamos uno
      const tempId = (feature.id as string) || `temp-${Date.now()}`;
      
      // Lo tratamos inmediatamente como un Field nuevo
      fieldsMap.set(tempId, {
        id: tempId,
        // Construimos un boundary válido
        boundary: {
          type: 'Feature',
          id: tempId,
          geometry: feature.geometry as Polygon,
          properties: {
            name: 'Nuevo Campo',
            color: '#3b82f6', // Color default
            ...props,
            type: 'field-boundary' // Le asignamos tipo para que deje de ser "nuevo" en el futuro
          } as any
        },
        plots: [],
        // Campos opcionales requeridos por el tipo Field
        name: '',
        address: '',
        area: 0
      });
      return; // Terminamos con este feature
    }

    // CASO 2: Features existentes (Fields o Plots guardados)
    const fieldId = props.fieldId;
    
    // Si por alguna razón no hay fieldId en un elemento no-nuevo, lo saltamos
    if (!fieldId) return; 

    // Inicializar el campo en el mapa si no existe
    if (!fieldsMap.has(fieldId)) {
      fieldsMap.set(fieldId, {
        id: fieldId,
        plots: [],
        // Valores placeholder, se rellenarán si encontramos el boundary
        boundary: undefined as any 
      } as Field);
    }

    const field = fieldsMap.get(fieldId)!;

    if (props.type === 'field-boundary') {
      // Es el contorno del campo
      field.boundary = feature as unknown as FieldBoundary;
      
      // Si properties tiene datos del campo, actualizamos el objeto padre también
      if (props.name) field.name = props.name;
      
    } else if (props.type === 'plot') {
      // Es una parcela dentro del campo
      if (!field.plots) {
        field.plots = [];
      }
      // Evitar duplicados si es necesario
      const existingPlotIndex = field.plots.findIndex(p => p.id === feature.id);
      if (existingPlotIndex >= 0) {
        field.plots[existingPlotIndex] = feature as unknown as Plot;
      } else {
        field.plots.push(feature as unknown as Plot);
      }
    }
  });

  // Filtrar resultado final: Solo devolvemos campos que tengan un boundary definido
  // (Esto limpia artifacts o plots huérfanos que no tengan su campo padre cargado)
  return Array.from(fieldsMap.values()).filter(f => f.boundary) as Field[];
}

/**
 * Calcula el centro geográfico de un FeatureCollection
 */
export function calculateCenter(featureCollection: FeatureCollection): { longitude: number; latitude: number; zoom: number } {
  if (!featureCollection.features.length) {
    return { longitude: -65.207, latitude: -26.832, zoom: 13 };
  }

  let minLng = Infinity;
  let maxLng = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;

  featureCollection.features.forEach(feature => {
    if (feature.geometry.type === 'Polygon') {
      // Asegurar que coordinates[0] existe
      const ring = feature.geometry.coordinates[0];
      if (ring) {
        ring.forEach(coord => {
          const [lng, lat] = coord;
          minLng = Math.min(minLng, lng);
          maxLng = Math.max(maxLng, lng);
          minLat = Math.min(minLat, lat);
          maxLat = Math.max(maxLat, lat);
        });
      }
    }
  });

  // Si no se encontraron coordenadas válidas
  if (minLng === Infinity) {
     return { longitude: -65.207, latitude: -26.832, zoom: 13 };
  }

  const longitude = (minLng + maxLng) / 2;
  const latitude = (minLat + maxLat) / 2;

  const lngDiff = maxLng - minLng;
  const latDiff = maxLat - minLat;
  const maxDiff = Math.max(lngDiff, latDiff);

  const zoom = maxDiff > 0.1 ? 10 : maxDiff > 0.05 ? 12 : maxDiff > 0.01 ? 13 : 14;

  return { longitude, latitude, zoom };
}