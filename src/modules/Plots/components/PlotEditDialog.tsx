import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import type { Plot } from "@/lib/map-types";
import { useVarieties } from "../hooks/useVarieties";

interface PlotEditDialogProps {
  plot: (Plot | any) | null;
  onUpdate: (plot: Plot | any) => void;
  onClose: () => void;
  onSave: () => void;
  isNewPlot?: boolean; // Indicar si es un nuevo plot siendo creado
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
  
  // Obtener el varietyId actual del plot
  const getPlotVarietyId = (): string => {
    if (!plot) return '';
    const variety = (plot as any).properties?.variety ?? (plot as any).varietyId ?? (plot as any).variety;
    // Si es un objeto con id, retornar el id
    if (typeof variety === 'object' && variety?.id) {
      return variety.id;
    }
    // Si es un string (UUID), retornarlo tal cual
    if (typeof variety === 'string') {
      return variety;
    }
    return '';
  };
  
  // Manejar ambas estructuras de plot (map-types y backend)
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
    
    console.log(`Actualizando plot field: ${key} = ${value}`);
    console.log('Plot antes de update:', plot);
    
    const updatedPlot = { ...plot, [key]: value };
    console.log('Plot después de update:', updatedPlot);
    
    onUpdate(updatedPlot);
  };

  return (
    <Dialog open={!!plot} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="z-[9999]">
        <DialogHeader>
          <DialogTitle>
            {isNewPlot ? 'Nueva Parcela' : `Editar Parcela: ${getPlotName()}`}
          </DialogTitle>
        </DialogHeader>
        {plot && (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="plot-name" className="text-right">
                Nombre
              </Label>
              <Input
                id="plot-name"
                value={getPlotValue('name')}
                onChange={(event) => updatePlot('name', event.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="plot-variety" className="text-right">
                Variedad
              </Label>
              <NativeSelect 
                id="plot-variety"
                value={getPlotVarietyId()}
                onChange={(event) => updatePlot('varietyId', event.target.value)}
                className="col-span-3"
              >
                <option value="">Sin variedad</option>
                {varieties.map((variety) => (
                  <option key={variety.id} value={variety.id}>
                    {variety.name}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Color</Label>
              <div className="col-span-3 flex items-center gap-2">
                <span
                  className="inline-flex h-4 w-4 rounded-full border"
                  style={{ backgroundColor: getPlotValue('color') ?? "#16a34a" }}
                />
                <span className="text-sm text-muted-foreground">
                  {getPlotValue('color') ?? "--"}
                </span>
              </div>
            </div>
          </div>
        )}
        <DialogFooter>
          {!isNewPlot && (
            <Button
              variant="secondary"
              onClick={() => plot && onEditGeometry?.(plot)}
              disabled={!plot || !onEditGeometry}
            >
              Editar geometría
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={onSave}>
            {isNewPlot ? 'Crear Parcela' : 'Guardar Cambios'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
