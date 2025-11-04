import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
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

  const confirmDelete = async () => {
    if (varietyToDelete) {
      await deleteVariety(varietyToDelete.id);
      setDeleteDialogOpen(false);
      setVarietyToDelete(undefined);
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la variedad "{varietyToDelete?.name}".
              Esta acción NO se puede revertir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Eliminar Permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
