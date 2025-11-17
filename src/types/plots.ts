/**
 * Tipos e interfaces para el módulo de Plots
 */

import type { Feature, Polygon } from 'geojson';
import type { Field } from './fields';
import type { Variety } from './varieties';

/**
 * Propiedades personalizadas para una Parcela.
 * (Esto irá dentro de feature.properties)
 */
export interface PlotProperties {
  name: string;
  variety: string;
  area: number; // en hectáreas
  color?: string;
}

/**
 * Una Parcela es ahora un Feature GeoJSON.
 * - La geometría es 'Polygon'.
 * - Las propiedades son 'PlotProperties'.
 * - Usaremos 'feature.id' para el ID de la parcela.
 */
export type PlotFeature = Feature<Polygon, PlotProperties>;

/**
 * Parcela con información completa
 */
export interface Plot {
  id: string;
  name: string;
  area: number;
  fieldId: string;
  field?: Field;
  varietyId?: string;
  variety?: Variety;
  datePlanted?: string;
  location: any; // GeoJSON Polygon
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

/**
 * Resumen de parcela
 */
export type PlotSummary = {
  id: string;
  name: string;
  area: number;
  fieldName?: string;
  varietyName?: string;
}
