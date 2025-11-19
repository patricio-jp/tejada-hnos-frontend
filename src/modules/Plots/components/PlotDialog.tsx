/**
 * PlotDialog - Modal para crear/editar plots
 */
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PlotForm } from './PlotForm';
import type { Plot } from '@/types/plots';
import type { Variety } from '@/types/varieties';
import type { UpdatePlotDto, CreatePlotDto } from '../utils/plot-api';
import InteractiveMap from '@/common/components/InteractiveMap';
import { plotsToFeatureCollection } from '@/common/utils/plot-map-utils';
import { calculateCenter } from '@/common/utils/map-utils'; // Reutilizamos la lógica de centrado
import { useMemo, useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface PlotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plot?: Plot;
  varieties: Variety[];
  loading?: boolean;
  onSubmit: (data: CreatePlotDto | UpdatePlotDto) => Promise<void>;
}

export function PlotDialog({
  open,
  onOpenChange,
  plot,
  varieties,
  loading,
  onSubmit,
}: PlotDialogProps) {
  const isEditMode = !!(plot && (plot as any).id); // Verificación más robusta
  const [mapReady, setMapReady] = useState(false);

  // 1. Efecto de retraso para evitar el mapa gris/vacío al abrir
  useEffect(() => {
    if (open) {
      setMapReady(false);
      const timer = setTimeout(() => {
        setMapReady(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setMapReady(false);
    }
  }, [open]);

  const handleSubmit = async (data: CreatePlotDto | UpdatePlotDto) => {
    try {
      await onSubmit(data);
      onOpenChange(false);
    } catch (error) {
      console.error('Error en PlotDialog:', error);
    }
  };

  // 2. Preparar datos del mapa (Preview)
  const previewData = useMemo(() => {
    if (plot) {
      // plotsToFeatureCollection maneja tanto objetos Plot del backend como tempPlots del editor
      return plotsToFeatureCollection([plot]);
    }
    return null;
  }, [plot]);

  // 3. Calcular centro automático
  const initialViewState = useMemo(() => 
    previewData ? calculateCenter(previewData) : undefined,
    [previewData]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* CAMBIO: Ancho aumentado a 900px (igual que Fields) */}
      <DialogContent className="sm:max-w-[900px] w-[95vw] max-h-[90vh] overflow-y-auto p-6">
        
        <DialogHeader className="mb-2">
          <DialogTitle className="text-xl font-bold">
            {isEditMode ? 'Editar Parcela' : 'Crear Nueva Parcela'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Modifica los datos y visualiza la ubicación de la parcela.'
              : 'Completa la información para registrar la parcela dibujada.'}
          </DialogDescription>
        </DialogHeader>

        {/* LAYOUT GRID: 2 Columnas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
          
          {/* --- ZONA FORMULARIO (Izquierda) --- */}
          <div className="order-2 md:order-1 flex flex-col justify-center">
            <PlotForm
              plot={plot}
              varieties={varieties}
              loading={loading}
              onSubmit={handleSubmit}
            />
          </div>

          {/* --- ZONA MAPA (Derecha) --- */}
          <div className="order-1 md:order-2">
            <div className="h-[300px] md:h-[400px] w-full bg-slate-100 rounded-lg overflow-hidden border border-slate-200 shadow-sm relative">
              {previewData ? (
                mapReady ? (
                  <>
                    <div className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-medium shadow-sm border border-slate-200 text-slate-600 uppercase tracking-wider">
                      Vista Previa
                    </div>
                    <InteractiveMap
                      // Usamos key para forzar re-render si cambia el plot seleccionado
                      key={(plot as any)?.id || 'new-plot'}
                      initialData={previewData}
                      initialViewState={initialViewState}
                      editable={false}
                      showControls={false}
                    />
                  </>
                ) : (
                   // Loader durante la animación del modal
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2 bg-slate-50">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
                    <p className="text-xs text-slate-400">Cargando mapa...</p>
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

export default PlotDialog;