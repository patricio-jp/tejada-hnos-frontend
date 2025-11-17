import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import type { Variety, CreateVarietyDto, UpdateVarietyDto } from '@/types';

interface VarietyFormProps {
  variety?: Variety;
  onSubmit: (data: CreateVarietyDto | UpdateVarietyDto) => Promise<void>;
  onCancel: () => void;
}

export function VarietyForm({ variety, onSubmit, onCancel }: VarietyFormProps) {
  const [formData, setFormData] = useState({
    name: variety?.name || '',
    description: variety?.description || '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Manejar el envío del formulario.
   * Discrimina entre diferentes tipos de error para mostrar mensajes apropiados al usuario.
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
      } else if (errorMessage.includes('Ya existe')) {
        setError('Ya existe una variedad con ese nombre. Por favor, elige otro nombre.');
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
          placeholder="Ej: Chandler"
        />
      </div>

      <div>
        <Label htmlFor="description">Descripción</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Ej: Variedad de nogal californiano"
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
            variety ? 'Actualizar' : 'Crear'
          )}
        </Button>
      </div>
    </form>
  );
}
