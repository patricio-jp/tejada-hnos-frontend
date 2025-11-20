import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SalesOrder, SalesOrderDetail } from "@/types/sales";

interface PickingStep1Props {
  order: SalesOrder;
  selectedLineIds: string[];
  onToggleLine: (lineId: string) => void;
}

export function PickingStep1({ order, selectedLineIds, onToggleLine }: PickingStep1Props) {
  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
        <h3 className="font-medium text-blue-900">Paso 1: Selección de ítems</h3>
        <p className="text-sm text-blue-700">
          Selecciona las líneas del pedido que deseas despachar en este envío.
        </p>
      </div>

      {order.details.map((line) => {
        const pending = line.quantityKg - (line.quantityShipped || 0);
        const isCompleted = pending <= 0;
        const isSelected = selectedLineIds.includes(line.id!);

        if (isCompleted) return null; // Ocultar completados o mostrar deshabilitados

        return (
          <Card 
            key={line.id} 
            className={`transition-all cursor-pointer border-l-4 ${isSelected ? 'border-l-primary ring-1 ring-primary' : 'border-l-transparent hover:border-l-gray-300'}`}
            onClick={() => onToggleLine(line.id!)}
          >
            <CardContent className="p-4 flex items-center gap-4">
              <Checkbox 
                checked={isSelected}
                onCheckedChange={() => onToggleLine(line.id!)}
              />
              
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-lg">{line.variety}</h4>
                    <p className="text-sm text-muted-foreground">Calibre: {line.caliber}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-xl font-semibold">{pending} kg</div>
                    <div className="text-xs text-muted-foreground">Pendiente de envío</div>
                  </div>
                </div>
                
                <div className="mt-2 flex gap-2">
                  <Badge variant="secondary">Pedido: {line.quantityKg} kg</Badge>
                  {line.quantityShipped ? (
                    <Badge variant="outline" className="text-orange-600 border-orange-200">
                      Ya enviado: {line.quantityShipped} kg
                    </Badge>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}