import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, PackageCheck, Warehouse, AlertTriangle } from "lucide-react";
import type { SalesOrderDetail } from "@/types/sales";
import { MOCK_INVENTORY } from "@/lib/mock-picking-data";

interface PickingStep2Props {
  selectedLines: SalesOrderDetail[];
  assignments: Record<string, Record<string, number>>;
  onAssign: (lineId: string, lotId: string, qty: number) => void;
}

export function PickingStep2({ selectedLines, assignments, onAssign }: PickingStep2Props) {
  
  const getAssignedTotal = (lineId: string) => {
    const lineAssignments = assignments[lineId] || {};
    return Object.values(lineAssignments).reduce((a, b) => a + b, 0);
  };

  return (
    <div className="space-y-8">
      <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-100 dark:border-blue-900">
        <h3 className="font-medium text-blue-900 dark:text-blue-200">Paso 2: Asignación de Lotes</h3>
        <p className="text-sm text-blue-700 dark:text-blue-400">
          Indica qué cantidad tomarás de cada lote disponible. 
          <span className="font-bold ml-1">No puedes superar el stock disponible ni la cantidad solicitada.</span>
        </p>
      </div>

      {selectedLines.map(line => {
        const pending = line.quantityKg - (line.quantityShipped || 0);
        const assigned = getAssignedTotal(line.id!);
        
        // Validaciones
        const isOverAllocated = assigned > pending; // ¿Se pasó del pedido?
        const isComplete = assigned === pending;
        const isPartial = assigned > 0 && assigned < pending;

        // Calcular porcentaje para la barra (con tope visual en 100%)
        const progress = Math.min((assigned / pending) * 100, 100);

        // Color de la barra y texto
        let statusColorClass = "text-blue-600";
        let progressBarClass = "bg-blue-600";
        
        if (isComplete) {
          statusColorClass = "text-green-600";
          progressBarClass = "bg-green-600";
        } else if (isOverAllocated) {
          statusColorClass = "text-red-600";
          progressBarClass = "bg-red-600";
        }

        const availableLots = MOCK_INVENTORY.filter(lot => 
          lot.variety.name.toLowerCase() === line.variety.toLowerCase() && 
          lot.remainingNetWeightKg > 0
        );

        return (
          <div key={line.id} className={`border rounded-lg p-5 bg-card shadow-sm ${isOverAllocated ? 'border-red-200 dark:border-red-900' : ''}`}>
            
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
                <div className={`text-2xl font-bold ${statusColorClass}`}>
                  {assigned} <span className="text-sm font-normal text-muted-foreground">/ {pending} kg</span>
                </div>
                {isOverAllocated && (
                  <div className="text-xs text-red-600 font-medium">
                    ¡Excede lo solicitado por {assigned - pending} kg!
                  </div>
                )}
              </div>
            </div>

            <Progress value={progress} className="h-2 mb-6" indicatorClassName={progressBarClass} />

            {/* Tabla de Lotes */}
            {availableLots.length === 0 ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>No hay stock disponible de {line.variety}.</AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-3">
                {availableLots.map(lot => {
                  const currentVal = assignments[line.id!]?.[lot.id] || '';
                  const numericVal = typeof currentVal === 'number' ? currentVal : 0;
                  
                  // Validación: ¿Supera el stock del lote?
                  const exceedsStock = numericVal > lot.remainingNetWeightKg;

                  return (
                    <div key={lot.id} className={`flex items-center gap-4 p-3 rounded-md border transition-colors ${exceedsStock ? 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800' : 'bg-muted/30'}`}>
                      <Warehouse className={`h-8 w-8 ${exceedsStock ? 'text-red-400' : 'text-muted-foreground opacity-50'}`} />
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold">{lot.code}</span>
                          {lot.location && <Badge variant="outline" className="text-xs">{lot.location}</Badge>}
                        </div>
                        <div className="text-xs mt-1">
                          Stock: <span className={`font-medium ${exceedsStock ? 'text-red-600 font-bold' : ''}`}>{lot.remainingNetWeightKg} kg</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] text-muted-foreground uppercase">A despachar</span>
                        <div className="w-32">
                          <Input 
                            type="number"
                            placeholder="0"
                            min={0}
                            value={currentVal}
                            onChange={(e) => onAssign(line.id!, lot.id, parseFloat(e.target.value) || 0)}
                            className={`text-right font-bold ${
                              exceedsStock 
                                ? "border-red-500 focus-visible:ring-red-500 text-red-600 bg-white" 
                                : currentVal ? "border-green-500 bg-white" : ""
                            }`}
                          />
                        </div>
                        {exceedsStock && (
                           <span className="text-[10px] text-red-600 font-bold">¡Stock insuficiente!</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Footer de estado */}
            {isComplete && (
              <div className="mt-4 p-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-sm rounded flex items-center justify-center gap-2 font-medium">
                <PackageCheck className="h-4 w-4" />
                Cantidad completada correctamente
              </div>
            )}

            {isOverAllocated && (
               <div className="mt-4 p-2 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 text-sm rounded flex items-center justify-center gap-2 font-medium">
               <AlertTriangle className="h-4 w-4" />
               Error: La cantidad asignada supera lo solicitado
             </div>
            )}
          </div>
        );
      })}
    </div>
  );
}