/**
 * PlotForm - Formulario reutilizable para crear/editar plots
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import type { Plot } from '@/types/plots';
import type { Variety } from '@/types/varieties';
import type { UpdatePlotDto, CreatePlotDto } from '../utils/plot-api';

interface PlotFormProps {
  plot?: Plot;
  varieties: Variety[];
  loading?: boolean;
  onSubmit: (data: CreatePlotDto | UpdatePlotDto) => Promise<void>;
}

export function PlotForm({ plot, varieties, loading = false, onSubmit }: PlotFormProps) {
  const [formData, setFormData] = useState({
    name: plot?.name || '',
    area: plot?.area || 0,
    varietyId: plot?.varietyId || '',
    datePlanted: plot?.datePlanted ? new Date(plot.datePlanted).toISOString().split('T')[0] : '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (plot) {
      setFormData({
        name: plot.name,
        area: plot.area,
        varietyId: plot.varietyId || '',
        datePlanted: plot.datePlanted ? new Date(plot.datePlanted).toISOString().split('T')[0] : '',
      });
    }
  }, [plot]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    } else if (formData.name.length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    }

    if (formData.area <= 0) {
      newErrors.area = 'El área debe ser mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error al guardar plot:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Nombre */}
      <div className="space-y-2">
        <Label htmlFor="name">Nombre de la Parcela *</Label>
        <Input
          id="name"
          placeholder="Ej: Parcela A1"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          disabled={isSubmitting || loading}
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
      </div>

      {/* Área */}
      <div className="space-y-2">
        <Label htmlFor="area">Área (m²) *</Label>
        <Input
          id="area"
          type="number"
          placeholder="Ej: 1000"
          step="0.01"
          value={formData.area}
          onChange={(e) => setFormData({ ...formData, area: parseFloat(e.target.value) || 0 })}
          disabled={isSubmitting || loading}
        />
        {errors.area && <p className="text-sm text-destructive">{errors.area}</p>}
      </div>

      {/* Variedad */}
      <div className="space-y-2">
        <Label htmlFor="variety">Variedad (Opcional)</Label>
        <select
          id="variety"
          value={formData.varietyId || ''}
          onChange={(e) => setFormData({ ...formData, varietyId: e.target.value || '' })}
          disabled={isSubmitting || loading}
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
        >
          <option value="">Sin variedad</option>
          {varieties.map(variety => (
            <option key={variety.id} value={variety.id}>
              {variety.name}
            </option>
          ))}
        </select>
      </div>

      {/* Fecha de Plantación */}
      <div className="space-y-2">
        <Label htmlFor="datePlanted">Fecha de Plantación (Opcional)</Label>
        <Input
          id="datePlanted"
          type="date"
          value={formData.datePlanted}
          onChange={(e) => setFormData({ ...formData, datePlanted: e.target.value })}
          disabled={isSubmitting || loading}
        />
      </div>

      {/* Botón de Submit */}
      <Button type="submit" disabled={isSubmitting || loading} className="w-full">
        {isSubmitting || loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Guardando...
          </>
        ) : (
          plot ? 'Actualizar Parcela' : 'Crear Parcela'
        )}
      </Button>
    </form>
  );
}

export default PlotForm;
