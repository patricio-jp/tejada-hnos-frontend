import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { MOCK_ORDERS } from '@/lib/mock-picking-data';
import { Loader2, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { pickingService } from '../services/picking-service';
import type { CreateShipmentDto } from '@/types/picking'; // <--- IMPORTAR TIPO

// Pasos
import { PickingStep1 } from '../components/picking/PickingStep1';
import { PickingStep2 } from '../components/picking/PickingStep2';
import { PickingStep3 } from '../components/picking/PickingStep3';

export default function ShipmentWizardPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Cargar la orden (Mock por ahora para la UI inicial)
  const order = useMemo(() => 
    MOCK_ORDERS.find(o => o.id === orderId), 
  [orderId]);

  // 2. Estado del Wizard
  const [selectedLineIds, setSelectedLineIds] = useState<string[]>([]);
  // Estructura: { [lineId]: { [lotId]: cantidad } }
  const [assignments, setAssignments] = useState<Record<string, Record<string, number>>>({});

  if (!order) return <div className="p-8 text-center">Pedido no encontrado</div>;

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
        [lotId]: qty
      }
    }));
  };

  const handleSubmit = async () => {
    if (!order) return;
    setIsSubmitting(true);
    
    try {
      // 1. Transformar el estado de la UI (assignments) al DTO que espera el backend
      // assignments es { lineId: { lotId: qty } }
      // DTO necesita un array plano: [{ quantity, lotId, lineId }]
      
      const lotDetails: { salesOrderDetailId: string; harvestLotId: string; quantityTakenKg: number }[] = [];
      
      for (const [lineId, lotAssignments] of Object.entries(assignments)) {
        for (const [lotId, qty] of Object.entries(lotAssignments)) {
          if (qty > 0) {
            lotDetails.push({
              salesOrderDetailId: lineId,
              harvestLotId: lotId,
              quantityTakenKg: qty
            });
          }
        }
      }

      // Validación simple: asegurar que hay algo que enviar
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

      console.log("🚀 Enviando Picking...", payload);

      // 2. Llamar al servicio (Simula Backend)
      await pickingService.submitShipment(payload);
      
      toast.success(`Envío registrado exitosamente. Pedido actualizado.`);
      
      // 3. Volver a la lista
      navigate('/shipments');

    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Error al procesar el envío");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Render ---
  
  const selectedLines = order.details.filter(d => selectedLineIds.includes(d.id!));

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      {/* Header Simple */}
      <div className="mb-8">
        <div className="text-sm text-muted-foreground mb-1">Nueva Salida de Mercadería</div>
        <h1 className="text-3xl font-bold">Preparación de Pedido {order.number}</h1>
        <div className="text-lg text-primary font-medium">{order.customer?.name}</div>
      </div>

      {/* Contenido del Paso */}
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

      {/* Botonera de Navegación */}
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
            disabled={currentStep === 1 && selectedLineIds.length === 0}
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