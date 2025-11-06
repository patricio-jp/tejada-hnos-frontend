// src/modules/Purchases/pages/PurchaseOrdersListPage.tsx

import { useState } from "react";
import { useNavigate } from "react-router";
import { usePurchaseOrders } from "../hooks/usePurchaseOrders";
import { PurchaseOrdersDataTable } from "../components/PurchaseOrdersDataTable";
import { PurchaseOrderDetailsSheet } from "../components/PurchaseOrderDetailsSheet";
import { GoodReceiptDialog } from "../components/GoodReceiptDialog";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import type { PurchaseOrder } from "../types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function PurchaseOrdersListPage() {
  const navigate = useNavigate();
  const {
    purchaseOrders,
    loading,
    error,
    fetchPurchaseOrders,
    deletePurchaseOrder,
  } = usePurchaseOrders();

  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [orderToReceive, setOrderToReceive] = useState<PurchaseOrder | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<PurchaseOrder | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [receiveDialogOpen, setReceiveDialogOpen] = useState(false);

  const handleView = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  const handleEdit = (order: PurchaseOrder) => {
    navigate(`/purchases/edit/${order.id}`);
  };

  const handleDelete = (order: PurchaseOrder) => {
    setOrderToDelete(order);
  };

  const confirmDelete = async () => {
    if (!orderToDelete?.id) return;
    
    const success = await deletePurchaseOrder(orderToDelete.id);
    if (success) {
      setOrderToDelete(null);
      // Si estamos viendo los detalles de la orden eliminada, cerrar el sheet
      if (selectedOrder?.id === orderToDelete.id) {
        setDetailsOpen(false);
        setSelectedOrder(null);
      }
    }
  };

  const handleReceive = (order: PurchaseOrder) => {
    setOrderToReceive(order);
    setReceiveDialogOpen(true);
  };

  const handleReceiveSuccess = () => {
    // Recargar las órdenes después de registrar la recepción
    fetchPurchaseOrders();
    setReceiveDialogOpen(false);
    setOrderToReceive(null);
    
    // Si estamos viendo los detalles, también cerrarlos para que se recarguen
    if (detailsOpen) {
      setDetailsOpen(false);
      setSelectedOrder(null);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Órdenes de Compra</h1>
          <p className="text-muted-foreground">
            Gestiona las órdenes de compra a proveedores
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={fetchPurchaseOrders}
            disabled={loading}
            title="Recargar"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={() => navigate("/purchases/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Orden
          </Button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-md">
          {error}
        </div>
      )}

      {/* DataTable */}
      {loading && purchaseOrders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Cargando órdenes...</p>
        </div>
      ) : (
        <PurchaseOrdersDataTable
          data={purchaseOrders}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onReceive={handleReceive}
        />
      )}

      {/* Sheet de detalles */}
      <PurchaseOrderDetailsSheet
        purchaseOrder={selectedOrder}
        open={detailsOpen}
        onClose={() => {
          setDetailsOpen(false);
          setSelectedOrder(null);
        }}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onReceive={handleReceive}
      />

      {/* Dialog de recepción */}
      <GoodReceiptDialog
        purchaseOrder={orderToReceive}
        open={receiveDialogOpen}
        onClose={() => {
          setReceiveDialogOpen(false);
          setOrderToReceive(null);
        }}
        onSuccess={handleReceiveSuccess}
      />

      {/* Dialog de confirmación de eliminación */}
      <AlertDialog open={!!orderToDelete} onOpenChange={() => setOrderToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la orden de compra{" "}
              {`#${orderToDelete?.id}`}. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
