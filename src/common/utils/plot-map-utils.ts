// src/common/utils/plot-map-utils.ts

import type { FeatureCollection, Feature, Polygon } from 'geojson';
import type { Plot } from '@/lib/map-types';
import { computePolygonAreaHectares } from './geometry';

/**
 * Convierte un array de Plots a FeatureCollection para usar con InteractiveMap
 */
export function plotsToFeatureCollection(plots: Plot[]): FeatureCollection {
  const features: Feature<Polygon>[] = plots.map(plot => ({
    type: 'Feature',
    id: plot.id,
    geometry: plot.geometry,
    properties: {
      ...plot.properties,
      plotId: plot.id,
    }
  }));

  return {
    type: 'FeatureCollection',
    features
  };
}

/**
 * Convierte un FeatureCollection de vuelta a Plots
 */
export function featureCollectionToPlots(
  featureCollection: FeatureCollection,
  existingPlots: Plot[]
): Plot[] {
  return featureCollection.features.map((feature) => {
    const plotId = feature.id as string | number;
    const existingPlot = existingPlots.find(p => p.id === plotId);
    
    const coords = (feature.geometry as Polygon).coordinates as number[][][];
    const area = computePolygonAreaHectares(coords);
    
    return {
      type: 'Feature',
      id: plotId,
      geometry: feature.geometry as Polygon,
      properties: {
        name: feature.properties?.name || existingPlot?.properties?.name || 'Parcela sin nombre',
        variety: feature.properties?.variety || existingPlot?.properties?.variety || 'Sin asignar',
        color: feature.properties?.color || existingPlot?.properties?.color || '#16a34a',
        area,
      }
    } as Plot;
  });
}
