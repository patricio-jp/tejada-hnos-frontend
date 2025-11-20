import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowRight, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { SalesOrder } from '@/types/sales';
import { SalesOrderStatus } from '@/types/sales';

interface OrderShipmentCardProps {
  order: SalesOrder;
  onStartPicking: (orderId: string) => void;
}

export function OrderShipmentCard({ order, onStartPicking }: OrderShipmentCardProps) {
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case SalesOrderStatus.APROBADA:
        return <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">Listo para Despachar</Badge>;
      case SalesOrderStatus.DESPACHADA_PARCIAL:
        return <Badge className="bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100">Despacho Parcial</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatOrderId = (id: string) => {
    // Si es UUID largo, mostramos solo los primeros 8 chars para visualización
    return id.length > 8 ? `#${id.slice(0, 8).toUpperCase()}` : `#${id.toUpperCase()}`;
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow border-l-4 border-l-primary">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row items-stretch">
          
          {/* Columna Izquierda: Info Principal */}
          <div className="flex-1 p-6 flex flex-col justify-center gap-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                {formatOrderId(order.id || '')}
              </span>
              {getStatusBadge(order.status)}
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-foreground">
                {order.customer?.name || 'Cliente Desconocido'}
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Truck className="h-3 w-3" />
                <span>
                  Fecha Pedido: {order.createdAt ? format(new Date(order.createdAt), 'dd MMM yyyy', { locale: es }) : '-'}
                </span>
              </div>
            </div>
          </div>

          {/* Columna Central: Resumen de Items */}
          <div className="flex-1 p-6 border-t md:border-t-0 md:border-l bg-muted/10 flex flex-col justify-center">
            <div className="text-sm font-medium mb-3 text-muted-foreground uppercase tracking-wide text-xs">
              Pendiente de preparación:
            </div>
            <ul className="space-y-2">
              {order.details.map((line) => {
                const pending = line.quantityKg - (line.quantityShipped || 0);
                if (pending <= 0) return null; // Ya completado
                return (
                  <li key={line.id} className="flex justify-between text-sm border-b border-dashed border-gray-200 pb-1 last:border-0">
                    <span className="text-gray-700">
                      {line.variety} <span className="text-xs text-muted-foreground">({line.caliber})</span>
                    </span>
                    <span className="font-mono font-semibold">{pending} kg</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Columna Derecha: Acción */}
          <div className="p-4 flex items-center justify-center bg-muted/5 md:w-48 border-t md:border-t-0 md:border-l">
            <Button 
              size="lg" 
              className="w-full shadow-sm gap-2"
              onClick={() => order.id && onStartPicking(order.id)}
            >
              Iniciar Picking
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}