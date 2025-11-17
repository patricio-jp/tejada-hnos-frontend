// src/common/utils/plot-map-utils.ts

import type { FeatureCollection, Feature, Polygon } from 'geojson';
import type { Plot } from '@/lib/map-types';
import { computePolygonAreaHectares } from './geometry';

/**
 * Convierte un array de Plots a FeatureCollection para usar con InteractiveMap
 * Maneja tanto plots del backend (con location) como del editor (con geometry)
 */
export function plotsToFeatureCollection(plots: Plot[]): FeatureCollection {
  const features: Feature<Polygon>[] = plots
    .filter(plot => {
      // Solo incluir plots que tengan geometría
      const hasGeometry = (plot as any).geometry || (plot as any).location;
      return !!hasGeometry;
    })
    .map(plot => {
      // Determinar la geometría: puede venir como 'geometry' (editor) o 'location' (backend)
      const geometry = (plot as any).geometry || (plot as any).location;
      
      return {
        type: 'Feature',
        id: plot.id,
        geometry: geometry as Polygon,
        properties: {
          ...plot.properties,
          plotId: plot.id,
        }
      };
    });

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
