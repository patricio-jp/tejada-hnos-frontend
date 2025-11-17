/**
 * Tipos e interfaces para el módulo de Fields
 */

import type { Feature, Polygon } from 'geojson';
import type { Plot } from './plots';
import type { User } from './user';

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
  name: string;
  area?: number;
  address?: string;
  location?: any;
  boundary?: FieldBoundary; // Límite (GeoJSON Feature)
  plots?: Plot[]; // Parcelas dentro del campo
  managerId?: string; // ID del usuario que gestiona el campo
  manager?: User;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}
