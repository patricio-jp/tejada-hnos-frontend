// src/modules/Purchases/pages/PurchaseOrderFormPage.tsx

import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { usePurchaseOrders } from "../hooks/usePurchaseOrders";
import { useSuppliers } from "../hooks/useSuppliers";
import { useInputs } from "../hooks/useInputs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { ArrowLeft, Plus, Trash2, Save, Package, DollarSign, ShoppingCart, AlertCircle } from "lucide-react";
import type { CreatePurchaseOrderDto, UpdatePurchaseOrderDto } from "@/types";
import { formatCurrency } from "@/lib/currency";

interface OrderItem {
  id?: string; // UUID v4 - ID del detalle (solo para edición)
  inputId: string; // UUID v4
  quantity: number;
  unitPrice: number; // Precio unitario
}

export default function PurchaseOrderFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const {
    createPurchaseOrder,
    updatePurchaseOrder,
    getPurchaseOrderById,
    loading: orderLoading,
    error: orderError,
  } = usePurchaseOrders();
  
  const { suppliers, loading: suppliersLoading } = useSuppliers();
  const { inputs, loading: inputsLoading } = useInputs();

  const [supplierId, setSupplierId] = useState<string>("");
  const [items, setItems] = useState<OrderItem[]>([
    { inputId: "", quantity: 1, unitPrice: 0 },
  ]);
  const [loadingOrder, setLoadingOrder] = useState(false);

  // Preparar opciones para combobox de proveedores
  const supplierOptions: ComboboxOption[] = useMemo(
    () =>
      suppliers.map((supplier) => ({
        value: supplier.id,
        label: supplier.name,
        subtitle: supplier.taxId ? `RUC: ${supplier.taxId}` : undefined,
      })),
    [suppliers]
  );

  // Preparar opciones para combobox de insumos
  const inputOptions: ComboboxOption[] = useMemo(
    () =>
      inputs.map((input) => ({
        value: input.id,
        label: input.name,
        subtitle: `${input.unit} - Stock: ${input.stock || 0}`,
      })),
    [inputs]
  );

  // Calcular total de la orden
  const totalAmount = useMemo(() => {
    return items.reduce((sum, item) => {
      if (item.inputId && item.quantity > 0 && item.unitPrice > 0) {
        return sum + item.quantity * item.unitPrice;
      }
      return sum;
    }, 0);
  }, [items]);

  // Cargar orden si estamos editando
  useEffect(() => {
    if (isEditing && id) {
      setLoadingOrder(true);
      getPurchaseOrderById(id)
        .then((order) => {
          if (order) {
            setSupplierId(order.supplierId);
            setItems(
              order.details.map((detail) => ({
                id: detail.id, // Guardar el ID del detalle para la actualización
                inputId: detail.input.id,
                quantity: detail.quantity,
                unitPrice: detail.unitPrice,
              }))
            );
          } else {
            alert("No se pudo cargar la orden");
            navigate("/purchases");
          }
        })
        .catch(() => {
          alert("Error al cargar la orden");
          navigate("/purchases");
        })
        .finally(() => {
          setLoadingOrder(false);
        });
    }
  }, [isEditing, id, getPurchaseOrderById, navigate]);

  const addItem = () => {
    setItems([...items, { inputId: "", quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (
    index: number,
    field: keyof OrderItem,
    value: string | number
  ) => {
    setItems(
      items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!supplierId) {
      alert("Debe seleccionar un proveedor");
      return;
    }

    // Validar items
    const validItems = items.filter(
      (item) => item.inputId !== "" && item.quantity > 0 && item.unitPrice >= 0
    );

    if (validItems.length === 0) {
      alert("Debe agregar al menos un insumo con cantidad y precio válidos");
      return;
    }

    let success = false;

    if (isEditing && id) {
      // Para actualización, necesitamos el DTO con los IDs de los detalles
      const updateDto: UpdatePurchaseOrderDto = {
        supplierId,
        details: validItems.map((item) => ({
          id: item.id!, // El ID del detalle debe existir al editar
          inputId: item.inputId, // Incluir inputId para items nuevos
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      };
      const result = await updatePurchaseOrder(id, updateDto);
      success = !!result;
    } else {
      const dto: CreatePurchaseOrderDto = {
        supplierId,
        details: validItems.map((item) => ({
          inputId: item.inputId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      };

      const result = await createPurchaseOrder(dto);
      success = !!result;
    }

    if (success) {
      navigate("/purchases");
    }
  };

  const loading = orderLoading || suppliersLoading || inputsLoading || loadingOrder;

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
    <div className="container mx-auto py-6 max-w-5xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/purchases")}
            className="h-10 w-10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">
              {isEditing ? "Editar Orden de Compra" : "Nueva Orden de Compra"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isEditing
                ? "Modifica los datos de la orden existente"
                : "Crea una nueva orden de compra a un proveedor"}
            </p>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información del Proveedor */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Proveedor</h2>
            </div>
            <Separator className="mb-4" />
            
            <div className="space-y-2">
              <Label>Seleccionar Proveedor *</Label>
              <Combobox
                options={supplierOptions}
                value={supplierId}
                onChange={setSupplierId}
                placeholder="Buscar proveedor..."
                searchPlaceholder="Escriba para buscar..."
                emptyText="No se encontraron proveedores"
              />
              {supplierId && (() => {
                const supplier = suppliers.find(s => s.id === supplierId);
                if (supplier) {
                  return (
                    <div className="mt-3 p-3 bg-muted/50 rounded-md text-sm space-y-1">
                      <p><span className="font-medium">Nombre:</span> {supplier.name}</p>
                      {supplier.taxId && <p><span className="font-medium">RUC:</span> {supplier.taxId}</p>}
                      {supplier.contactEmail && <p><span className="font-medium">Email:</span> {supplier.contactEmail}</p>}
                      {supplier.phoneNumber && <p><span className="font-medium">Teléfono:</span> {supplier.phoneNumber}</p>}
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          </Card>

          {/* Detalles de Insumos */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Insumos</h2>
              </div>
              <Button 
                type="button" 
                onClick={addItem} 
                variant="outline" 
                size="sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                Agregar
              </Button>
            </div>
            <Separator className="mb-4" />

            {items.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No hay insumos agregados</p>
                <p className="text-sm">Haz clic en "Agregar" para añadir insumos</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item, index) => {
                  const selectedInput = inputs.find(inp => inp.id === item.inputId);
                  const itemSubtotal = item.quantity * item.unitPrice;
                  
                  return (
                    <div
                      key={index}
                      className="p-4 border rounded-lg space-y-4 hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="h-6 px-2">
                            #{index + 1}
                          </Badge>
                          {selectedInput && (
                            <span className="text-sm font-medium text-muted-foreground">
                              {selectedInput.name}
                            </span>
                          )}
                        </div>
                        {items.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(index)}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Selector de Insumo */}
                        <div className="space-y-2 md:col-span-2">
                          <Label>Insumo *</Label>
                          <Combobox
                            options={inputOptions}
                            value={item.inputId}
                            onChange={(value) => updateItem(index, "inputId", value)}
                            placeholder="Buscar insumo..."
                            searchPlaceholder="Escriba para buscar..."
                            emptyText="No se encontraron insumos"
                          />
                        </div>

                        {/* Stock actual */}
                        <div className="space-y-2">
                          <Label>Stock Actual</Label>
                          <div className="h-10 px-3 py-2 bg-muted rounded-md flex items-center text-sm">
                            {selectedInput ? (
                              <>
                                <span className="font-medium">{selectedInput.stock || 0}</span>
                                <span className="ml-2 text-muted-foreground">{selectedInput.unit}</span>
                              </>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Cantidad */}
                        <div className="space-y-2">
                          <Label>Cantidad *</Label>
                          <Input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={item.quantity}
                            onChange={(e) =>
                              updateItem(index, "quantity", parseFloat(e.target.value) || 0)
                            }
                            placeholder={selectedInput ? `En ${selectedInput.unit}` : "Cantidad"}
                            required
                          />
                        </div>

                        {/* Precio Unitario */}
                        <div className="space-y-2">
                          <Label>Precio Unitario *</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unitPrice}
                              onChange={(e) =>
                                updateItem(index, "unitPrice", parseFloat(e.target.value) || 0)
                              }
                              placeholder="0.00"
                              className="pl-9"
                              required
                            />
                          </div>
                        </div>

                        {/* Subtotal */}
                        <div className="space-y-2">
                          <Label>Subtotal</Label>
                          <div className="h-10 px-3 py-2 bg-muted rounded-md flex items-center justify-between">
                            <span className="font-semibold">
                              {formatCurrency(itemSubtotal)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Resumen Total */}
          <Card className="p-6 bg-primary/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-6 w-6 text-primary" />
                <span className="text-xl font-semibold">Total de la Orden</span>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-primary">
                  {formatCurrency(totalAmount)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {items.filter(i => i.inputId && i.quantity > 0).length} item(s)
                </p>
              </div>
            </div>
          </Card>

          {/* Error message */}
          {orderError && (
            <Card className="p-4 bg-destructive/10 border-destructive">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div className="text-sm text-destructive">{orderError}</div>
              </div>
            </Card>
          )}

          {/* Acciones */}
          <div className="flex gap-4 justify-end sticky bottom-4 bg-background p-4 border rounded-lg shadow-lg">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/purchases")}
              size="lg"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={orderLoading || items.length === 0 || !supplierId}
              size="lg"
              className="min-w-[150px]"
            >
              <Save className="mr-2 h-4 w-4" />
              {orderLoading
                ? "Guardando..."
                : isEditing
                ? "Actualizar"
                : "Crear Orden"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
