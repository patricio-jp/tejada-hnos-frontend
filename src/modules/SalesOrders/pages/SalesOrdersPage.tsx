import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import useAuth from '@/modules/Auth/hooks/useAuth';
import { SalesOrdersTable } from '../components/SalesOrdersTable';
import { salesOrderApi, type SalesOrder } from '../utils/sales-order-api';

export function SalesOrdersPage() {
  const navigate = useNavigate();
  const auth = useAuth();

  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadOrders() {
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
        if (!cancelled) {
          setOrders(sorted);
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'No se pudieron cargar las órdenes de venta.';
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadOrders();

    return () => {
      cancelled = true;
    };
  }, [auth.accessToken]);

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
          <SalesOrdersTable orders={orders} />
        )}
      </div>
    </div>
  );
}

export default SalesOrdersPage;
