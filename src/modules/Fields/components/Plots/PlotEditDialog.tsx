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
import type { Plot } from "@/lib/map-types";

interface PlotEditDialogProps {
  plot: Plot | null;
  onUpdate: (plot: Plot) => void;
  onClose: () => void;
  onSave: () => void;
  onEditGeometry?: (plot: Plot) => void;
}

export const PlotEditDialog: React.FC<PlotEditDialogProps> = ({
  plot,
  onUpdate,
  onClose,
  onSave,
  onEditGeometry,
}) => (
  <Dialog open={!!plot} onOpenChange={(isOpen) => !isOpen && onClose()}>
    <DialogContent className="z-[9999]">
      <DialogHeader>
        <DialogTitle>Editar Parcela: {plot?.properties.name}</DialogTitle>
      </DialogHeader>
      {plot && (
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="plot-name" className="text-right">
              Nombre
            </Label>
            <Input
              id="plot-name"
              value={plot.properties.name}
              onChange={(event) =>
                onUpdate({
                  ...plot,
                  properties: {
                    ...plot.properties,
                    name: event.target.value,
                  },
                })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="plot-variety" className="text-right">
              Variedad
            </Label>
            <Input
              id="plot-variety"
              value={plot.properties.variety}
              onChange={(event) =>
                onUpdate({
                  ...plot,
                  properties: {
                    ...plot.properties,
                    variety: event.target.value,
                  },
                })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Color</Label>
            <div className="col-span-3 flex items-center gap-2">
              <span
                className="inline-flex h-4 w-4 rounded-full border"
                style={{ backgroundColor: plot.properties.color ?? "#16a34a" }}
              />
              <span className="text-sm text-muted-foreground">
                {plot.properties.color ?? "--"}
              </span>
            </div>
          </div>
        </div>
      )}
      <DialogFooter>
        <Button
          variant="secondary"
          onClick={() => plot && onEditGeometry?.(plot)}
          disabled={!plot || !onEditGeometry}
        >
          Editar geometría
        </Button>
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button onClick={onSave}>Guardar Cambios</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
