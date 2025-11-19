import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Loader2, Plus, Map as MapIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// --- IMPORTS CORREGIDOS ---
// Asegúrate de que estos archivos existen en estas rutas relativas:

// 1. Hooks (están en la carpeta ../hooks relative a 'pages')
import { useFields } from '../hooks/useFields';
import { useCapataces } from '../hooks/useUsers'; 

// 2. Componentes (están en la carpeta ../components relative a 'pages')
import { FieldsTable } from '../components/FieldsTable';
import { FieldFilters, type FieldFiltersState } from '../components/FieldFilters';

export default function FieldsListPage() {
  const navigate = useNavigate();
  
  // Estado local para los filtros
  const [filters, setFilters] = useState<FieldFiltersState>({});
  
  // Hooks de datos
  const { 
    fields, 
    loading, 
    error, 
    updateFilters, 
    deleteField, 
    restoreField, 
    hardDeleteField,
    fetchFields 
  } = useFields();
  
  // Hook de capataces
  const { capataces, loading: loadingCapataces } = useCapataces();

  // Estado para diálogos de confirmación
  const [deletingField, setDeletingField] = useState<any>(null);
  const [hardDeletingField, setHardDeletingField] = useState<any>(null);

  // Sincronizar filtros con el hook
  useEffect(() => {
    updateFilters(filters as any);
  }, [filters, updateFilters]);

  // --- Handlers ---

  const handleEdit = (field: any) => {
    navigate(`/fields?select=${field.id}`);
  };

  const handleSoftDelete = async () => {
    if (!deletingField) return;
    try {
      await deleteField(deletingField.id);
      toast.success("Campo movido a la papelera");
      setDeletingField(null);
    } catch (err) {
      toast.error("Error al eliminar campo");
      console.error(err);
    }
  };

  const handleRestore = async (field: any) => {
    try {
      await restoreField(field.id);
      toast.success("Campo restaurado correctamente");
      fetchFields(); 
    } catch (err) {
      toast.error("Error al restaurar campo");
      console.error(err);
    }
  };

  const handleHardDelete = async () => {
    if (!hardDeletingField) return;
    try {
      await hardDeleteField(hardDeletingField.id);
      toast.success("Campo eliminado permanentemente");
      setHardDeletingField(null);
    } catch (err) {
      toast.error("Error al eliminar permanentemente");
      console.error(err);
    }
  };

  // --- Render ---

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <div className="rounded-lg border border-destructive/50 p-4 text-destructive bg-destructive/10">
          <h3 className="font-bold">Error al cargar campos</h3>
          <p>{error}</p>
          <Button onClick={() => fetchFields()} variant="outline" className="mt-4 border-destructive text-destructive hover:bg-destructive/20">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Listado de Campos</h1>
          <p className="text-muted-foreground mt-1">
            Administra los campos, áreas y asignaciones de personal.
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={() => navigate('/fields')} className="flex-1 sm:flex-none">
            <MapIcon className="mr-2 h-4 w-4" />
            Ver Mapa
          </Button>
          <Button onClick={() => navigate('/fields?action=create')} className="flex-1 sm:flex-none">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Campo
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <FieldFilters 
        filters={filters} 
        onFiltersChange={setFilters} 
        capataces={capataces} 
      />

      {/* Tabla */}
      {loading || loadingCapataces ? (
        <div className="flex justify-center py-20">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Cargando datos...</p>
          </div>
        </div>
      ) : (
        <FieldsTable
          fields={fields as any}
          onEdit={handleEdit}
          onDelete={setDeletingField}
          onRestore={handleRestore}
          onHardDelete={setHardDeletingField}
        />
      )}

      {/* --- Diálogos de Confirmación --- */}
      
      {/* Soft Delete Dialog */}
      <AlertDialog open={!!deletingField} onOpenChange={() => setDeletingField(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Mover a la papelera?</AlertDialogTitle>
            <AlertDialogDescription>
              El campo <b>{deletingField?.name}</b> dejará de ser visible en el mapa principal. 
              Podrás restaurarlo más tarde usando el filtro de eliminados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleSoftDelete} className="bg-orange-600 hover:bg-orange-700">
              Mover a Papelera
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Hard Delete Dialog */}
      <AlertDialog open={!!hardDeletingField} onOpenChange={() => setHardDeletingField(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">¿Eliminar permanentemente?</AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de borrar <b>{hardDeletingField?.name}</b> y <u>todas sus parcelas asociadas</u> de la base de datos.
              <br/><br/>
              <span className="font-bold text-red-500">Esta acción NO se puede deshacer.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleHardDelete} className="bg-red-600 hover:bg-red-700">
              Eliminar Definitivamente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}