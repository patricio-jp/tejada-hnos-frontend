// src/common/utils/map-utils.ts

import type { FeatureCollection, Feature } from 'geojson';
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
          type: 'field-boundary',
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
            type: 'plot',
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
 * (útil para guardar cambios)
 */
export function featureCollectionToFields(featureCollection: FeatureCollection): Field[] {
  const fieldsMap = new Map<string, Partial<Field>>();

  featureCollection.features.forEach(feature => {
    const props = feature.properties;
    if (!props) return;

    const fieldId = props.fieldId || 'default-field';
    
    if (!fieldsMap.has(fieldId)) {
      fieldsMap.set(fieldId, {
        id: fieldId,
        plots: []
      });
    }

    const field = fieldsMap.get(fieldId)!;

    if (props.type === 'field-boundary') {
      field.boundary = feature as unknown as FieldBoundary;
    } else if (props.type === 'plot') {
      if (!field.plots) {
        field.plots = [];
      }
      field.plots.push(feature as unknown as Plot);
    }
  });

  // Filtrar campos que tengan boundary
  return Array.from(fieldsMap.values()).filter(f => f.boundary) as Field[];
}

/**
 * Calcula el centro geográfico de un FeatureCollection
 * (útil para centrar el mapa automáticamente)
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
      feature.geometry.coordinates[0].forEach(coord => {
        const [lng, lat] = coord;
        minLng = Math.min(minLng, lng);
        maxLng = Math.max(maxLng, lng);
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
      });
    }
  });

  const longitude = (minLng + maxLng) / 2;
  const latitude = (minLat + maxLat) / 2;

  // Calcular zoom basado en el tamaño del área
  const lngDiff = maxLng - minLng;
  const latDiff = maxLat - minLat;
  const maxDiff = Math.max(lngDiff, latDiff);

  // Fórmula aproximada para calcular el zoom
  const zoom = maxDiff > 0.1 ? 10 : maxDiff > 0.05 ? 12 : maxDiff > 0.01 ? 13 : 14;

  return { longitude, latitude, zoom };
}
