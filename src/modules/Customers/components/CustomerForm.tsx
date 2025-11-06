import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import type { Customer, CreateCustomerDto, UpdateCustomerDto } from '../types/customer';

interface CustomerFormProps {
  customer?: Customer;
  onSubmit: (data: CreateCustomerDto | UpdateCustomerDto) => Promise<void>;
  onCancel: () => void;
}

export function CustomerForm({ customer, onSubmit, onCancel }: CustomerFormProps) {
  const [formData, setFormData] = useState({
    name: customer?.name || '',
    taxId: customer?.taxId || '',
    address: customer?.address || '',
    contactEmail: customer?.contactEmail || '',
    phoneNumber: customer?.phoneNumber || '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Manejar el envío del formulario.
   * Discrimina entre errores de validación y errores de red para mostrar mensajes apropiados.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSubmit(formData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      
      // Discriminar tipos de error para mostrar mensajes más útiles
      if (errorMessage.includes('validación')) {
        setError(`Error de validación: ${errorMessage}`);
      } else if (errorMessage.includes('Timeout')) {
        setError('El servidor está tardando demasiado en responder. Por favor, intenta nuevamente.');
      } else if (errorMessage.includes('autenticación')) {
        setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
      } else if (errorMessage.includes('Failed to fetch') || errorMessage.includes('network')) {
        setError('Error de conexión. Verifica tu conexión a internet y vuelve a intentar.');
      } else {
        setError(errorMessage);
      }
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

      {error && (
        <div className="text-sm text-destructive">{error}</div>
      )}

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
