import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { FieldForm } from './FieldForm';
import type { Field } from '@/lib/map-types';
import type { CreateFieldDto, UpdateFieldDto } from '../utils/field-api';
import InteractiveMap from '@/common/components/InteractiveMap';
import { fieldsToFeatureCollection, calculateCenter } from '@/common/utils/map-utils';
import { useMemo, useState, useEffect } from 'react'; // IMPORTANTE: agregar useState y useEffect
import { Loader2 } from 'lucide-react'; // Para mostrar algo mientras carga esos milisegundos

interface FieldDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  field?: Field;
  onSubmit: (data: CreateFieldDto | UpdateFieldDto) => Promise<void>;
  initialLocation?: any;
}

export function FieldDialog({ open, onOpenChange, field, onSubmit, initialLocation }: FieldDialogProps) {
  const [mapReady, setMapReady] = useState(false); // Estado para controlar el renderizado del mapa

  // Efecto para retrasar la carga del mapa hasta que el diálogo termine de animar
  useEffect(() => {
    if (open) {
      setMapReady(false); // Resetear al abrir
      // 300ms suele ser suficiente para que termine la animación de shadcn/radix
      const timer = setTimeout(() => {
        setMapReady(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setMapReady(false);
    }
  }, [open]);

  const handleSubmit = async (data: CreateFieldDto | UpdateFieldDto) => {
    await onSubmit(data);
    onOpenChange(false);
  };

  const previewData = useMemo(() => {
    if (field) {
      return fieldsToFeatureCollection([field]);
    }
    if (initialLocation) {
      return fieldsToFeatureCollection([{
        id: 'temp-preview',
        name: 'Nuevo Campo',
        boundary: {
          type: 'Feature',
          id: 'temp-preview',
          geometry: initialLocation,
          properties: { name: 'Nuevo Campo', color: '#3b82f6', type: 'field-boundary' }
        },
        location: initialLocation,
        plots: []
      } as any]);
    }
    return null;
  }, [field, initialLocation]);

  const initialViewState = useMemo(() => 
    previewData ? calculateCenter(previewData) : undefined,
    [previewData]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] w-[95vw] max-h-[90vh] overflow-y-auto p-6">
        
        <DialogHeader className="mb-2">
          <DialogTitle className="text-xl font-bold">
            {field ? 'Editar Campo' : 'Crear Nuevo Campo'}
          </DialogTitle>
          <DialogDescription>
            {field 
              ? 'Modifica los datos y visualiza la ubicación.' 
              : 'Completa la información del campo dibujado.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
          
          {/* --- ZONA FORMULARIO --- */}
          <div className="order-2 md:order-1 flex flex-col justify-center">
            <FieldForm
              field={field}
              onSubmit={handleSubmit}
              onCancel={() => onOpenChange(false)}
              initialLocation={initialLocation}
            />
          </div>

          {/* --- ZONA MAPA --- */}
          <div className="order-1 md:order-2">
            <div className="h-[300px] md:h-[400px] w-full bg-slate-100 rounded-lg overflow-hidden border border-slate-200 shadow-sm relative">
              {previewData ? (
                // CONDICIONAL: Solo renderizamos el mapa si mapReady es true
                mapReady ? (
                  <>
                    <div className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-medium shadow-sm border border-slate-200 text-slate-600 uppercase tracking-wider">
                      Vista Previa
                    </div>
                    <InteractiveMap
                      // Usamos 'key' para forzar recreación si cambia la data
                      key={field?.id || 'new-field'} 
                      initialData={previewData}
                      initialViewState={initialViewState}
                      editable={false}
                      showControls={false}
                    />
                  </>
                ) : (
                  // Placeholder mientras esperamos los 300ms
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2 bg-slate-50">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
                    <p className="text-xs text-slate-400">Cargando vista previa...</p>
                  </div>
                )
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  Sin geometría
                </div>
              )}
            </div>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}