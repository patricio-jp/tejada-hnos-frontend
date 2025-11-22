/**
 * PlotDetailsSheet - Panel lateral con detalles de la parcela
 */

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { MapPin, Leaf, Calendar, Ruler, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { Plot } from '@/types/plots';

interface PlotDetailsSheetProps {
  plot: Plot | null;
  open: boolean;
  onClose: () => void;
  onEdit: (plot: Plot) => void;
  onDelete: (plot: Plot) => void;
  onEditGeometry?: (plot: Plot) => void;
}

export function PlotDetailsSheet({
  plot,
  open,
  onClose,
  onEdit,
  onDelete,
  onEditGeometry,
}: PlotDetailsSheetProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!plot) return null;

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    onDelete(plot);
    setShowDeleteConfirm(false);
    onClose();
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="w-[400px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{plot.name}</SheetTitle>
            <SheetDescription>Detalles de la parcela</SheetDescription>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            {/* Card Principal */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Información</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Área */}
                <div className="flex items-start gap-3">
                  <Ruler className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Área</p>
                    <p className="text-lg font-semibold">{plot.area} m²</p>
                  </div>
                </div>

                {/* Variedad */}
                <div className="flex items-start gap-3">
                  <Leaf className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Variedad</p>
                    {plot.variety ? (
                      <Badge variant="outline">{plot.variety.name}</Badge>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">Sin variedad asignada</p>
                    )}
                  </div>
                </div>

                {/* Fecha de Plantación */}
                {plot.datePlanted && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Fecha de Plantación</p>
                      <p className="text-sm">
                        {new Date(plot.datePlanted).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {/* Ubicación */}
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Ubicación</p>
                    <p className="text-xs text-muted-foreground">
                      Tipo: {plot.location?.type || 'Desconocido'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Acciones */}
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => {
                  onEdit(plot);
                  onClose();
                }}
                className="w-full"
                variant="outline"
              >
                <Edit className="mr-2 h-4 w-4" />
                Editar Detalles
              </Button>
              <Button
                onClick={() => {
                  onEditGeometry?.(plot);
                  onClose(); // Cerrar el sheet cuando se clickea editar geometría
                }}
                className="w-full"
                variant="outline"
              >
                <MapPin className="mr-2 h-4 w-4" />
                Editar Geometría
              </Button>
              <Button
                onClick={handleDelete}
                className="w-full"
                variant="destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Diálogo de confirmación de eliminación */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar parcela?</AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de eliminar la parcela "{plot.name}". Podrás restaurarla posteriormente desde el historial de eliminadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default PlotDetailsSheet;
