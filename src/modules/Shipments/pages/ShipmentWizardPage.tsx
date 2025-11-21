import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { MOCK_ORDERS, MOCK_INVENTORY } from '@/lib/mock-picking-data'; // Asegúrate de importar MOCK_INVENTORY
import { Loader2, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { pickingService } from '../services/picking-service';
import type { CreateShipmentDto, ShipmentLotDetailDto } from '@/types/picking';

// Pasos
import { PickingStep1 } from '../components/picking/PickingStep1';
import { PickingStep2 } from '../components/picking/PickingStep2';
import { PickingStep3 } from '../components/picking/PickingStep3';

export default function ShipmentWizardPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Cargar la orden
  const order = useMemo(() => 
    MOCK_ORDERS.find(o => o.id === orderId), 
  [orderId]);

  // 2. Estado del Wizard
  const [selectedLineIds, setSelectedLineIds] = useState<string[]>([]);
  const [assignments, setAssignments] = useState<Record<string, Record<string, number>>>({});

  if (!order) return <div className="p-8 text-center">Pedido no encontrado</div>;

  // --- Validaciones (NUEVO) ---

  const canAdvanceFromStep2 = useMemo(() => {
    // 1. Debe haber al menos una línea seleccionada (ya validado en paso 1, pero por seguridad)
    if (selectedLineIds.length === 0) return false;

    let hasAnyAssignment = false;
    let hasErrors = false;

    // Recorremos las líneas seleccionadas
    for (const lineId of selectedLineIds) {
      const line = order.details.find(d => d.id === lineId);
      if (!line) continue;

      const lineAssignments = assignments[lineId] || {};
      let totalAssignedToLine = 0;

      // Recorremos las asignaciones de lotes para esta línea
      for (const [lotId, qty] of Object.entries(lineAssignments)) {
        if (qty > 0) {
          hasAnyAssignment = true;
          
          // Validación A: ¿Supera el stock del lote?
          const lot = MOCK_INVENTORY.find(l => l.id === lotId);
          if (lot && qty > lot.remainingNetWeightKg) {
            hasErrors = true; // Error: Queriendo sacar más de lo que hay
          }
          
          totalAssignedToLine += qty;
        }
      }

      // Validación B: ¿Supera lo pedido por el cliente?
      const pending = line.quantityKg - (line.quantityShipped || 0);
      if (totalAssignedToLine > pending) {
        hasErrors = true; // Error: Sobre-despacho
      }
    }

    // Solo avanzamos si hay al menos 1kg asignado y CERO errores
    return hasAnyAssignment && !hasErrors;

  }, [selectedLineIds, assignments, order.details]);


  // --- Handlers ---

  const toggleLine = (lineId: string) => {
    setSelectedLineIds(prev => 
      prev.includes(lineId) ? prev.filter(id => id !== lineId) : [...prev, lineId]
    );
  };

  const updateAssignment = (lineId: string, lotId: string, qty: number) => {
    setAssignments(prev => ({
      ...prev,
      [lineId]: {
        ...(prev[lineId] || {}),
        [lotId]: qty < 0 ? 0 : qty // Evitar negativos
      }
    }));
  };

  const handleSubmit = async () => {
    if (!order) return;
    setIsSubmitting(true);
    
    try {
      const lotDetails: ShipmentLotDetailDto[] = [];
      
      Object.entries(assignments).forEach(([salesOrderDetailId, lotAssignments]) => {
        Object.entries(lotAssignments).forEach(([harvestLotId, quantityTakenKg]) => {
          if (quantityTakenKg > 0) {
            lotDetails.push({
              salesOrderDetailId,
              harvestLotId,
              quantityTakenKg
            });
          }
        });
      });

      if (lotDetails.length === 0) {
        toast.error("No hay cantidades asignadas para enviar.");
        setIsSubmitting(false);
        return;
      }

      const payload: CreateShipmentDto = {
        salesOrderId: order.id,
        lotDetails: lotDetails,
        dispatchDate: new Date().toISOString()
      };

      await pickingService.submitShipment(payload);
      toast.success(`Envío registrado exitosamente.`);
      navigate('/shipments');

    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Error al procesar el envío");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedLines = order.details.filter(d => selectedLineIds.includes(d.id!));

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <div className="text-sm text-muted-foreground mb-1">Nueva Salida de Mercadería</div>
        <h1 className="text-3xl font-bold">Preparación de Pedido {order.number}</h1>
        <div className="text-lg text-primary font-medium">{order.customer?.name}</div>
      </div>

      <div className="flex items-center gap-2 mb-8 text-sm font-medium text-muted-foreground">
        <span className={currentStep === 1 ? "text-primary" : ""}>1. Selección</span>
        <ChevronRight className="h-4 w-4" />
        <span className={currentStep === 2 ? "text-primary" : ""}>2. Asignación</span>
        <ChevronRight className="h-4 w-4" />
        <span className={currentStep === 3 ? "text-primary" : ""}>3. Confirmar</span>
      </div>

      <div className="mb-8 min-h-[400px]">
        {currentStep === 1 && (
          <PickingStep1 
            order={order} 
            selectedLineIds={selectedLineIds} 
            onToggleLine={toggleLine} 
          />
        )}
        {currentStep === 2 && (
          <PickingStep2 
            selectedLines={selectedLines}
            assignments={assignments}
            onAssign={updateAssignment}
          />
        )}
        {currentStep === 3 && (
          <PickingStep3 
            selectedLines={selectedLines}
            assignments={assignments}
          />
        )}
      </div>

      <div className="flex justify-between border-t pt-6">
        <Button 
          variant="outline" 
          onClick={() => currentStep > 1 ? setCurrentStep(curr => curr - 1) : navigate('/shipments')}
          disabled={isSubmitting}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          {currentStep === 1 ? 'Cancelar' : 'Atrás'}
        </Button>

        {currentStep < 3 ? (
          <Button 
            onClick={() => setCurrentStep(curr => curr + 1)}
            // VALIDACIÓN DE PASOS
            disabled={
              (currentStep === 1 && selectedLineIds.length === 0) ||
              (currentStep === 2 && !canAdvanceFromStep2) // <--- Bloqueo si hay errores
            }
          >
            Siguiente
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button 
            onClick={handleSubmit} 
            className="bg-green-600 hover:bg-green-700 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
            Confirmar Envío
          </Button>
        )}
      </div>
    </div>
  );
}