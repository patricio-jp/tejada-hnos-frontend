// src/modules/Purchases/components/PurchaseOrderCard.tsx

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";
import { PurchaseOrderStatus, type PurchaseOrder } from "@/types";
import { Eye, Edit, Trash2, PackageCheck } from "lucide-react";

interface PurchaseOrderCardProps {
  purchaseOrder: PurchaseOrder;
  onView: (purchaseOrder: PurchaseOrder) => void;
  onEdit: (purchaseOrder: PurchaseOrder) => void;
  onDelete: (purchaseOrder: PurchaseOrder) => void;
  onReceive?: (purchaseOrder: PurchaseOrder) => void;
}

export function PurchaseOrderCard({
  purchaseOrder,
  onView,
  onEdit,
  onDelete,
  onReceive,
}: PurchaseOrderCardProps) {
  const canReceive = 
    purchaseOrder.status === PurchaseOrderStatus.APROBADA || 
    purchaseOrder.status === PurchaseOrderStatus.RECIBIDA_PARCIAL;

  const totalItems = purchaseOrder.details?.length || 0;
  const formattedDate = purchaseOrder.createdAt 
    ? new Date(purchaseOrder.createdAt).toLocaleDateString('es-ES')
    : 'N/A';

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-lg">
              {`Orden #${purchaseOrder.id}`}
            </h3>
            <StatusBadge status={purchaseOrder.status} />
          </div>
          
          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              <span className="font-medium">Proveedor:</span>{" "}
              {purchaseOrder.supplier?.name || "N/A"}
            </p>
            <p>
              <span className="font-medium">Fecha:</span> {formattedDate}
            </p>
            <p>
              <span className="font-medium">Items:</span> {totalItems}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(purchaseOrder)}
            title="Ver detalles"
          >
            <Eye className="h-4 w-4" />
          </Button>
          
          {purchaseOrder.status === PurchaseOrderStatus.PENDIENTE && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(purchaseOrder)}
                title="Editar"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(purchaseOrder)}
                title="Eliminar"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </>
          )}
          
          {canReceive && onReceive && (
            <Button
              variant="default"
              size="sm"
              onClick={() => onReceive(purchaseOrder)}
              title="Recibir mercancía"
            >
              <PackageCheck className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
