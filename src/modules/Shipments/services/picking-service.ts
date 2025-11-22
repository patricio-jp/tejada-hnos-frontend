import { MOCK_INVENTORY, MOCK_ORDERS } from "@/lib/mock-picking-data";
import type { CreateShipmentDto } from "@/types/picking";
import { SalesOrderStatus, SalesOrderDetailStatus } from "@/types/sales";

const LATENCY_MS = 1000; // Simular demora de red

export const pickingService = {
  /**
   * Simula el endpoint POST /api/shipments (Requerimiento B2.10)
   */
  async submitShipment(dto: CreateShipmentDto): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          // 1. Buscar el Pedido
          const order = MOCK_ORDERS.find(o => o.id === dto.salesOrderId);
          if (!order) throw new Error("Pedido no encontrado");

          // 2. Procesar cada línea de asignación (ShipmentLotDetail)
          dto.lotDetails.forEach(detail => {
            // a. Buscar Lote de Inventario
            const lot = MOCK_INVENTORY.find(l => l.id === detail.harvestLotId);
            if (!lot) throw new Error(`Lote ${detail.harvestLotId} no encontrado`);

            // b. Validar Stock (B2.10.b.i)
            if (lot.remainingNetWeightKg < detail.quantityTakenKg) {
              throw new Error(`Stock insuficiente en lote ${lot.code}. Disponible: ${lot.remainingNetWeightKg}, Solicitado: ${detail.quantityTakenKg}`);
            }

            // c. Buscar Línea de Pedido
            const line = order.details.find(d => d.id === detail.salesOrderDetailId);
            if (!line) throw new Error("Línea de pedido no encontrada");

            // --- EJECUCIÓN DE LA TRANSACCIÓN SIMULADA ---

            // d. Actualizar Inventario (B2.10.b.iv)
            lot.remainingNetWeightKg -= detail.quantityTakenKg;

            // e. Actualizar Pedido (B2.10.b.v)
            const shippedBefore = line.quantityShipped || 0;
            line.quantityShipped = shippedBefore + detail.quantityTakenKg;

            // f. Actualizar Estado de la Línea
            const pending = line.quantityKg - line.quantityShipped;
            
            if (pending <= 0.01) { // Usamos un margen pequeño por decimales
              line.status = SalesOrderDetailStatus.COMPLETA;
            } else {
              line.status = SalesOrderDetailStatus.DESPACHADA_PARCIAL;
            }
          });

          // 3. Actualizar Estado de la Orden (SalesOrder Header)
          const allComplete = order.details.every(d => d.status === SalesOrderDetailStatus.COMPLETA);
          const anyPartial = order.details.some(d => d.status === SalesOrderDetailStatus.DESPACHADA_PARCIAL || d.status === SalesOrderDetailStatus.COMPLETA);

          if (allComplete) {
            order.status = SalesOrderStatus.DESPACHADA_TOTAL;
          } else if (anyPartial) {
            order.status = SalesOrderStatus.DESPACHADA_PARCIAL;
          }

          console.log("✅ Picking completado con éxito. Datos actualizados:", {
            orderStatus: order.status,
            inventory: MOCK_INVENTORY.map(l => ({ code: l.code, stock: l.remainingNetWeightKg }))
          });

          resolve();

        } catch (error) {
          console.error("❌ Error en picking service:", error);
          reject(error);
        }
      }, LATENCY_MS);
    });
  }
};