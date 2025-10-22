import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import type { Field } from "@/lib/map-types";
import { computePolygonAreaHectares } from "@/common/utils/geometry";

interface FieldDetailsSheetProps {
  field: Field | null;
  open: boolean;
  onClose: () => void;
  onEdit: (field: Field) => void;
  onDelete: (field: Field) => void;
  onEditGeometry?: (field: Field) => void;
  onManagePlots?: (field: Field) => void;
}

export const FieldDetailsSheet: React.FC<FieldDetailsSheetProps> = ({
  field,
  open,
  onClose,
  onEdit,
  onDelete,
  onEditGeometry,
  onManagePlots,
}) => (
  <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
    <SheetContent className="z-[9999]">
      {field && (
        <div className="p-4">
          <SheetHeader className="mb-4 text-left">
            <SheetTitle>{field.boundary.properties.name}</SheetTitle>
            <SheetDescription>
              Información del campo seleccionado.
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-3">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>ID</span>
              <span>{field.id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Parcelas</span>
              <span>{field.plots.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Color</span>
              <span className="flex items-center gap-2">
                <span
                  className="inline-flex h-4 w-4 rounded-full border"
                  style={{ backgroundColor: field.boundary.properties.color ?? "#2563eb" }}
                />
                <span className="text-muted-foreground">
                  {field.boundary.properties.color ?? "--"}
                </span>
              </span>
            </div>
            <div className="flex justify-between text-sm font-semibold">
              <span>Área estimada</span>
              <span>
                {computePolygonAreaHectares(field.boundary.geometry.coordinates as number[][][]).toFixed(2)} ha
              </span>
            </div>
          </div>
          <div className="grid gap-2 mt-6">
            <Button onClick={() => onEdit(field)}>Editar datos</Button>
            <Button
              variant="secondary"
              onClick={() => onEditGeometry?.(field)}
              disabled={!onEditGeometry}
            >
              Editar geometría
            </Button>
            {onManagePlots && (
              <Button variant="outline" onClick={() => onManagePlots(field)}>
                Gestionar parcelas
              </Button>
            )}
            <Button variant="destructive" onClick={() => onDelete(field)}>
              Eliminar campo
            </Button>
          </div>
        </div>
      )}
    </SheetContent>
  </Sheet>
);
