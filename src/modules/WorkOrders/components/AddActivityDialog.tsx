import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import type { CreateActivityDto, ActivityType, Input as InputType } from "@/modules/WorkOrders/types/work-orders";
import { useInputs } from "../hooks/useInputs";
import { workOrdersApi } from "../services/work-orders-api";
import useAuth from "@/modules/Auth/hooks/useAuth";
import { toast } from "sonner";

interface AddActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workOrderId: string;
  onActivityCreated: () => void;
}

interface InputUsageForm {
  inputId: string;
  quantityUsed: number;
}

const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  PODA: "Poda",
  RIEGO: "Riego",
  APLICACION: "Aplicación",
  COSECHA: "Cosecha",
  MANTENIMIENTO: "Mantenimiento",
  MONITOREO: "Monitoreo",
  OTRO: "Otro",
};

export function AddActivityDialog({ open, onOpenChange, workOrderId, onActivityCreated }: AddActivityDialogProps) {
  const { inputs, loading: loadingInputs } = useInputs();
  const { accessToken } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    type: "" as ActivityType,
    executionDate: "",
    hoursWorked: "",
    details: "",
  });

  const [inputsUsed, setInputsUsed] = useState<InputUsageForm[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAddInput = () => {
    setInputsUsed([...inputsUsed, { inputId: "", quantityUsed: 0 }]);
  };

  const handleRemoveInput = (index: number) => {
    setInputsUsed(inputsUsed.filter((_, i) => i !== index));
  };

  const handleInputChange = (index: number, field: keyof InputUsageForm, value: string | number) => {
    const updated = [...inputsUsed];
    updated[index] = { ...updated[index], [field]: value };
    setInputsUsed(updated);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.type) {
      newErrors.type = "Selecciona un tipo de actividad";
    }

    if (!formData.executionDate) {
      newErrors.executionDate = "La fecha de ejecución es obligatoria";
    }

    if (!formData.hoursWorked || parseFloat(formData.hoursWorked) <= 0) {
      newErrors.hoursWorked = "Las horas trabajadas deben ser mayor a 0";
    }

    // Validar insumos
    inputsUsed.forEach((input, index) => {
      if (!input.inputId) {
        newErrors[`input_${index}`] = "Selecciona un insumo";
      }
      
      if (input.quantityUsed <= 0) {
        newErrors[`quantity_${index}`] = "La cantidad debe ser mayor a 0";
      }

      // Validar stock disponible
      const selectedInput = inputs.find(i => i.id === input.inputId);
      if (selectedInput && input.quantityUsed > selectedInput.stock) {
        newErrors[`quantity_${index}`] = `Stock insuficiente. Disponible: ${selectedInput.stock} ${selectedInput.unit}`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !accessToken) {
      return;
    }

    setSubmitting(true);

    try {
      const activityData: CreateActivityDto = {
        workOrderId,
        type: formData.type,
        executionDate: new Date(formData.executionDate).toISOString(),
        hoursWorked: parseFloat(formData.hoursWorked),
        details: formData.details || undefined,
        inputsUsed: inputsUsed.length > 0 
          ? inputsUsed.filter(i => i.inputId && i.quantityUsed > 0)
          : undefined,
      };

      await workOrdersApi.createActivity(workOrderId, activityData, accessToken);
      
      toast.success("Actividad creada exitosamente", {
        description: "Tu actividad ha sido registrada y está pendiente de aprobación."
      });

      // Resetear formulario
      setFormData({ type: "" as ActivityType, executionDate: "", hoursWorked: "", details: "" });
      setInputsUsed([]);
      setErrors({});
      
      onActivityCreated();
      onOpenChange(false);
    } catch (error) {
      toast.error("Error al crear la actividad", {
        description: error instanceof Error ? error.message : "Ocurrió un error inesperado"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getInputById = (inputId: string): InputType | undefined => {
    return inputs.find(i => i.id === inputId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Añadir Actividad</DialogTitle>
          <DialogDescription>
            Registra una nueva actividad realizada. Esta actividad quedará pendiente de aprobación por tu supervisor.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tipo de actividad */}
          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Actividad *</Label>
            <NativeSelect
              id="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as ActivityType })}
              className={errors.type ? "border-destructive" : ""}
            >
              <option value="">Seleccionar tipo...</option>
              {Object.entries(ACTIVITY_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </NativeSelect>
            {errors.type && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.type}
              </p>
            )}
          </div>

          {/* Fecha de ejecución */}
          <div className="space-y-2">
            <Label htmlFor="executionDate">Fecha de Ejecución *</Label>
            <Input
              id="executionDate"
              type="date"
              value={formData.executionDate}
              onChange={(e) => setFormData({ ...formData, executionDate: e.target.value })}
              className={errors.executionDate ? "border-destructive" : ""}
            />
            {errors.executionDate && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.executionDate}
              </p>
            )}
          </div>

          {/* Horas trabajadas */}
          <div className="space-y-2">
            <Label htmlFor="hoursWorked">Horas Trabajadas *</Label>
            <Input
              id="hoursWorked"
              type="number"
              step="0.5"
              min="0"
              placeholder="Ej: 8.5"
              value={formData.hoursWorked}
              onChange={(e) => setFormData({ ...formData, hoursWorked: e.target.value })}
              className={errors.hoursWorked ? "border-destructive" : ""}
            />
            {errors.hoursWorked && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.hoursWorked}
              </p>
            )}
          </div>

          {/* Detalles adicionales */}
          <div className="space-y-2">
            <Label htmlFor="details">Detalles Adicionales (Opcional)</Label>
            <Input
              id="details"
              placeholder="Observaciones, notas, etc."
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
            />
          </div>

          <Separator />

          {/* Insumos utilizados */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Insumos Utilizados (Opcional)</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Registra los insumos que utilizaste en esta actividad
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddInput}
                disabled={loadingInputs}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Insumo
              </Button>
            </div>

            {inputsUsed.length === 0 && (
              <div className="text-center py-6 text-sm text-muted-foreground border border-dashed rounded-lg">
                No se han agregado insumos
              </div>
            )}

            {inputsUsed.map((inputUsage, index) => {
              const selectedInput = getInputById(inputUsage.inputId);
              return (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <span className="text-sm font-medium">Insumo #{index + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveInput(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Insumo *</Label>
                      <NativeSelect
                        value={inputUsage.inputId}
                        onChange={(e) => handleInputChange(index, "inputId", e.target.value)}
                        className={errors[`input_${index}`] ? "border-destructive" : ""}
                      >
                        <option value="">Seleccionar...</option>
                        {inputs.map((input) => (
                          <option key={input.id} value={input.id}>
                            {input.name} (Stock: {input.stock} {input.unit})
                          </option>
                        ))}
                      </NativeSelect>
                      {errors[`input_${index}`] && (
                        <p className="text-xs text-destructive">{errors[`input_${index}`]}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Cantidad Utilizada *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0"
                        value={inputUsage.quantityUsed || ""}
                        onChange={(e) => handleInputChange(index, "quantityUsed", parseFloat(e.target.value) || 0)}
                        className={errors[`quantity_${index}`] ? "border-destructive" : ""}
                      />
                      {errors[`quantity_${index}`] && (
                        <p className="text-xs text-destructive">{errors[`quantity_${index}`]}</p>
                      )}
                    </div>
                  </div>

                  {selectedInput && (
                    <div className="flex items-center gap-2 text-xs">
                      <Badge variant="outline">
                        Stock disponible: {selectedInput.stock} {selectedInput.unit}
                      </Badge>
                      <Badge variant="secondary">
                        Costo: ${selectedInput.costPerUnit}/{selectedInput.unit}
                      </Badge>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Guardando..." : "Crear Actividad"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
