import { Button } from '@/components/ui/button';
import { useWorkOrders } from '../hooks/useWorkOrders';
import { WorkOrdersTable } from '../components/WorkOrdersTable';

export function WorkOrdersPage() {
  const { workOrders, loading, error, refetch } = useWorkOrders();

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 space-y-4">
        <p className="text-destructive font-medium">Ocurrió un error: {error}</p>
        <Button onClick={() => void refetch()} variant="outline">
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Órdenes de Trabajo</h1>
          <p className="text-muted-foreground">Visualiza y administra las órdenes activas.</p>
        </div>
        <Button>Nueva OT</Button>
      </div>

      <div className="rounded-md border bg-card p-4">
        <WorkOrdersTable workOrders={workOrders} />
      </div>
    </div>
  );
}

export default WorkOrdersPage;
