// src/pages/CamposPage.tsx
import React, { Suspense } from 'react';
import { MOCK_FIELDS } from '@/lib/mock-data';

// Carga diferida (Lazy) del componente de MAPA
const FieldsMap = React.lazy(() => 
  import('../components/FieldsMap').then(mod => ({ default: mod.FieldsMap }))
);

export default function CamposPage() {
  const fields = MOCK_FIELDS;

  return (
    <div className="container mx-auto py-4">
      <h1 className="text-3xl font-bold mb-4">Gestión de Campos</h1>
      
      {/* Suspense para el componente de mapa */}
      <Suspense fallback={<p className="text-center">Cargando mapa...</p>}>
        <FieldsMap fields={fields} />
      </Suspense>
    </div>
  );
}
