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
import type { Field } from "@/lib/map-types";

interface FieldEditDialogProps {
  field: Field | null;
  onUpdate: (field: Field) => void;
  onClose: () => void;
  onSave: () => void;
  onEditGeometry?: (field: Field) => void;
}

export const FieldEditDialog: React.FC<FieldEditDialogProps> = ({
  field,
  onUpdate,
  onClose,
  onSave,
  onEditGeometry,
}) => (
  <Dialog open={!!field} onOpenChange={(isOpen) => !isOpen && onClose()}>
    <DialogContent className="z-[9999]">
      <DialogHeader>
        <DialogTitle>Editar Campo{field ? `: ${field.boundary.properties.name}` : ""}</DialogTitle>
      </DialogHeader>
      {field && (
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="field-id" className="text-right">
              Identificador
            </Label>
            <Input
              id="field-id"
              value={field.id}
              onChange={(event) =>
                onUpdate({
                  ...field,
                  id: event.target.value,
                  boundary: {
                    ...field.boundary,
                    id: event.target.value,
                  },
                })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="field-name" className="text-right">
              Nombre
            </Label>
            <Input
              id="field-name"
              value={field.boundary.properties.name}
              onChange={(event) =>
                onUpdate({
                  ...field,
                  boundary: {
                    ...field.boundary,
                    properties: {
                      ...field.boundary.properties,
                      name: event.target.value,
                    },
                  },
                })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="field-color" className="text-right">
              Color
            </Label>
            <div className="col-span-3 flex items-center gap-3">
              <Input
                id="field-color"
                type="color"
                value={field.boundary.properties.color ?? "#2563eb"}
                onChange={(event) =>
                  onUpdate({
                    ...field,
                    boundary: {
                      ...field.boundary,
                      properties: {
                        ...field.boundary.properties,
                        color: event.target.value,
                      },
                    },
                  })
                }
                className="h-10 w-16 p-1"
              />
              <span className="text-sm text-muted-foreground">
                {field.boundary.properties.color ?? "--"}
              </span>
            </div>
          </div>
        </div>
      )}
      <DialogFooter>
        <Button
          variant="secondary"
          onClick={() => field && onEditGeometry?.(field)}
          disabled={!field || !onEditGeometry}
        >
          Editar geometría
        </Button>
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button onClick={onSave}>Guardar cambios</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
