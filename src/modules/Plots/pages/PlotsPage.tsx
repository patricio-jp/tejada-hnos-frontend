// src/pages/ParcelaPage.tsx
import React, { Suspense } from 'react';
import { useParams } from 'react-router';
import { Loader2 } from 'lucide-react';

// Carga diferida (Lazy) de la página de detalle
const PlotFieldDetailPage = React.lazy(() => 
  import('./PlotFieldDetailPage').then(mod => ({ default: mod.PlotFieldDetailPage }))
);

export default function PlotsPage() {
  const { fieldId } = useParams<{ fieldId: string }>();

  if (!fieldId) {
    return (
      <div className="container mx-auto py-10">
        <p className="text-center text-destructive">Error: ID de campo no especificado.</p>
      </div>
    );
  }

  return (
    <Suspense 
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <PlotFieldDetailPage />
    </Suspense>
  );
}
