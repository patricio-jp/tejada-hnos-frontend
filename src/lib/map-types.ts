// src/lib/types.ts

// Importamos los tipos de GeoJSON
import type { Feature, Polygon } from 'geojson';

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
export type Plot = Feature<Polygon, PlotProperties>;


/**
 * Propiedades personalizadas para un Campo.
 */
export interface FieldProperties {
  name: string;
  color?: string;
  // Usaremos 'feature.id' para el ID del campo.
}

/**
 * El límite de un Campo también es un Feature.
 */
export type FieldBoundary = Feature<Polygon, FieldProperties>;


/**
 * Definición compuesta de un Campo,
 * que contiene su límite y sus parcelas.
 */
export interface Field {
  id: string; // ID del campo
  boundary?: FieldBoundary; // Límite (GeoJSON Feature) - opcional cuando viene del backend
  plots: Plot[]; // Parcelas (Array de GeoJSON Features)
  // Propiedades adicionales del backend
  name?: string; // Nombre del campo (cuando viene del backend)
  address?: string;
  area?: number;
  location?: any;
  managerId?: string;
  deletedAt?: Date | null;
}
