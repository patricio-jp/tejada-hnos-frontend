import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
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
import useAuth from '@/modules/Auth/hooks/useAuth';
import { SalesOrdersTable } from '../components/SalesOrdersTable';
import { salesOrderApi, type SalesOrder } from '../utils/sales-order-api';

export function SalesOrdersPage() {
  const navigate = useNavigate();
  const auth = useAuth();

  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    if (!auth.accessToken) {
      setLoading(false);
      setError('No se encontró un token de autenticación.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await salesOrderApi.getAll(auth.accessToken);
      const sorted = [...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(sorted);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudieron cargar las órdenes de venta.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [auth.accessToken]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const handleDelete = useCallback((id: string) => {
    setOrderToDelete(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!orderToDelete) return;
    if (!auth.accessToken) {
      toast.error('No se encontró un token de autenticación.');
      setOrderToDelete(null);
      return;
    }

    try {
      await salesOrderApi.remove(orderToDelete, auth.accessToken);
      toast.success('Orden eliminada correctamente');
      await loadOrders();
    } catch (_error) {
      toast.error('Error al eliminar la orden');
    } finally {
      setOrderToDelete(null);
    }
  }, [auth.accessToken, loadOrders, orderToDelete]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Órdenes de Venta</h1>
          <p className="text-muted-foreground">
            Visualiza, crea y administra las órdenes de venta registradas por el equipo comercial.
          </p>
        </div>
        <Button onClick={() => navigate('/sales-orders/new')}>Nueva Venta</Button>
      </div>

      <div className="rounded-md border bg-card p-4">
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Cargando órdenes de venta...
          </div>
        ) : error ? (
          <div className="space-y-3">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" onClick={() => navigate(0)}>
              Reintentar
            </Button>
          </div>
        ) : (
          <SalesOrdersTable orders={orders} onDelete={handleDelete} />
        )}
      </div>

      <AlertDialog open={!!orderToDelete} onOpenChange={() => setOrderToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la orden de venta seleccionada. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default SalesOrdersPage;