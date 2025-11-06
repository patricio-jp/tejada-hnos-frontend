import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Eye, EyeOff, Loader2 } from 'lucide-react';
import { CustomersTable } from '../components/CustomersTable';
import { CustomerDialog } from '../components/CustomerDialog';
import { CustomerFilters } from '../components/CustomerFilters';
import { useCustomers } from '../hooks/useCustomers';
import type { 
  Customer, 
  CreateCustomerDto, 
  UpdateCustomerDto 
} from '../types/customer';
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

export default function CustomersPage() {
  const {
    customers,
    loading,
    error,
    filters,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    restoreCustomer,
    hardDeleteCustomer,
    recalculateTotalSpent,
    updateFilters,
    toggleDeletedView,
  } = useCustomers();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>();
  
  // Diálogos de confirmación
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | undefined>();
  
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [customerToRestore, setCustomerToRestore] = useState<Customer | undefined>();
  
  const [hardDeleteDialogOpen, setHardDeleteDialogOpen] = useState(false);
  const [customerToHardDelete, setCustomerToHardDelete] = useState<Customer | undefined>();
  
  // Estados de loading para prevenir múltiples clics y mostrar feedback visual
  const [recalculating, setRecalculating] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isHardDeleting, setIsHardDeleting] = useState(false);

  const handleCreate = () => {
    setSelectedCustomer(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDialogOpen(true);
  };

  const handleDelete = (customer: Customer) => {
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  };

  const handleRestore = (customer: Customer) => {
    setCustomerToRestore(customer);
    setRestoreDialogOpen(true);
  };

  const handleHardDelete = (customer: Customer) => {
    setCustomerToHardDelete(customer);
    setHardDeleteDialogOpen(true);
  };

  const handleRecalculate = async (customer: Customer) => {
    // Prevenir múltiples clics simultáneos en el mismo cliente
    if (recalculating.has(customer.id)) {
      return;
    }
    
    try {
      // Marcar como "recalculando"
      setRecalculating(prev => new Set(prev).add(customer.id));
      
      await recalculateTotalSpent(customer.id);
      // TODO: Mostrar toast de éxito
    } catch (err) {
      // TODO: Mostrar toast de error
    } finally {
      // Quitar marca de "recalculando"
      setRecalculating(prev => {
        const newSet = new Set(prev);
        newSet.delete(customer.id);
        return newSet;
      });
    }
  };

  /**
   * Confirmar eliminación soft de un cliente.
   * Incluye estado de loading, prevención de doble click, y manejo de errores.
   */
  const confirmDelete = async () => {
    if (!customerToDelete || isDeleting) return;
    
    setIsDeleting(true);
    try {
      await deleteCustomer(customerToDelete.id);
      // Solo cerrar el dialog si la operación fue exitosa
      setDeleteDialogOpen(false);
      setCustomerToDelete(undefined);
      // TODO: Mostrar toast de éxito
    } catch (err) {
      // TODO: Mostrar toast de error
      // NO cerrar el dialog para que el usuario pueda reintentar
      console.error('Error al eliminar cliente:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Confirmar restauración de un cliente eliminado.
   * Incluye estado de loading, prevención de doble click, y manejo de errores.
   */
  const confirmRestore = async () => {
    if (!customerToRestore || isRestoring) return;
    
    setIsRestoring(true);
    try {
      await restoreCustomer(customerToRestore.id);
      // Solo cerrar el dialog si la operación fue exitosa
      setRestoreDialogOpen(false);
      setCustomerToRestore(undefined);
      // TODO: Mostrar toast de éxito
    } catch (err) {
      // TODO: Mostrar toast de error
      // NO cerrar el dialog para que el usuario pueda reintentar
      console.error('Error al restaurar cliente:', err);
    } finally {
      setIsRestoring(false);
    }
  };

  /**
   * Confirmar eliminación permanente de un cliente.
   * OPERACIÓN CRÍTICA E IRREVERSIBLE.
   * Incluye estado de loading, prevención de doble click, y manejo de errores robusto.
   */
  const confirmHardDelete = async () => {
    if (!customerToHardDelete || isHardDeleting) return;
    
    setIsHardDeleting(true);
    try {
      await hardDeleteCustomer(customerToHardDelete.id);
      // Solo cerrar el dialog si la operación fue exitosa
      setHardDeleteDialogOpen(false);
      setCustomerToHardDelete(undefined);
      // TODO: Mostrar toast de éxito
    } catch (err) {
      // TODO: Mostrar toast de error con mensaje claro
      // NO cerrar el dialog para que el usuario pueda reintentar o cancelar
      console.error('Error al eliminar permanentemente:', err);
    } finally {
      setIsHardDeleting(false);
    }
  };

  const handleSubmit = async (data: CreateCustomerDto | UpdateCustomerDto) => {
    if (selectedCustomer) {
      await updateCustomer(selectedCustomer.id, data);
    } else {
      await createCustomer(data as CreateCustomerDto);
    }
    setDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <p>Cargando clientes...</p>
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
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-muted-foreground">
            Gestiona los clientes del sistema
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
            Nuevo Cliente
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <CustomerFilters 
        filters={filters} 
        onFiltersChange={updateFilters} 
      />

      {/* Tabla */}
      <CustomersTable
        customers={customers}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRestore={handleRestore}
        onHardDelete={handleHardDelete}
        onRecalculate={handleRecalculate}
        recalculatingIds={recalculating}
      />

      {/* Dialog de Crear/Editar */}
      <CustomerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        customer={selectedCustomer}
        onSubmit={handleSubmit}
      />

      {/* Dialog de Soft Delete */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={(open) => {
        // Prevenir cerrar el dialog mientras está procesando
        if (!isDeleting) {
          setDeleteDialogOpen(open);
          if (!open) setCustomerToDelete(undefined);
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará el cliente "{customerToDelete?.name}" de forma temporal.
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
          if (!open) setCustomerToRestore(undefined);
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Restaurar cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Se restaurará el cliente "{customerToRestore?.name}" y volverá a estar activo.
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
          if (!open) setCustomerToHardDelete(undefined);
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>⚠️ ¿Eliminar permanentemente?</AlertDialogTitle>
            <AlertDialogDescription className="text-destructive">
              Esta acción eliminará permanentemente el cliente "{customerToHardDelete?.name}".
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
