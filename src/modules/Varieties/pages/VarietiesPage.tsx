import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { VarietiesTable } from '../components/VarietiesTable';
import { VarietyDialog } from '../components/VarietyDialog';
import { useVarieties } from '../hooks/useVarieties';
import type { Variety, CreateVarietyDto, UpdateVarietyDto } from '../types/variety';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function VarietiesPage() {
  const {
    varieties,
    loading,
    error,
    createVariety,
    updateVariety,
    deleteVariety,
  } = useVarieties();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedVariety, setSelectedVariety] = useState<Variety | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [varietyToDelete, setVarietyToDelete] = useState<Variety | undefined>();
  
  // Estado de loading para prevenir múltiples clics y mostrar feedback visual
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCreate = () => {
    setSelectedVariety(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (variety: Variety) => {
    setSelectedVariety(variety);
    setDialogOpen(true);
  };

  const handleDelete = (variety: Variety) => {
    setVarietyToDelete(variety);
    setDeleteDialogOpen(true);
  };

  /**
   * Confirmar eliminación permanente de una variedad.
   * ⚠️ OPERACIÓN CRÍTICA E IRREVERSIBLE ⚠️
   * 
   * IMPORTANTE: No existe restore() para variedades, el delete es permanente.
   * Incluye:
   * - Prevención de doble click
   * - Manejo de errores robusto con try-catch
   * - NO cierra dialog en error (permite reintentar o cancelar)
   * - Feedback visual claro durante la operación
   */
  const confirmDelete = async () => {
    if (!varietyToDelete || isDeleting) return;
    
    setIsDeleting(true);
    try {
      await deleteVariety(varietyToDelete.id);
      // Solo cerrar el dialog si la operación fue exitosa
      setDeleteDialogOpen(false);
      setVarietyToDelete(undefined);
      // TODO: Mostrar toast de éxito
    } catch (err) {
      // TODO: Mostrar toast de error con mensaje claro
      // NO cerrar el dialog para que el usuario pueda reintentar o cancelar
      console.error('Error al eliminar variedad:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (data: CreateVarietyDto | UpdateVarietyDto) => {
    if (selectedVariety) {
      await updateVariety(selectedVariety.id, data);
    } else {
      await createVariety(data as CreateVarietyDto);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <p>Cargando variedades...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <p className="text-destructive">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Variedades</h1>
          <p className="text-muted-foreground">
            Gestiona las variedades de cultivos
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Variedad
        </Button>
      </div>

      <VarietiesTable
        varieties={varieties}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <VarietyDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        variety={selectedVariety}
        onSubmit={handleSubmit}
      />

      {/* AlertDialog de confirmación con mejoras de UX */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={(open) => {
        // Prevenir cerrar el dialog mientras está procesando (CRÍTICO)
        if (!isDeleting) {
          setDeleteDialogOpen(open);
          if (!open) setVarietyToDelete(undefined);
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>⚠️ ¿Eliminar permanentemente?</AlertDialogTitle>
            <AlertDialogDescription className="text-destructive">
              Esta acción eliminará permanentemente la variedad "{varietyToDelete?.name}".
              <br />
              <strong>Esta acción NO se puede deshacer.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando permanentemente...
                </>
              ) : (
                'Eliminar Permanentemente'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
