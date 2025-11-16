// src/modules/Purchases/components/GoodReceiptDialog.tsx

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PurchaseOrder, CreateGoodReceiptDto } from "@/types";
import { useGoodsReceipts } from "../hooks/useGoodsReceipts";

interface GoodReceiptDialogProps {
  purchaseOrder: PurchaseOrder | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ReceiptItem {
  purchaseOrderDetailId: string; // UUID v4
  inputId: string; // UUID v4
  inputName: string;
  quantityOrdered: number;
  quantityReceived: number;
  quantityToReceive: number;
  unit: string;
}

export function GoodReceiptDialog({
  purchaseOrder,
  open,
  onClose,
  onSuccess,
}: GoodReceiptDialogProps) {
  const { createGoodReceipt, loading, error } = useGoodsReceipts();
  const [receivedDate, setReceivedDate] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<ReceiptItem[]>([]);

  useEffect(() => {
    if (purchaseOrder && open) {
      // Inicializar los items con los detalles de la orden
      const receiptItems: ReceiptItem[] = purchaseOrder.details.map((detail) => ({
        purchaseOrderDetailId: detail.id!,
        inputId: detail.input.id,
        inputName: detail.input.name,
        quantityOrdered: detail.quantity,
        quantityReceived: detail.quantityReceived || 0,
        quantityToReceive: detail.quantity - (detail.quantityReceived || 0),
        unit: detail.input.unit,
      }));
      setItems(receiptItems);
      
      // Establecer fecha actual
      const today = new Date().toISOString().split('T')[0];
      setReceivedDate(today);
      setNotes("");
    }
  }, [purchaseOrder, open]);

  const handleQuantityChange = (index: number, value: string) => {
    const quantity = parseFloat(value) || 0;
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, quantityToReceive: quantity } : item
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!purchaseOrder?.id) return;

    // Validar que al menos un item tenga cantidad > 0
    const itemsToReceive = items.filter((item) => item.quantityToReceive > 0);
    if (itemsToReceive.length === 0) {
      alert("Debe ingresar al menos una cantidad a recibir");
      return;
    }

    // Validar que no se reciba más de lo solicitado
    const invalidItems = itemsToReceive.filter(
      (item) => item.quantityToReceive > (item.quantityOrdered - item.quantityReceived)
    );
    if (invalidItems.length > 0) {
      alert("No puede recibir más cantidad de la solicitada");
      return;
    }

    const dto: CreateGoodReceiptDto = {
      purchaseOrderId: purchaseOrder.id,
      receivedDate,
      notes: notes.trim() || undefined,
      details: itemsToReceive.map((item) => ({
        purchaseOrderDetailId: item.purchaseOrderDetailId,
        inputId: item.inputId,
        quantityReceived: item.quantityToReceive,
        notes: undefined,
      })),
    };

    const result = await createGoodReceipt(dto);
    
    if (result) {
      onSuccess();
      onClose();
    }
  };

  const handleClose = () => {
    setItems([]);
    setReceivedDate("");
    setNotes("");
    onClose();
  };

  if (!purchaseOrder) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Recibir mercancía</DialogTitle>
          <DialogDescription>
            Registre las cantidades recibidas para la orden{" "}
            {`#${purchaseOrder.id}`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Fecha de recepción */}
          <div className="space-y-2">
            <Label htmlFor="receivedDate">Fecha de recepción *</Label>
            <Input
              id="receivedDate"
              type="date"
              value={receivedDate}
              onChange={(e) => setReceivedDate(e.target.value)}
              required
            />
          </div>

          {/* Items a recibir */}
          <div className="space-y-3">
            <Label>Insumos solicitados</Label>
            {items.map((item, index) => (
              <div key={item.purchaseOrderDetailId} className="p-4 border rounded-md space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{item.inputName}</p>
                    <p className="text-sm text-muted-foreground">
                      Solicitado: {item.quantityOrdered} {item.unit}
                    </p>
                    {item.quantityReceived > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Ya recibido: {item.quantityReceived} {item.unit}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Pendiente: {item.quantityOrdered - item.quantityReceived} {item.unit}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`quantity-${index}`} className="min-w-fit">
                    Cantidad a recibir:
                  </Label>
                  <Input
                    id={`quantity-${index}`}
                    type="number"
                    min="0"
                    max={item.quantityOrdered - item.quantityReceived}
                    step="0.01"
                    value={item.quantityToReceive}
                    onChange={(e) => handleQuantityChange(index, e.target.value)}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground">{item.unit}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Ingrese observaciones sobre la recepción..."
            />
          </div>

          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Registrar recepción"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
