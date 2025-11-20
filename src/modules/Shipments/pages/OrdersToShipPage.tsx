import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Package } from 'lucide-react';

// Componentes
import { ShipmentFilters } from '../components/ShipmentFilters';
import { OrderShipmentCard } from '../components/OrderShipmentCard';

// Datos y Tipos
import { MOCK_ORDERS } from '@/lib/mock-picking-data';
import { SalesOrderStatus } from '@/types/sales';

export default function OrdersToShipPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Lógica de filtrado (esto luego vendrá de una API con parámetros)
  const activeOrders = useMemo(() => {
    return MOCK_ORDERS.filter(order => {
      // 1. Filtro de Estado
      const isReady = 
        order.status === SalesOrderStatus.APROBADA || 
        order.status === SalesOrderStatus.DESPACHADA_PARCIAL;
      
      if (!isReady) return false;

      // 2. Filtro de Texto
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const customerName = order.customer?.name.toLowerCase() || '';
        const orderId = order.id?.toLowerCase() || '';
        return customerName.includes(searchLower) || orderId.includes(searchLower);
      }

      return true;
    });
  }, [searchTerm]);

  const handleStartPicking = (orderId: string) => {
    // Navegamos a la Fase 3 (Wizard)
    navigate(`/shipments/picking/${orderId}`);
  };

  return (
    <div className="container mx-auto py-8 max-w-5xl">
      
      <ShipmentFilters 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm} 
      />

      <div className="grid gap-4">
        {activeOrders.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed rounded-lg bg-muted/5">
            <div className="bg-muted/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground">No hay pedidos pendientes</h3>
            <p className="text-muted-foreground mt-1">
              {searchTerm 
                ? 'No se encontraron pedidos con ese criterio de búsqueda.' 
                : 'Todos los pedidos aprobados han sido despachados.'}
            </p>
          </div>
        ) : (
          activeOrders.map((order) => (
            <OrderShipmentCard 
              key={order.id} 
              order={order} 
              onStartPicking={handleStartPicking} 
            />
          ))
        )}
      </div>
    </div>
  );
}