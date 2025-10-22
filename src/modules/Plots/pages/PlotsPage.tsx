// src/pages/ParcelaPage.tsx
import React, { Suspense } from 'react';
import { MOCK_FIELDS } from '@/lib/mock-data';
import { useParams, Link } from 'react-router';
import { Button } from '@/components/ui/button';

// Carga diferida (Lazy) del editor
const PlotsEditor = React.lazy(() => 
  import('../components/PlotsEditor').then(mod => ({ default: mod.PlotsEditor }))
);

// Esta función buscaría el campo (en el mock o en la API)
function getFieldById(id: string) {
  return MOCK_FIELDS.find(field => field.id === id);
}

export default function ParcelaPage() {
  const { fieldId } = useParams<{ fieldId: string }>();

  if (!fieldId) {
    return <div className="container mx-auto py-10">Error: ID de campo no especificado.</div>;
  }
  
  const field = getFieldById(fieldId);

  if (!field) {
    return <div className="container mx-auto py-10">Campo no encontrado.</div>;
  }

  return (
    <div className="container mx-auto py-4">
      <Button asChild variant="outline" className="mb-4">
        <Link to="/fields">{"< Volver a Campos"}</Link>
      </Button>
      
      <h1 className="text-3xl font-bold mb-1">Gestionar Parcelas</h1>
      <h2 className="text-xl text-muted-foreground mb-4">
        Campo: {field.boundary.properties.name}
      </h2>
      
      <Suspense fallback={<p className="text-center">Cargando editor...</p>}>
        <PlotsEditor field={field} />
      </Suspense>
    </div>
  );
}
