// src/modules/Purchases/pages/PurchaseOrderApprovalPage.tsx

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  CheckCircle, 
  XCircle, 
  Edit, 
  Eye,
  AlertCircle,
  Package,
  Building2,
  DollarSign
} from "lucide-react";
import { PurchaseOrderStatus } from "../types";
import type { PurchaseOrder } from "../types";
import { StatusBadge } from "../components/StatusBadge";
import { PurchaseOrderDetailsSheet } from "../components/PurchaseOrderDetailsSheet";
import { formatCurrency } from "@/lib/currency";

export default function PurchaseOrderApprovalPage() {
  const { 
    purchaseOrders, 
    loading, 
    error,
    updatePurchaseOrder,
    updatePurchaseOrderStatus,
    fetchPurchaseOrders
  } = usePurchaseOrders();

  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [detailsSheetOpen, setDetailsSheetOpen] = useState(false);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedDetails, setEditedDetails] = useState<Array<{
    id: string;
    unitPrice: number;
  }>>([]);

  // Filtrar solo órdenes PENDIENTES para aprobar
  const pendingOrders = useMemo(() => {
    return purchaseOrders.filter(
      order => order.status === PurchaseOrderStatus.PENDIENTE
    );
  }, [purchaseOrders]);

  const handleViewDetails = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setDetailsSheetOpen(true);
  };

  const handleOpenApproval = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setApprovalDialogOpen(true);
  };

  const handleOpenReject = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setRejectDialogOpen(true);
  };

  const handleOpenEdit = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    // Inicializar precios editables
    setEditedDetails(
      order.details.map(detail => ({
        id: detail.id || "",
        unitPrice: Number(detail.unitPrice),
      }))
    );
    setEditDialogOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedOrder) return;

    const result = await updatePurchaseOrderStatus(
      selectedOrder.id!,
      PurchaseOrderStatus.APROBADA
    );

    if (result) {
      setApprovalDialogOpen(false);
      setSelectedOrder(null);
      fetchPurchaseOrders();
    }
  };

  const handleReject = async () => {
    if (!selectedOrder) return;

    const result = await updatePurchaseOrderStatus(
      selectedOrder.id!,
      PurchaseOrderStatus.CANCELADA
    );

    if (result) {
      setRejectDialogOpen(false);
      setSelectedOrder(null);
      fetchPurchaseOrders();
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedOrder) return;

    // Calcular nuevo total
    const newTotalAmount = selectedOrder.details.reduce((sum, detail, index) => {
      const newPrice = editedDetails[index]?.unitPrice || Number(detail.unitPrice);
      return sum + (Number(detail.quantity) * newPrice);
    }, 0);

    // Actualizar orden con nuevos precios
    const result = await updatePurchaseOrder(selectedOrder.id!, {
      supplierId: selectedOrder.supplierId,
      status: PurchaseOrderStatus.PENDIENTE,
      totalAmount: newTotalAmount,
      details: selectedOrder.details.map((detail, index) => ({
        inputId: detail.inputId,
        quantity: Number(detail.quantity),
        unitPrice: editedDetails[index]?.unitPrice || Number(detail.unitPrice),
      })),
    });

    if (result) {
      setEditDialogOpen(false);
      setSelectedOrder(null);
      fetchPurchaseOrders();
    }
  };

  const updateDetailPrice = (index: number, newPrice: number) => {
    setEditedDetails(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], unitPrice: newPrice };
      return updated;
    });
  };

  const calculateEditedTotal = () => {
    if (!selectedOrder) return 0;
    return selectedOrder.details.reduce((sum, detail, index) => {
      const price = editedDetails[index]?.unitPrice || Number(detail.unitPrice);
      return sum + (Number(detail.quantity) * price);
    }, 0);
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
          <h1 className="text-3xl font-bold">Aprobación de Órdenes de Compra</h1>
          <p className="text-muted-foreground mt-1">
            Revisar y aprobar órdenes de compra pendientes (solo administradores)
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
                <p className="text-sm text-muted-foreground">Pendientes</p>
                <p className="text-2xl font-bold">{pendingOrders.length}</p>
              </div>
              <Package className="h-8 w-8 text-orange-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Pendiente</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    pendingOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0)
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
                  {new Set(pendingOrders.map(o => o.supplierId)).size}
                </p>
              </div>
              <Building2 className="h-8 w-8 text-blue-500" />
            </div>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Órdenes Pendientes de Aprobación</h2>
            
            {pendingOrders.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
                <p className="text-lg font-medium">No hay órdenes pendientes</p>
                <p className="text-muted-foreground mt-1">
                  Todas las órdenes han sido procesadas
                </p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">ID</TableHead>
                      <TableHead className="font-semibold">Proveedor</TableHead>
                      <TableHead className="font-semibold">Fecha</TableHead>
                      <TableHead className="text-right font-semibold">Total</TableHead>
                      <TableHead className="text-center font-semibold">Items</TableHead>
                      <TableHead className="text-center font-semibold">Estado</TableHead>
                      <TableHead className="text-right font-semibold">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingOrders.map((order) => (
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
                          {order.createdAt 
                            ? new Date(order.createdAt).toLocaleDateString('es-ES')
                            : '-'}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(Number(order.totalAmount))}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">
                            {order.details.length} items
                          </Badge>
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
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenEdit(order)}
                              title="Editar precios"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleOpenApproval(order)}
                              title="Aprobar"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleOpenReject(order)}
                              title="Rechazar"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
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

      {/* Approval Dialog */}
      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aprobar Orden de Compra</DialogTitle>
            <DialogDescription>
              ¿Está seguro de que desea aprobar esta orden? Una vez aprobada, la orden
              se volverá inmutable excepto por su estado.
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="py-4 space-y-2">
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
                <span className="text-muted-foreground">Items:</span>
                <span>{selectedOrder.details.length}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setApprovalDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleApprove} disabled={loading}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Aprobar Orden
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rechazar Orden de Compra</DialogTitle>
            <DialogDescription>
              ¿Está seguro de que desea rechazar esta orden? La orden será cancelada
              y no podrá ser procesada.
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="py-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Proveedor:</span>
                <span className="font-medium">{selectedOrder.supplier?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total:</span>
                <span className="font-bold">
                  {formatCurrency(Number(selectedOrder.totalAmount))}
                </span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={loading}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Rechazar Orden
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Precios de la Orden</DialogTitle>
            <DialogDescription>
              Ajuste los precios unitarios antes de aprobar la orden
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="py-4 space-y-4">
              <div className="space-y-3">
                {selectedOrder.details.map((detail, index) => (
                  <Card key={detail.id || index} className="p-4">
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium">
                          {detail.input?.name || `Input ID: ${detail.inputId.substring(0, 8)}...`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Cantidad: {detail.quantity} {detail.input?.unit || 'und'}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`price-${index}`}>Precio Unitario</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id={`price-${index}`}
                              type="number"
                              min="0"
                              step="0.01"
                              value={editedDetails[index]?.unitPrice || 0}
                              onChange={(e) =>
                                updateDetailPrice(index, parseFloat(e.target.value) || 0)
                              }
                              className="pl-9"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Subtotal</Label>
                          <div className="h-10 px-3 py-2 bg-muted rounded-md flex items-center justify-end">
                            <span className="font-semibold">
                              {formatCurrency(
                                Number(detail.quantity) * 
                                (editedDetails[index]?.unitPrice || 0)
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <Card className="p-4 bg-primary/5 border-primary/20">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">Total de la Orden</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatCurrency(calculateEditedTotal())}
                  </span>
                </div>
              </Card>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit} disabled={loading}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
