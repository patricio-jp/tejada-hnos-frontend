import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Customer, CreateCustomerDto, UpdateCustomerDto } from '../types/customer';

interface CustomerFormProps {
  customer?: Customer;
  onSubmit: (data: CreateCustomerDto | UpdateCustomerDto) => Promise<void>;
  onCancel: () => void;
}

/**
 * Formulario para crear/editar clientes.
 * 
 * Características:
 * - Validación de campos requeridos
 * - Estado de loading con spinner visual
 * - Notificaciones toast para feedback visual
 * - Discriminación de errores por tipo (CUIT duplicado, validación, timeout, red, auth)
 * - Mensajes de error específicos y llamativos
 * - Prevención de doble submit
 */
export function CustomerForm({ customer, onSubmit, onCancel }: CustomerFormProps) {
  const [formData, setFormData] = useState({
    name: customer?.name || '',
    taxId: customer?.taxId || '',
    address: customer?.address || '',
    contactEmail: customer?.contactEmail || '',
    phoneNumber: customer?.phoneNumber || '',
  });

  const [loading, setLoading] = useState(false);

  /**
   * Manejar el envío del formulario.
   * Muestra toasts específicos según el tipo de error o éxito.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit(formData);
      
      // ✅ Toast de éxito
      toast.success(
        customer ? '✓ Cliente actualizado' : '✓ Cliente creado',
        {
          description: customer 
            ? `Se actualizó "${formData.name}" correctamente` 
            : `Se creó "${formData.name}" exitosamente`,
          duration: 3000,
        }
      );
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      
      // 🔴 Error: CUIT/CUIL duplicado (crear o actualizar)
      if (errorMessage.includes('cliente con ese CUIT') || errorMessage.includes('otro cliente con ese CUIT')) {
        toast.error('❌ CUIT/CUIL duplicado', {
          description: `El CUIT/CUIL "${formData.taxId}" ya está registrado en el sistema`,
          duration: 5000,
          style: {
            background: '#DC2626',
            color: 'white',
            border: '2px solid #B91C1C',
            fontWeight: '500',
          },
        });
        return;
      }
      
      // 🔴 Error: Nombre duplicado (crear o actualizar)
      if (errorMessage.includes('cliente con ese nombre') || errorMessage.includes('otro cliente con ese nombre')) {
        toast.error('❌ Nombre duplicado', {
          description: `El nombre "${formData.name}" ya está registrado en el sistema`,
          duration: 5000,
          style: {
            background: '#DC2626',
            color: 'white',
            border: '2px solid #B91C1C',
            fontWeight: '500',
          },
        });
        return;
      }
      
      // 🔴 Error: Validación general
      if (errorMessage.includes('validación')) {
        toast.error('❌ Error de validación', {
          description: errorMessage.replace('Error de validación: ', ''),
          duration: 5000,
          style: {
            background: '#DC2626',
            color: 'white',
          },
        });
        return;
      }
      
      // ⏱️ Error: Timeout
      if (errorMessage.includes('Timeout')) {
        toast.error('⏱️ Tiempo de espera agotado', {
          description: 'El servidor tardó demasiado en responder. Por favor, intenta nuevamente.',
          duration: 5000,
        });
        return;
      }
      
      // 🔒 Error: Sesión expirada
      if (errorMessage.includes('autenticación')) {
        toast.error('🔒 Sesión expirada', {
          description: 'Por favor, inicia sesión nuevamente',
          duration: 5000,
        });
        return;
      }
      
      // 📡 Error: Conexión
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('network')) {
        toast.error('📡 Error de conexión', {
          description: 'Verifica tu conexión a internet y vuelve a intentar',
          duration: 5000,
        });
        return;
      }
      
      // 🔴 Error genérico
      toast.error('❌ Error al guardar', {
        description: errorMessage,
        duration: 5000,
      });
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nombre *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          placeholder="Ej: Super S.A."
        />
      </div>

      <div>
        <Label htmlFor="taxId">CUIT/CUIL</Label>
        <Input
          id="taxId"
          value={formData.taxId}
          onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
          placeholder="Ej: 20-12345678-9"
        />
      </div>

      <div>
        <Label htmlFor="address">Dirección</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="Ej: Av. Principal 123"
        />
      </div>

      <div>
        <Label htmlFor="contactEmail">Email de Contacto</Label>
        <Input
          id="contactEmail"
          type="email"
          value={formData.contactEmail}
          onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
          placeholder="Ej: contacto@super.com"
        />
      </div>

      <div>
        <Label htmlFor="phoneNumber">Teléfono</Label>
        <Input
          id="phoneNumber"
          value={formData.phoneNumber}
          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
          placeholder="Ej: +54 11 1234-5678"
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            customer ? 'Actualizar' : 'Crear'
          )}
        </Button>
      </div>
    </form>
  );
}
