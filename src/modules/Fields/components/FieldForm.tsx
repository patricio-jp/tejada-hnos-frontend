import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useCapataces } from '../hooks/useUsers';
import type { Field } from '@/lib/map-types';
import type { CreateFieldDto, UpdateFieldDto } from '../utils/field-api';

interface FieldFormProps {
  field?: Field;
  onSubmit: (data: CreateFieldDto | UpdateFieldDto) => Promise<void>;
  onCancel: () => void;
  initialLocation?: any;
}

export function FieldForm({ field, onSubmit, onCancel, initialLocation }: FieldFormProps) {
  const { capataces, loading: loadingCapataces } = useCapataces();
  
  const [formData, setFormData] = useState({
    name: field?.boundary?.properties?.name || '',
    address: field?.address || '',
    area: field?.area || 0,
    managerId: field?.managerId || '',
    location: field?.location || initialLocation || null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialLocation && !field) {
      setFormData(prev => ({ ...prev, location: initialLocation }));
    }
  }, [initialLocation, field]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('El nombre es obligatorio');
      return;
    }
    
    if (formData.name.length < 3) {
      setError('El nombre debe tener al menos 3 caracteres');
      return;
    }
    
    if (formData.area <= 0) {
      setError('El área debe ser mayor a 0');
      return;
    }
    
    if (!formData.location) {
      setError('Debe dibujar el campo en el mapa');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const submitData = field ? {
        name: formData.name,
        address: formData.address,
        area: formData.area,
        managerId: formData.managerId || null,
        location: formData.location,
      } : {
        name: formData.name,
        address: formData.address,
        area: formData.area,
        location: formData.location,
        ...(formData.managerId && { managerId: formData.managerId }),
      };

      await onSubmit(submitData as any);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      
      if (errorMessage.includes('validación')) {
        setError(`Error de validación: ${errorMessage}`);
      } else if (errorMessage.includes('Ya existe')) {
        setError('Ya existe un campo con ese nombre.');
      } else if (errorMessage.includes('no fue encontrado')) {
        setError('El capataz seleccionado no existe.');
      } else if (errorMessage.includes('no tiene el rol')) {
        setError('El usuario seleccionado no es CAPATAZ.');
      } else if (errorMessage.includes('autenticación')) {
        setError('Sesión expirada. Inicia sesión nuevamente.');
      } else if (errorMessage.includes('Failed to fetch')) {
        setError('Error de conexión. Verifica tu internet.');
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
        <Label htmlFor="name">Nombre del Campo *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Ej: Campo Norte"
          required
          disabled={loading}
        />
      </div>

      <div>
        <Label htmlFor="address">Dirección *</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="Ej: Ruta 40 Km 120"
          required
          disabled={loading}
        />
      </div>

      <div>
        <Label htmlFor="area">Área (hectáreas) *</Label>
        <Input
          id="area"
          type="number"
          step="0.01"
          min="0.01"
          value={formData.area}
          onChange={(e) => setFormData({ ...formData, area: parseFloat(e.target.value) || 0 })}
          placeholder="Ej: 50.5"
          required
          disabled={loading}
        />
      </div>

      <div>
        <Label htmlFor="managerId">Capataz Encargado (Opcional)</Label>
        <select
          id="managerId"
          value={formData.managerId}
          onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          disabled={loading || loadingCapataces}
        >
          <option value="">-- Sin asignar --</option>
          {capataces.map(capataz => (
            <option key={capataz.id} value={capataz.id}>
              {capataz.name} {capataz.lastName}
            </option>
          ))}
        </select>
        {loadingCapataces && (
          <p className="text-xs text-muted-foreground mt-1">Cargando capataces...</p>
        )}
      </div>

      {!formData.location && (
        <div className="p-3 border border-yellow-500 rounded bg-yellow-50 dark:bg-yellow-950">
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            ⚠️ Dibuja el campo en el mapa antes de guardar
          </p>
        </div>
      )}

      {error && (
        <div className="p-3 border border-red-500 rounded bg-red-50 dark:bg-red-950">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading || !formData.location}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            field ? 'Actualizar' : 'Crear Campo'
          )}
        </Button>
      </div>
    </form>
  );
}
