// src/common/utils/plot-map-utils.ts

import type { FeatureCollection, Feature, Polygon } from 'geojson';
import type { Plot as BackendPlot } from '@/types/plots';
import type { Plot as MapPlot } from '@/lib/map-types';
import { computePolygonAreaHectares } from './geometry';

/**
 * Convierte un array de Plots a FeatureCollection para usar con InteractiveMap
 * Maneja tanto plots del backend (@/types/plots con location) 
 * como del editor (@/lib/map-types con geometry)
 */
export function plotsToFeatureCollection(plots: (BackendPlot | MapPlot | any)[]): FeatureCollection {
  const features: Feature<Polygon>[] = plots
    .filter(plot => {
      // Solo incluir plots que tengan geometría
      const hasGeometry = (plot as any).geometry || (plot as any).location;
      return !!hasGeometry;
    })
    .map(plot => {
      // Determinar la geometría: puede venir como 'geometry' (editor) o 'location' (backend)
      const geometry = (plot as any).geometry || (plot as any).location;
      
      // Obtener el nombre desde diferentes ubicaciones posibles
      const plotName = (plot as any).name || (plot as any).properties?.name || `Parcela ${plot.id}`;
      
      // Obtener el ID
      const plotId = (plot as any).id || (plot as Feature)?.id;
      
      return {
        type: 'Feature',
        id: plotId,
        geometry: geometry as Polygon,
        properties: {
          name: plotName,
          variety: (plot as any).properties?.variety || (plot as any).variety?.name || 'Sin asignar',
          area: (plot as any).area || 0,
          plotId: plotId,
          // Preservar otras propiedades si existen
          ...(plot as any).properties,
        }
      };
    });

  return {
    type: 'FeatureCollection',
    features
  };
}

/**
 * Convierte un FeatureCollection de vuelta a Plots (tipo backend)
 */
export function featureCollectionToPlots(
  featureCollection: FeatureCollection,
  existingPlots: BackendPlot[]
): BackendPlot[] {
  return featureCollection.features.map((feature) => {
    const plotId = feature.id as string | number;
    const existingPlot = existingPlots.find(p => p.id === plotId);
    
    if (!existingPlot) {
      // Si no existe el plot, crear uno nuevo
      return {
        id: plotId as string,
        name: feature.properties?.name || 'Parcela sin nombre',
        area: feature.properties?.area || 0,
        fieldId: '',
        location: feature.geometry,
        varietyId: undefined,
      } as BackendPlot;
    }
    
    // Actualizar la geometría del plot existente
    return {
      ...existingPlot,
      location: feature.geometry,
      area: feature.properties?.area || existingPlot.area,
      name: feature.properties?.name || existingPlot.name,
    };
  });
}
