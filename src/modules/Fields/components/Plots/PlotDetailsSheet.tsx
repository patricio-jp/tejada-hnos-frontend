import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import type { Plot } from "@/lib/map-types";

interface PlotDetailsSheetProps {
  plot: Plot | null;
  open: boolean;
  onClose: () => void;
  onEdit: (plot: Plot) => void;
  onDelete: (plot: Plot) => void;
}

export const PlotDetailsSheet: React.FC<PlotDetailsSheetProps> = ({
  plot,
  open,
  onClose,
  onEdit,
  onDelete,
}) => (
  <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
    <SheetContent className="z-[9999]">
      {plot && (
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">{plot.properties.name}</h3>
          <div className="grid gap-3">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>ID</span>
              <span>{plot.id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Variedad</span>
              <span>{plot.properties.variety}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold">
              <span>Área</span>
              <span>{plot.properties.area ?? 0} ha</span>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button className="flex-1" onClick={() => onEdit(plot)}>
              Editar
            </Button>
            <Button
              className="flex-1"
              variant="destructive"
              onClick={() => onDelete(plot)}
            >
              Eliminar
            </Button>
          </div>
        </div>
      )}
    </SheetContent>
  </Sheet>
);
