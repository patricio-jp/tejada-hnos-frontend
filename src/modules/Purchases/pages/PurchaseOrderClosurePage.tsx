// src/modules/Purchases/pages/PurchaseOrderClosurePage.tsx

import { useState, useMemo } from "react";
import { usePurchaseOrders } from "../hooks/usePurchaseOrders";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Eye,
  AlertCircle,
  Package,
  Building2,
  DollarSign,
  Lock
} from "lucide-react";
import { PurchaseOrderStatus } from "../types";
import type { PurchaseOrder } from "../types";
import { StatusBadge } from "../components/StatusBadge";
import { PurchaseOrderDetailsSheet } from "../components/PurchaseOrderDetailsSheet";
import { formatCurrency } from "@/lib/currency";

export default function PurchaseOrderClosurePage() {
  const { 
    purchaseOrders, 
    loading, 
    error,
    updatePurchaseOrderStatus,
    fetchPurchaseOrders
  } = usePurchaseOrders();

  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [detailsSheetOpen, setDetailsSheetOpen] = useState(false);
  const [closureDialogOpen, setClosureDialogOpen] = useState(false);

  // Filtrar órdenes que pueden ser cerradas: RECIBIDA o RECIBIDA_PARCIAL
  const ordersToBeClosed = useMemo(() => {
    return purchaseOrders.filter(
      order => 
        order.status === PurchaseOrderStatus.RECIBIDA || 
        order.status === PurchaseOrderStatus.RECIBIDA_PARCIAL
    );
  }, [purchaseOrders]);

  const handleViewDetails = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setDetailsSheetOpen(true);
  };

  const handleOpenClosure = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setClosureDialogOpen(true);
  };

  const handleClose = async () => {
    if (!selectedOrder) return;

    const result = await updatePurchaseOrderStatus(
      selectedOrder.id!,
      PurchaseOrderStatus.CERRADA
    );

    if (result) {
      setClosureDialogOpen(false);
      setSelectedOrder(null);
      fetchPurchaseOrders();
    }
  };

  // Calcular estadísticas de recepción para una orden
  const getReceptionStats = (order: PurchaseOrder) => {
    const totalItems = order.details.length;
    const fullyReceivedItems = order.details.filter(
      detail => Number(detail.quantityReceived) >= Number(detail.quantity)
    ).length;
    const partiallyReceivedItems = order.details.filter(
      detail => Number(detail.quantityReceived) > 0 && Number(detail.quantityReceived) < Number(detail.quantity)
    ).length;

    // Calcular porcentaje basado en cantidades totales, no en items
    const totalQuantityOrdered = order.details.reduce(
      (sum, detail) => sum + Number(detail.quantity), 
      0
    );
    const totalQuantityReceived = order.details.reduce(
      (sum, detail) => sum + Number(detail.quantityReceived || 0), 
      0
    );

    return {
      totalItems,
      fullyReceivedItems,
      partiallyReceivedItems,
      percentageReceived: totalQuantityOrdered > 0 
        ? Math.round((totalQuantityReceived / totalQuantityOrdered) * 100)
        : 0
    };
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-muted-foreground">Cargando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Cierre de Órdenes de Compra</h1>
          <p className="text-muted-foreground mt-1">
            Cerrar órdenes recibidas para archivar y finalizar operaciones (solo administradores)
          </p>
        </div>

        {/* Error message */}
        {error && (
          <Card className="p-4 bg-destructive/10 border-destructive">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div className="text-sm text-destructive">{error}</div>
            </div>
          </Card>
        )}

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Por Cerrar</p>
                <p className="text-2xl font-bold">{ordersToBeClosed.length}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Recibido</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    ordersToBeClosed.reduce((sum, order) => sum + Number(order.totalAmount), 0)
                  )}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Proveedores</p>
                <p className="text-2xl font-bold">
                  {new Set(ordersToBeClosed.map(o => o.supplierId)).size}
                </p>
              </div>
              <Building2 className="h-8 w-8 text-green-500" />
            </div>
          </Card>
        </div>

        {/* Info card */}
        <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-1">Información sobre el cierre de órdenes</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Puedes cerrar órdenes con estado <strong>RECIBIDA</strong> (totalmente recibida)</li>
                <li>También puedes cerrar órdenes con estado <strong>RECIBIDA_PARCIAL</strong> si no se recibirá más mercancía</li>
                <li>Una vez cerrada, la orden quedará archivada y no se podrá modificar</li>
                <li>Revisa los detalles antes de cerrar para confirmar las cantidades recibidas</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Table */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Órdenes Listas para Cerrar</h2>
            
            {ordersToBeClosed.length === 0 ? (
              <div className="text-center py-12">
                <Lock className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No hay órdenes para cerrar</p>
                <p className="text-muted-foreground mt-1">
                  Las órdenes aparecerán aquí cuando estén completamente recibidas
                </p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">ID</TableHead>
                      <TableHead className="font-semibold">Proveedor</TableHead>
                      <TableHead className="font-semibold">Fecha Recepción</TableHead>
                      <TableHead className="text-right font-semibold">Total</TableHead>
                      <TableHead className="text-center font-semibold">Recepción</TableHead>
                      <TableHead className="text-center font-semibold">Estado</TableHead>
                      <TableHead className="text-right font-semibold">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ordersToBeClosed.map((order) => {
                      const stats = getReceptionStats(order);
                      const isPartial = order.status === PurchaseOrderStatus.RECIBIDA_PARCIAL;
                      
                      return (
                        <TableRow key={order.id} className="hover:bg-muted/50">
                          <TableCell className="font-mono text-xs">
                            {order.id?.substring(0, 8)}...
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {order.supplier?.name || "Sin nombre"}
                              </p>
                              {order.supplier?.taxId && (
                                <p className="text-xs text-muted-foreground">
                                  RUC: {order.supplier.taxId}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {order.updatedAt 
                              ? new Date(order.updatedAt).toLocaleDateString('es-ES')
                              : '-'}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(Number(order.totalAmount))}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex flex-col items-center gap-1">
                              <Badge 
                                variant={isPartial ? "outline" : "default"}
                                className={isPartial 
                                  ? "bg-yellow-50 text-yellow-700 border-yellow-200" 
                                  : "bg-green-50 text-green-700 border-green-200"
                                }
                              >
                                {stats.fullyReceivedItems}/{stats.totalItems} items
                              </Badge>
                              {isPartial && (
                                <span className="text-xs text-muted-foreground">
                                  {stats.percentageReceived}% recibido
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <StatusBadge status={order.status} />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDetails(order)}
                                title="Ver detalles"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleOpenClosure(order)}
                                title="Cerrar orden"
                              >
                                <Lock className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Details Sheet */}
      <PurchaseOrderDetailsSheet
        purchaseOrder={selectedOrder}
        open={detailsSheetOpen}
        onClose={() => {
          setDetailsSheetOpen(false);
          setSelectedOrder(null);
        }}
        onEdit={() => {}}
        onDelete={() => {}}
      />

      {/* Closure Dialog */}
      <Dialog open={closureDialogOpen} onOpenChange={(open) => {
        setClosureDialogOpen(open);
        if (!open) {
          setSelectedOrder(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cerrar Orden de Compra</DialogTitle>
            <DialogDescription>
              ¿Está seguro de que desea cerrar esta orden? Una vez cerrada, la orden
              quedará archivada y no se podrá modificar.
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (() => {
            const stats = getReceptionStats(selectedOrder);
            const isPartial = selectedOrder.status === PurchaseOrderStatus.RECIBIDA_PARCIAL;
            
            return (
              <div className="py-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Proveedor:</span>
                  <span className="font-medium">{selectedOrder.supplier?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-bold text-primary">
                    {formatCurrency(Number(selectedOrder.totalAmount))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estado actual:</span>
                  <StatusBadge status={selectedOrder.status} />
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Items recibidos:</span>
                  <span className="font-medium">
                    {stats.fullyReceivedItems} de {stats.totalItems} ({stats.percentageReceived}%)
                  </span>
                </div>
                
                {isPartial && stats.partiallyReceivedItems > 0 && (
                  <Card className="p-3 bg-yellow-50 border-yellow-200">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
                      <div className="text-sm text-yellow-800">
                        <p className="font-medium">Orden parcialmente recibida</p>
                        <p className="text-xs mt-1">
                          Esta orden tiene items con recepción parcial. Al cerrarla, 
                          se dará por finalizada la operación con las cantidades actuales.
                        </p>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            );
          })()}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setClosureDialogOpen(false);
                setSelectedOrder(null);
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleClose} disabled={loading}>
              <Lock className="mr-2 h-4 w-4" />
              Cerrar Orden
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
