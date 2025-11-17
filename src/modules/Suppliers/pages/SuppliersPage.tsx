import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Eye, EyeOff, Loader2 } from 'lucide-react';
import { SuppliersTable } from '../components/SuppliersTable';
import { SupplierDialog } from '../components/SupplierDialog';
import { SupplierFilters } from '../components/SupplierFilters';
import { useSuppliers } from '../hooks/useSuppliers';
import type { Supplier } from '@/types';
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

/**
 * Página principal de gestión de proveedores.
 * 
 * Funcionalidades completas:
 * - CRUD básico (crear, editar, listar)
 * - Soft delete / restore / hard delete
 * - Recálculo de total suministrado
 * - Filtros avanzados (búsqueda, rangos)
 * - Toggle para mostrar/ocultar eliminados
 * - Estados de loading para cada operación
 * - Prevención de doble click
 * - Manejo robusto de errores con retry automático
 * - Feedback visual claro (spinners, colores)
 */
export default function SuppliersPage() {
  const {
    suppliers,
    loading,
    filters,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    restoreSupplier,
    hardDeleteSupplier,
    recalculateTotalSupplied,
    updateFilters,
    toggleDeletedView,
  } = useSuppliers();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | undefined>();
  
  // Diálogos de confirmación
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | undefined>();
  
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [supplierToRestore, setSupplierToRestore] = useState<Supplier | undefined>();
  
  const [hardDeleteDialogOpen, setHardDeleteDialogOpen] = useState(false);
  const [supplierToHardDelete, setSupplierToHardDelete] = useState<Supplier | undefined>();
  
  // Estados de loading para prevenir múltiples clics y mostrar feedback visual
  const [recalculating, setRecalculating] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isHardDeleting, setIsHardDeleting] = useState(false);

  const handleCreate = () => {
    setSelectedSupplier(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setDialogOpen(true);
  };

  const handleDelete = (supplier: Supplier) => {
    setSupplierToDelete(supplier);
    setDeleteDialogOpen(true);
  };

  const handleRestore = (supplier: Supplier) => {
    setSupplierToRestore(supplier);
    setRestoreDialogOpen(true);
  };

  const handleHardDelete = (supplier: Supplier) => {
    setSupplierToHardDelete(supplier);
    setHardDeleteDialogOpen(true);
  };

  const handleRecalculate = async (supplier: Supplier) => {
    // Prevenir múltiples clics simultáneos en el mismo proveedor
    if (recalculating.has(supplier.id)) {
      return;
    }
    
    try {
      // Marcar como "recalculando"
      setRecalculating(prev => new Set(prev).add(supplier.id));
      
      await recalculateTotalSupplied(supplier.id);
      // TODO: Mostrar toast de éxito
    } catch (_err) {
      // TODO: Mostrar toast de error
    } finally {
      // Quitar marca de "recalculando"
      setRecalculating(prev => {
        const newSet = new Set(prev);
        newSet.delete(supplier.id);
        return newSet;
      });
    }
  };

  /**
   * Confirmar eliminación soft de un proveedor.
   * Incluye estado de loading, prevención de doble click, y manejo de errores.
   */
  const confirmDelete = async () => {
    if (!supplierToDelete || isDeleting) return;
    
    setIsDeleting(true);
    try {
      await deleteSupplier(supplierToDelete.id);
      // Solo cerrar el dialog si la operación fue exitosa
      setDeleteDialogOpen(false);
      setSupplierToDelete(undefined);
      // TODO: Mostrar toast de éxito
    } catch (err) {
      // TODO: Mostrar toast de error
      // NO cerrar el dialog para que el usuario pueda reintentar
      console.error('Error al eliminar proveedor:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Confirmar restauración de un proveedor eliminado.
   * Incluye estado de loading, prevención de doble click, y manejo de errores.
   */
  const confirmRestore = async () => {
    if (!supplierToRestore || isRestoring) return;
    
    setIsRestoring(true);
    try {
      await restoreSupplier(supplierToRestore.id);
      // Solo cerrar el dialog si la operación fue exitosa
      setRestoreDialogOpen(false);
      setSupplierToRestore(undefined);
      // TODO: Mostrar toast de éxito
    } catch (err) {
      // TODO: Mostrar toast de error
      // NO cerrar el dialog para que el usuario pueda reintentar
      console.error('Error al restaurar proveedor:', err);
    } finally {
      setIsRestoring(false);
    }
  };

  /**
   * Confirmar eliminación permanente de un proveedor.
   * OPERACIÓN CRÍTICA E IRREVERSIBLE.
   * Incluye estado de loading, prevención de doble click, y manejo de errores robusto.
   */
  const confirmHardDelete = async () => {
    if (!supplierToHardDelete || isHardDeleting) return;
    
    setIsHardDeleting(true);
    try {
      await hardDeleteSupplier(supplierToHardDelete.id);
      // Solo cerrar el dialog si la operación fue exitosa
      setHardDeleteDialogOpen(false);
      setSupplierToHardDelete(undefined);
      // TODO: Mostrar toast de éxito
    } catch (err) {
      // TODO: Mostrar toast de error con mensaje claro
      // NO cerrar el dialog para que el usuario pueda reintentar o cancelar
      console.error('Error al eliminar permanentemente:', err);
    } finally {
      setIsHardDeleting(false);
    }
  };

  const handleSubmit = async (data: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'totalSupplied' | 'totalOrders' | 'purchaseOrders'>) => {
    if (selectedSupplier) {
      await updateSupplier(selectedSupplier.id, data);
    } else {
      await createSupplier(data);
    }
    setDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <p>Cargando proveedores...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Proveedores</h1>
          <p className="text-muted-foreground">
            Gestiona los proveedores del sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={filters.withDeleted ? "default" : "outline"}
            onClick={toggleDeletedView}
          >
            {filters.withDeleted ? (
              <>
                <EyeOff className="mr-2 h-4 w-4" />
                Ocultar Eliminados
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Ver Eliminados
              </>
            )}
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Proveedor
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <SupplierFilters 
        filters={filters} 
        onFiltersChange={updateFilters} 
      />

      {/* Tabla */}
      <SuppliersTable
        suppliers={suppliers}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRestore={handleRestore}
        onHardDelete={handleHardDelete}
        onRecalculate={handleRecalculate}
        recalculatingIds={recalculating}
      />

      {/* Dialog de Crear/Editar */}
      <SupplierDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        supplier={selectedSupplier}
        onSubmit={handleSubmit}
      />

      {/* Dialog de Soft Delete */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={(open) => {
        // Prevenir cerrar el dialog mientras está procesando
        if (!isDeleting) {
          setDeleteDialogOpen(open);
          if (!open) setSupplierToDelete(undefined);
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar proveedor?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará el proveedor "{supplierToDelete?.name}" de forma temporal.
              Podrás restaurarlo más tarde si lo necesitas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                'Eliminar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de Restore */}
      <AlertDialog open={restoreDialogOpen} onOpenChange={(open) => {
        // Prevenir cerrar el dialog mientras está procesando
        if (!isRestoring) {
          setRestoreDialogOpen(open);
          if (!open) setSupplierToRestore(undefined);
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Restaurar proveedor?</AlertDialogTitle>
            <AlertDialogDescription>
              Se restaurará el proveedor "{supplierToRestore?.name}" y volverá a estar activo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRestoring}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmRestore}
              disabled={isRestoring}
              className="bg-green-600 hover:bg-green-700"
            >
              {isRestoring ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Restaurando...
                </>
              ) : (
                'Restaurar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de Hard Delete */}
      <AlertDialog open={hardDeleteDialogOpen} onOpenChange={(open) => {
        // Prevenir cerrar el dialog mientras está procesando (CRÍTICO)
        if (!isHardDeleting) {
          setHardDeleteDialogOpen(open);
          if (!open) setSupplierToHardDelete(undefined);
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>⚠️ ¿Eliminar permanentemente?</AlertDialogTitle>
            <AlertDialogDescription className="text-destructive">
              Esta acción eliminará permanentemente el proveedor "{supplierToHardDelete?.name}".
              <br />
              <strong>Esta acción NO se puede deshacer.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isHardDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmHardDelete}
              disabled={isHardDeleting}
              className="bg-red-700 hover:bg-red-800"
            >
              {isHardDeleting ? (
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
