import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import type { Plot } from "@/lib/map-types";
import { useVarieties } from "../hooks/useVarieties";

// Imports para el mapa y utilidades
import InteractiveMap from "@/common/components/InteractiveMap";
import { plotsToFeatureCollection } from "@/common/utils/plot-map-utils";
import { calculateCenter } from "@/common/utils/map-utils";
import { useMemo, useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface PlotEditDialogProps {
  plot: (Plot | any) | null;
  onUpdate: (plot: Plot | any) => void;
  onClose: () => void;
  onSave: () => void;
  isNewPlot?: boolean;
  onEditGeometry?: (plot: Plot | any) => void;
}

export const PlotEditDialog: React.FC<PlotEditDialogProps> = ({
  plot,
  onUpdate,
  onClose,
  onSave,
  isNewPlot = false,
  onEditGeometry,
}) => {
  const { varieties } = useVarieties();
  const [mapReady, setMapReady] = useState(false);

  // 1. Efecto de retraso para el renderizado del mapa (Fix visual)
  useEffect(() => {
    if (!!plot) {
      setMapReady(false);
      const timer = setTimeout(() => {
        setMapReady(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setMapReady(false);
    }
  }, [!!plot]);

  // 2. Preparar datos para la vista previa del mapa
  const previewData = useMemo(() => {
    if (plot) {
      return plotsToFeatureCollection([plot]);
    }
    return null;
  }, [plot]);

  const initialViewState = useMemo(() => 
    previewData ? calculateCenter(previewData) : undefined,
    [previewData]
  );
  
  // Helpers para obtener valores (sin cambios en lógica)
  const getPlotVarietyId = (): string => {
    if (!plot) return '';
    const variety = (plot as any).properties?.variety ?? (plot as any).varietyId ?? (plot as any).variety;
    if (typeof variety === 'object' && variety?.id) return variety.id;
    if (typeof variety === 'string') return variety;
    return '';
  };
  
  const getPlotName = () => {
    if (!plot) return '';
    return (plot as any).properties?.name || (plot as any).name || 'Sin nombre';
  };

  const getPlotValue = (key: string) => {
    if (!plot) return '';
    return (plot as any).properties?.[key] ?? (plot as any)[key] ?? '';
  };

  const updatePlot = (key: string, value: any) => {
    if (!plot) return;
    const updatedPlot = { ...plot, [key]: value };
    onUpdate(updatedPlot);
  };

  return (
    <Dialog open={!!plot} onOpenChange={(isOpen) => !isOpen && onClose()}>
      {/* CAMBIO: Ancho aumentado a 900px y padding */}
      <DialogContent className="sm:max-w-[900px] w-[95vw] max-h-[90vh] overflow-y-auto p-6">
        
        <DialogHeader className="mb-2">
          <DialogTitle className="text-xl font-bold">
            {isNewPlot ? 'Nueva Parcela' : `Editar Parcela: ${getPlotName()}`}
          </DialogTitle>
          <DialogDescription>
            {isNewPlot 
              ? 'Completa la información para registrar la parcela dibujada.'
              : 'Modifica los datos y visualiza la ubicación de la parcela.'}
          </DialogDescription>
        </DialogHeader>

        {/* LAYOUT GRID: 2 Columnas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-2">
          
          {/* --- COLUMNA 1: FORMULARIO --- */}
          <div className="order-2 md:order-1 flex flex-col gap-4">
            {plot && (
              <div className="grid gap-5 py-2">
                
                {/* Nombre */}
                <div className="grid gap-2">
                  <Label htmlFor="plot-name">Nombre</Label>
                  <Input
                    id="plot-name"
                    value={getPlotValue('name')}
                    onChange={(event) => updatePlot('name', event.target.value)}
                  />
                </div>

                {/* Variedad */}
                <div className="grid gap-2">
                  <Label htmlFor="plot-variety">Variedad</Label>
                  <NativeSelect 
                    id="plot-variety"
                    value={getPlotVarietyId()}
                    onChange={(event) => updatePlot('varietyId', event.target.value)}
                  >
                    <option value="">Sin variedad</option>
                    {varieties.map((variety) => (
                      <option key={variety.id} value={variety.id}>
                        {variety.name}
                      </option>
                    ))}
                  </NativeSelect>
                </div>

                {/* Área */}
                <div className="grid gap-2">
                  <Label htmlFor="plot-area">Área (ha)</Label>
                  <Input
                    id="plot-area"
                    type="number"
                    step="0.0001"
                    value={getPlotValue('area') || ''}
                    onChange={(event) => updatePlot('area', parseFloat(event.target.value) || 0)}
                    disabled={isNewPlot}
                  />
                  {isNewPlot && <p className="text-xs text-muted-foreground">Calculada automáticamente</p>}
                </div>

                {/* Color (Read-only visual) */}
                <div className="grid gap-2">
                  <Label>Color</Label>
                  <div className="flex items-center gap-2 p-2 border rounded-md bg-slate-50">
                    <span
                      className="inline-flex h-5 w-5 rounded-full border shadow-sm"
                      style={{ backgroundColor: getPlotValue('color') ?? "#16a34a" }}
                    />
                    <span className="text-sm text-muted-foreground font-mono">
                      {getPlotValue('color') ?? "--"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Footer de botones dentro de la columna del form para móvil, 
                o abajo del todo (DialogFooter lo maneja) */}
          </div>

          {/* --- COLUMNA 2: MAPA --- */}
          <div className="order-1 md:order-2">
             <div className="h-[300px] md:h-[400px] w-full bg-slate-100 rounded-lg overflow-hidden border border-slate-200 shadow-sm relative">
              {previewData ? (
                mapReady ? (
                  <>
                    <div className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-medium shadow-sm border border-slate-200 text-slate-600 uppercase tracking-wider">
                      Vista Previa
                    </div>
                    <InteractiveMap
                      key={(plot as any)?.id || 'edit-plot-map'}
                      initialData={previewData}
                      initialViewState={initialViewState}
                      editable={false}
                      showControls={false}
                    />
                  </>
                ) : (
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

        <DialogFooter className="mt-6 sm:justify-between gap-2">
           <div className="flex gap-2">
            {!isNewPlot && (
                <Button
                  variant="secondary"
                  onClick={() => plot && onEditGeometry?.(plot)}
                  disabled={!plot || !onEditGeometry}
                  type="button"
                >
                  Editar geometría
                </Button>
              )}
           </div>
           <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={onSave}>
                {isNewPlot ? 'Crear Parcela' : 'Guardar Cambios'}
              </Button>
           </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};