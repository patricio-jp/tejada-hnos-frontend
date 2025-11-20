import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, PackageCheck } from "lucide-react";
import type { SalesOrderDetail } from "@/types/sales";
import type { InventoryLot } from "@/types/picking"; // Importa tu interfaz de inventario
import { MOCK_INVENTORY } from "@/lib/mock-picking-data"; // Usamos el mock

interface PickingStep2Props {
  selectedLines: SalesOrderDetail[];
  assignments: Record<string, Record<string, number>>; // { lineId: { lotId: qty } }
  onAssign: (lineId: string, lotId: string, qty: number) => void;
}

export function PickingStep2({ selectedLines, assignments, onAssign }: PickingStep2Props) {
  
  // Helper para calcular cuánto ya asignamos a una línea
  const getAssignedTotal = (lineId: string) => {
    const lineAssignments = assignments[lineId] || {};
    return Object.values(lineAssignments).reduce((a, b) => a + b, 0);
  };

  return (
    <div className="space-y-8">
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
        <h3 className="font-medium text-blue-900">Paso 2: Asignación de Lotes</h3>
        <p className="text-sm text-blue-700">
          Indica qué cantidad tomarás de cada lote disponible para completar el pedido.
        </p>
      </div>

      {selectedLines.map(line => {
        const pending = line.quantityKg - (line.quantityShipped || 0);
        const assigned = getAssignedTotal(line.id!);
        const progress = Math.min((assigned / pending) * 100, 100);
        const isComplete = assigned >= pending;

        // Filtrar inventario compatible (Misma variedad)
        // En un sistema real, filtrarías también por calibre si lo tuvieras en el lote
        const availableLots = MOCK_INVENTORY.filter(lot => 
          lot.variety.name.toLowerCase() === line.variety.toLowerCase() && 
          lot.remainingNetWeightKg > 0
        );

        return (
          <div key={line.id} className="border rounded-lg p-5 bg-card">
            {/* Header de la Línea */}
            <div className="flex justify-between items-end mb-4">
              <div>
                <h4 className="font-bold text-lg flex items-center gap-2">
                  {line.variety} <span className="text-muted-foreground font-normal text-sm">({line.caliber})</span>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Necesitas: <span className="font-medium text-foreground">{pending} kg</span>
                </p>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${isComplete ? 'text-green-600' : 'text-blue-600'}`}>
                  {assigned} <span className="text-sm font-normal text-muted-foreground">/ {pending} kg</span>
                </div>
              </div>
            </div>

            {/* Barra de progreso */}
            <Progress value={progress} className="h-2 mb-6" />

            {/* Tabla de Lotes Disponibles */}
            {availableLots.length === 0 ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>No hay stock disponible de {line.variety}.</AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-2">
                {availableLots.map(lot => {
                  const currentVal = assignments[line.id!]?.[lot.id] || '';
                  
                  return (
                    <div key={lot.id} className="flex items-center gap-4 p-3 bg-muted/30 rounded-md border">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold">{lot.code}</span>
                          <Badge variant="outline">{lot.location}</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Stock: {lot.remainingNetWeightKg} kg
                        </div>
                      </div>

                      <div className="w-32">
                        <Input 
                          type="number"
                          placeholder="0"
                          min={0}
                          max={Math.min(lot.remainingNetWeightKg, pending)} // Validación visual simple
                          value={currentVal}
                          onChange={(e) => onAssign(line.id!, lot.id, parseFloat(e.target.value) || 0)}
                          className={
                            currentVal 
                              ? currentVal > lot.remainingNetWeightKg
                                ? "border-red-500 bg-red-50 font-bold text-red-700"
                                : "border-green-500 bg-green-50 font-bold"
                              : ""
                          }
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {isComplete && (
              <div className="mt-4 p-2 bg-green-100 text-green-800 text-sm rounded flex items-center justify-center gap-2 font-medium">
                <PackageCheck className="h-4 w-4" />
                Cantidad completada
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}