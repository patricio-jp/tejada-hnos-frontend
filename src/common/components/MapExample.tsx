// Ejemplo de uso del InteractiveMap con datos de mock-data.ts

import InteractiveMap from '@/common/components/InteractiveMap';
import { MOCK_FIELDS } from '@/lib/mock-data';
import { fieldsToFeatureCollection, calculateCenter } from '@/common/utils/map-utils';
import type { FeatureCollection } from 'geojson';

export default function MapExample() {
  // Convertir los datos mock a formato FeatureCollection
  const initialData = fieldsToFeatureCollection(MOCK_FIELDS);
  
  // Calcular el centro automáticamente basado en los datos
  const viewState = calculateCenter(initialData);

  // Handler para cuando cambien los datos
  const handleDataChange = (newData: FeatureCollection) => {
    console.log('Datos actualizados:', newData);
    // Aquí podrías guardar en el backend, actualizar el estado global, etc.
  };

  return (
    <div style={{ height: '600px', width: '100%' }}>
      <InteractiveMap
        initialData={initialData}
        initialViewState={viewState}
        onDataChange={handleDataChange}
        editable={true} // Permite edición
      />
    </div>
  );
}

// === Ejemplo 2: Modo solo lectura ===
export function MapReadOnlyExample() {
  const initialData = fieldsToFeatureCollection(MOCK_FIELDS);
  const viewState = calculateCenter(initialData);

  return (
    <div style={{ height: '600px', width: '100%' }}>
      <InteractiveMap
        initialData={initialData}
        initialViewState={viewState}
        editable={false} // Solo lectura
      />
    </div>
  );
}

// === Ejemplo 3: Mapa vacío para crear nuevos campos ===
export function MapEmptyExample() {
  const handleDataChange = (newData: FeatureCollection) => {
    console.log('Nuevos polígonos creados:', newData);
  };

  return (
    <div style={{ height: '600px', width: '100%' }}>
      <InteractiveMap
        onDataChange={handleDataChange}
        editable={true}
      />
    </div>
  );
}
