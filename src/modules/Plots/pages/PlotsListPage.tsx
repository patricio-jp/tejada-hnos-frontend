import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Loader2, Map as MapIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { useFields } from '@/modules/Fields/hooks/useFields';
import { usePlots } from '../hooks/usePlots'; 

import { useVarieties } from '../hooks/useVarieties';
import { PlotsTable } from '../components/PlotsTable';
import { PlotFilters, type PlotFiltersState } from '../components/PlotFilters';
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

export default function PlotsListPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<PlotFiltersState>({});
  
  // 1. Obtenemos los campos (ya lo estábamos haciendo)
  const { fields, loading: loadingFields, fetchFields } = useFields();
  
  // 2. Hook para obtener parcelas globales
  const { 
    plots, 
    loading, 
    error, 
    fetchAllPlots, 
    softDeletePlot, 
    restorePlot, 
    deletePlot 
  } = usePlots(); 
  
  const { varieties, loading: loadingVarieties } = useVarieties();

  const [deletingPlot, setDeletingPlot] = useState<any>(null);
  const [hardDeletingPlot, setHardDeletingPlot] = useState<any>(null);

  // 3. Recargar datos cuando cambian los filtros (incluido fieldId)
  useEffect(() => {
    fetchAllPlots({
      ...filters,
      withDeleted: filters.withDeleted
    });
  }, [fetchAllPlots, filters]);

  // Handlers (Sin cambios)
  const handleEdit = (plot: any) => {
    navigate(`/fields/${plot.fieldId}?selectPlot=${plot.id}`);
  };

  const handleSoftDelete = async () => {
    if (!deletingPlot) return;
    try {
      await softDeletePlot(deletingPlot.id);
      toast.success("Parcela movida a la papelera");
      setDeletingPlot(null);
      fetchAllPlots({ ...filters, withDeleted: filters.withDeleted }); 
    } catch (err) {
      toast.error("Error al eliminar parcela");
    }
  };

  const handleRestore = async (plot: any) => {
    try {
      await restorePlot(plot.id);
      toast.success("Parcela restaurada");
      fetchAllPlots({ ...filters, withDeleted: filters.withDeleted });
    } catch (err) {
      toast.error("Error al restaurar");
    }
  };

  const handleHardDelete = async () => {
    if (!hardDeletingPlot) return;
    try {
      await deletePlot(hardDeletingPlot.id);
      toast.success("Parcela eliminada permanentemente");
      setHardDeletingPlot(null);
      fetchAllPlots({ ...filters, withDeleted: filters.withDeleted });
    } catch (err) {
      toast.error("Error al eliminar");
    }
  };

  // 4. Parche de Variedad en el frontend (Importante mantenerlo)
  // Como fetchAllPlots trae datos del backend, si el backend no trae variedad populada, 
  // la cruzamos aquí.
  const enrichedPlots = useMemo(() => {
    return plots.map(plot => {
       // Si viene del backend sin variedad completa, buscarla
       const resolvedVariety = plot.variety || varieties.find(v => v.id === plot.varietyId);
       return {
         ...plot,
         variety: resolvedVariety,
         // Asegurar que tenga el objeto
       };
    });
  }, [plots, varieties]);


  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Listado de Parcelas</h1>
          <p className="text-muted-foreground mt-1">
            Inventario global de parcelas y variedades ({plots.length} registros).
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/fields')}>
            <MapIcon className="mr-2 h-4 w-4" />
            Ver Mapa General
          </Button>
        </div>
      </div>

      <PlotFilters 
        filters={filters} 
        onFiltersChange={setFilters} 
        varieties={varieties}
        fields={fields} /* <--- PASAMOS LOS CAMPOS AQUÍ */
      />

      {loading || loadingVarieties || loadingFields ? (
        <div className="flex justify-center py-20">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Cargando inventario...</p>
          </div>
        </div>
      ) : (
        <PlotsTable
          plots={enrichedPlots} /* Usamos la lista enriquecida */
          onEdit={handleEdit}
          onDelete={(p) => setDeletingPlot(p)}
          onRestore={handleRestore}
          onHardDelete={(p) => setHardDeletingPlot(p)}
        />
      )}

      {/* Diálogos de confirmación (Sin cambios) */}
      <AlertDialog open={!!deletingPlot} onOpenChange={() => setDeletingPlot(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Mover a la papelera?</AlertDialogTitle>
            <AlertDialogDescription>
              La parcela dejará de ser visible en el mapa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleSoftDelete} className="bg-orange-600 hover:bg-orange-700">
              Mover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!hardDeletingPlot} onOpenChange={() => setHardDeletingPlot(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">¿Eliminar definitivamente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción borrará la parcela de la base de datos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleHardDelete} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}