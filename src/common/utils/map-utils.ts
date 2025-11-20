import type { FeatureCollection, Feature, Polygon } from 'geojson';
import type { Field, FieldBoundary, Plot } from '@/lib/map-types';

// Definición simple de User para este utilitario
interface User { id: string; name: string; lastName?: string; } 

/**
 * Convierte un array de campos (Fields) en un FeatureCollection.
 * Muestra SOLO los campos (limpio) pero calcula datos de parcelas para el tooltip.
 */
export function fieldsToFeatureCollection(fields: Field[], users: User[] = []): FeatureCollection {
  const features: Feature[] = [];

  fields.forEach(field => {
    const f = field as any; 
    
    // --- 1. Obtener Manager ---
    let managerName = 'Sin asignar';
    
    if (f.managerId && users.length > 0) {
      const foundUser = users.find(u => u.id === f.managerId);
      if (foundUser) managerName = `${foundUser.name} ${foundUser.lastName || ''}`.trim();
    }
    if (managerName === 'Sin asignar' && f.manager && typeof f.manager === 'object') {
      managerName = `${f.manager.name || ''} ${f.manager.lastName || ''}`.trim();
    } 
    if (managerName === 'Sin asignar') {
       if (f.managerName) managerName = f.managerName;
       else if (f.properties?.managerName) managerName = f.properties.managerName;
    }

    // --- 2. Contar Parcelas ---
    let plotCount = 0;
    if (Array.isArray(f.plots)) {
      plotCount = f.plots.length;
    } else if (f.plotsCount !== undefined) {
      plotCount = f.plotsCount;
    } else if (f._count?.plots !== undefined) {
      plotCount = f._count.plots;
    } else if (f.properties?.plotCount !== undefined) {
      plotCount = f.properties.plotCount;
    }

    const tooltipProps = {
      area: f.area || 0,
      managerName: managerName,
      plotCount: plotCount
    };

    // --- 3. Construir Features (SOLO CAMPOS) ---
    
    if (field.boundary) {
      features.push({
        ...field.boundary,
        properties: {
          ...field.boundary.properties,
          type: 'field-boundary',
          fieldId: field.id,
          ...tooltipProps
        }
      });
    } else if (field.location) {
      features.push({
        type: 'Feature',
        id: field.id,
        geometry: field.location as Polygon,
        properties: {
          name: field.name,
          type: 'field-boundary',
          fieldId: field.id,
          color: '#3b82f6',
          ...tooltipProps
        }
      });
    }

    // NOTA: No agregamos las parcelas (features tipo 'plot') al mapa 
    // para mantener la vista limpia, solo usamos sus datos para el conteo.
  });

  return { type: 'FeatureCollection', features };
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

    if (geom.type === 'Point' || geom.type === 'MultiPoint' || geom.type === 'LineString' || geom.type === 'MultiLineString' || geom.type === 'Polygon' || geom.type === 'MultiPolygon') {
      processCoords(geom.coordinates);
    } else {
      if (geom.coordinates) processCoords(geom.coordinates);
    }
  }

  if (!isFinite(minX) || !isFinite(minY) || !isFinite(maxX) || !isFinite(maxY)) {
    return { longitude: -65.207, latitude: -26.832, zoom: 13 };
  }

  const longitude = (minX + maxX) / 2;
  const latitude = (minY + maxY) / 2;
  const lonDiff = maxX - minX;
  const latDiff = maxY - minY;
  const maxDiff = Math.max(lonDiff, latDiff);

  let zoom = 13;
  if (maxDiff > 0) {
    const raw = Math.log2(360 / maxDiff);
    zoom = Math.round(raw) + 1;
    if (zoom < 1) zoom = 1;
    if (zoom > 20) zoom = 20;
  }

  return { longitude, latitude, zoom };
}