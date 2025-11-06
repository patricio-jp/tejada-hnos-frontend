// src/modules/Purchases/components/PurchaseOrderDetailsSheet.tsx

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "./StatusBadge";
import type { PurchaseOrder } from "../types";
import {
  Edit, 
  Trash2, 
  PackageCheck, 
  Calendar, 
  User, 
  Building2,
  Package,
  Clock
} from "lucide-react";
import { PurchaseOrderStatus } from "../types";

interface PurchaseOrderDetailsSheetProps {
  purchaseOrder: PurchaseOrder | null;
  open: boolean;
  onClose: () => void;
  onEdit: (purchaseOrder: PurchaseOrder) => void;
  onDelete: (purchaseOrder: PurchaseOrder) => void;
  onReceive?: (purchaseOrder: PurchaseOrder) => void;
}

export function PurchaseOrderDetailsSheet({
  purchaseOrder,
  open,
  onClose,
  onEdit,
  onDelete,
  onReceive,
}: PurchaseOrderDetailsSheetProps) {
  if (!purchaseOrder) return null;

  const canReceive = 
    purchaseOrder.status === PurchaseOrderStatus.APROBADA || 
    purchaseOrder.status === PurchaseOrderStatus.RECIBIDA_PARCIAL;

  const canEdit = purchaseOrder.status === PurchaseOrderStatus.PENDIENTE;

  const formattedCreatedDate = purchaseOrder.createdAt 
    ? new Date(purchaseOrder.createdAt).toLocaleDateString('es-ES')
    : 'N/A';

  const formattedUpdatedDate = purchaseOrder.updatedAt 
    ? new Date(purchaseOrder.updatedAt).toLocaleDateString('es-ES')
    : 'N/A';

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <SheetTitle className="text-2xl">
                Orden #{purchaseOrder.id?.substring(0, 8)}
              </SheetTitle>
              <SheetDescription>
                Detalles de la orden de compra
              </SheetDescription>
            </div>
            <StatusBadge status={purchaseOrder.status} />
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Información del Proveedor - Card destacado */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Proveedor</span>
            </div>
            <p className="text-lg font-semibold">
              {purchaseOrder.supplier?.name || "Sin información"}
            </p>
            {purchaseOrder.supplier?.taxId && (
              <p className="text-sm text-muted-foreground">
                🏢 RUC: {purchaseOrder.supplier.taxId}
              </p>
            )}
            {purchaseOrder.supplier?.contactEmail && (
              <p className="text-sm text-muted-foreground">
                📧 {purchaseOrder.supplier.contactEmail}
              </p>
            )}
            {purchaseOrder.supplier?.phoneNumber && (
              <p className="text-sm text-muted-foreground">
                📞 {purchaseOrder.supplier.phoneNumber}
              </p>
            )}
            {purchaseOrder.supplier?.address && (
              <p className="text-sm text-muted-foreground">
                📍 {purchaseOrder.supplier.address}
              </p>
            )}
          </div>

          {/* Fechas - Grid de 2 columnas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Fecha de creación</span>
              </div>
              <p className="text-sm font-medium">{formattedCreatedDate}</p>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Última actualización</span>
              </div>
              <p className="text-sm font-medium">{formattedUpdatedDate}</p>
            </div>
          </div>

          {/* Monto Total */}
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total de la orden</span>
              <span className="text-2xl font-bold text-primary">
                S/ {purchaseOrder.totalAmount?.toFixed(2) || '0.00'}
              </span>
            </div>
          </div>

          <Separator />

          {/* Detalles de los insumos - Tabla */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Package className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Insumos solicitados</h3>
              <Badge variant="secondary" className="ml-auto">
                {purchaseOrder.details?.length || 0} items
              </Badge>
            </div>
            
            {purchaseOrder.details && purchaseOrder.details.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Insumo</TableHead>
                      <TableHead className="text-right font-semibold">Cantidad</TableHead>
                      <TableHead className="text-right font-semibold">Recibido</TableHead>
                      <TableHead className="text-right font-semibold">Pendiente</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchaseOrder.details.map((detail, index) => {
                      const quantityReceived = detail.quantityReceived || 0;
                      const pending = detail.quantity - quantityReceived;
                      const isComplete = pending === 0;
                      
                      return (
                        <TableRow key={detail.id || index}>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {detail.input?.name || `ID: ${detail.inputId.substring(0, 8)}...`}
                              </p>
                              {detail.input?.unit && (
                                <p className="text-xs text-muted-foreground">
                                  Unidad: {detail.input.unit}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground mt-1">
                                Precio: S/ {detail.unitPrice.toFixed(2)}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div>
                              <p className="font-medium">
                                {detail.quantity} {detail.input?.unit || "und"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                S/ {(detail.quantity * detail.unitPrice).toFixed(2)}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={quantityReceived > 0 ? "text-green-600 font-medium" : "text-muted-foreground"}>
                              {quantityReceived} {detail.input?.unit || "und"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            {isComplete ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                ✓ Completo
                              </Badge>
                            ) : (
                              <span className="font-medium text-orange-600">
                                {pending} {detail.input?.unit || "und"}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-muted-foreground border rounded-lg">
                No hay insumos en esta orden
              </div>
            )}
          </div>

          {/* Historial de recepciones */}
          {purchaseOrder.receipts && purchaseOrder.receipts.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold mb-3">📦 Historial de recepciones</h3>
                <div className="space-y-2">
                  {purchaseOrder.receipts.map((receipt, index) => (
                    <div 
                      key={receipt.id || index} 
                      className="p-3 border-l-4 border-green-500 bg-green-50/50 rounded-r-lg"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium">
                            Recepción #{index + 1}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(receipt.receivedDate).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                        {receipt.receivedByName && (
                          <Badge variant="outline" className="text-xs">
                            <User className="h-3 w-3 mr-1" />
                            {receipt.receivedByName}
                          </Badge>
                        )}
                      </div>
                      {receipt.notes && (
                        <p className="text-xs text-muted-foreground mt-2">
                          💬 {receipt.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Acciones */}
          <div className="flex flex-col gap-2 sticky bottom-0 bg-background pt-4">
            {canReceive && onReceive && (
              <Button
                onClick={() => {
                  onReceive(purchaseOrder);
                  onClose();
                }}
                className="w-full"
                size="lg"
              >
                <PackageCheck className="mr-2 h-5 w-5" />
                Recibir mercancía
              </Button>
            )}
            
            {canEdit && (
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => {
                    onEdit(purchaseOrder);
                    onClose();
                  }}
                  variant="outline"
                  className="w-full"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Button>
                <Button
                  onClick={() => {
                    onDelete(purchaseOrder);
                    onClose();
                  }}
                  variant="destructive"
                  className="w-full"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </Button>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
