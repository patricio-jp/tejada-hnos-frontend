import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, User, Ruler } from "lucide-react";
import type { Field } from "@/lib/map-types";
import { computePolygonAreaHectares } from "@/common/utils/geometry";
import { useUsers } from "../hooks/useUsers";

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
}) => {
  const { users } = useUsers();
  
  const manager = field?.managerId 
    ? users.find(u => u.id === field.managerId)
    : null;

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="z-[9999]">
        {field && (
          <div className="p-4">
            <SheetHeader className="mb-6 text-left">
              <SheetTitle className="text-2xl">{field.boundary.properties.name}</SheetTitle>
              <SheetDescription>
                Información detallada del campo
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Dirección</p>
                      <p className="text-sm text-muted-foreground">
                        {field.address || 'Sin dirección especificada'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Ruler className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Área</p>
                      <p className="text-sm text-muted-foreground">
                        {computePolygonAreaHectares(field.boundary.geometry.coordinates as number[][][]).toFixed(2)} hectáreas
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Capataz Encargado</p>
                      {manager ? (
                        <Badge variant="secondary" className="mt-1">
                          {manager.name} {manager.lastName}
                        </Badge>
                      ) : (
                        <p className="text-sm text-muted-foreground">Sin asignar</p>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Color</span>
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-flex h-6 w-6 rounded-full border-2 border-border"
                          style={{ backgroundColor: field.boundary.properties.color ?? "#2563eb" }}
                        />
                        <span className="text-xs text-muted-foreground font-mono">
                          {field.boundary.properties.color ?? "#2563eb"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Parcelas</span>
                      <Badge variant="outline">{field.plots.length}</Badge>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">ID</span>
                      <span className="text-xs text-muted-foreground font-mono">{field.id}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-2 pt-4">
                <Button onClick={() => onEdit(field)} className="w-full">
                  Editar datos
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => onEditGeometry?.(field)}
                  disabled={!onEditGeometry}
                  className="w-full"
                >
                  Editar geometría
                </Button>
                {onManagePlots && (
                  <Button variant="outline" onClick={() => onManagePlots(field)} className="w-full">
                    Gestionar parcelas
                  </Button>
                )}
                <Button variant="destructive" onClick={() => onDelete(field)} className="w-full">
                  Eliminar campo
                </Button>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
