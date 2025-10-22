// src/common/utils/field-map-utils.ts

import type { FeatureCollection, Feature, Polygon } from 'geojson';
import type { Field } from '@/lib/map-types';

/**
 * Convierte un array de Fields a FeatureCollection para usar con InteractiveMap
 */
export function fieldsToFeatureCollection(fields: Field[]): FeatureCollection {
  const features: Feature<Polygon>[] = fields.map(field => ({
    type: 'Feature',
    id: field.id,
    geometry: field.boundary.geometry,
    properties: {
      ...field.boundary.properties,
      fieldId: field.id,
    }
  }));

  return {
    type: 'FeatureCollection',
    features
  };
}

/**
 * Convierte un FeatureCollection de vuelta a Fields
 */
export function featureCollectionToFields(
  featureCollection: FeatureCollection,
  existingFields: Field[]
): Field[] {
  return featureCollection.features.map((feature) => {
    const fieldId = feature.id as string;
    const existingField = existingFields.find(f => f.id === fieldId);
    
    return {
      id: fieldId,
      boundary: {
        type: 'Feature',
        id: fieldId,
        geometry: feature.geometry as Polygon,
        properties: {
          name: feature.properties?.name || existingField?.boundary.properties.name || 'Campo sin nombre',
          color: feature.properties?.color || existingField?.boundary.properties.color || '#2563eb',
        }
      },
      plots: existingField?.plots || []
    } as Field;
  });
}
