/**
 * PlotFieldDetailPage - Página de detalles de un campo con gestor de parcelas
 */

import { useParams, useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, MapPin, Ruler, User } from 'lucide-react';
import PlotsEditor from '../components/PlotsEditor';
import { useFields } from '@/modules/Fields/hooks/useFields';
import type { Field } from '@/lib/map-types';

export function PlotFieldDetailPage() {
  const { fieldId } = useParams<{ fieldId: string }>();
  const navigate = useNavigate();
  const { getFieldById } = useFields();
  
  const [field, setField] = useState<Field | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchField = async () => {
      if (!fieldId) {
        setError('ID del campo no proporcionado');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const fieldData = await getFieldById(fieldId);
        
        // Convertir al tipo Field de map-types
        let convertedField = fieldData as unknown as Field;
        
        // El backend ya trae los plots en la respuesta si están asociados
        // No necesitamos actualizar con usePlots que puede traer todos los plots del sistema
        
        setField(convertedField);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setError(errorMessage);
        console.error('Error al obtener campo:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchField();
  }, [fieldId, getFieldById]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !field) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <Button variant="outline" onClick={() => navigate('/fields')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <Card className="bg-destructive/10">
          <CardContent className="pt-6">
            <p className="text-destructive">{error || 'Campo no encontrado'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="outline" onClick={() => navigate('/fields')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Campos
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">{field.name}</CardTitle>
            <CardDescription>{field.address}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Área */}
              <div className="flex items-start gap-3">
                <Ruler className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Área Total</p>
                  <p className="text-lg font-semibold">{field.area} m²</p>
                </div>
              </div>

              {/* Parcelas */}
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Parcelas</p>
                  <p className="text-lg font-semibold">{field.plots?.length || 0}</p>
                </div>
              </div>

              {/* Encargado */}
              {field.managerId && (
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Encargado</p>
                    <p className="text-sm font-semibold">{(field as any).manager?.name || 'No asignado'}</p>
                  </div>
                </div>
              )}

              {/* Ubicación */}
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tipo de Ubicación</p>
                  <Badge variant="outline">{field.location?.type || 'Desconocido'}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gestor de Parcelas */}
      {field && <PlotsEditor field={field} />}
    </div>
  );
}

export default PlotFieldDetailPage;
