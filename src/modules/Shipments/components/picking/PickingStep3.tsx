import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SalesOrderDetail } from "@/types/sales";
import { MOCK_INVENTORY } from "@/lib/mock-picking-data";

interface PickingStep3Props {
  selectedLines: SalesOrderDetail[];
  assignments: Record<string, Record<string, number>>;
}

export function PickingStep3({ selectedLines, assignments }: PickingStep3Props) {
  
  // Calcular total general
  let totalWeight = 0;

  return (
    <div className="space-y-6">
      <div className="bg-green-50 p-4 rounded-lg border border-green-100">
        <h3 className="font-medium text-green-900">Paso 3: Confirmación</h3>
        <p className="text-sm text-green-700">
          Revisa los detalles del despacho. Al confirmar, se descontará el stock y se actualizará el pedido.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumen del Envío</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Lote Origen</TableHead>
                <TableHead className="text-right">Cantidad (kg)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedLines.map(line => {
                const lineAssignments = assignments[line.id!] || {};
                const lotIds = Object.keys(lineAssignments);
                
                if (lotIds.length === 0) return null;

                return lotIds.map(lotId => {
                  const qty = lineAssignments[lotId];
                  if (qty <= 0) return null;
                  
                  const lot = MOCK_INVENTORY.find(l => l.id === lotId);
                  totalWeight += qty;

                  return (
                    <TableRow key={`${line.id}-${lotId}`}>
                      <TableCell>
                        <span className="font-medium">{line.variety}</span>
                        <span className="text-xs text-muted-foreground ml-2">({line.caliber})</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono bg-muted px-2 py-1 rounded text-xs">
                          {lot?.code || lotId}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {qty}
                      </TableCell>
                    </TableRow>
                  );
                });
              })}
              
              {/* Total Row */}
              <TableRow className="bg-muted/50 font-bold">
                <TableCell colSpan={2}>Total a Despachar</TableCell>
                <TableCell className="text-right text-lg">{totalWeight} kg</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}