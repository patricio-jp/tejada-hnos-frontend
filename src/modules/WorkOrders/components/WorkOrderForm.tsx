import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import useAuth from '@/modules/Auth/hooks/useAuth';
import plotApi from '../utils/plot-api';
import { userApi } from '../utils/user-api';
import type { CreateWorkOrderDTO, User } from '@/types';

type WorkOrderFormProps = {
  onSubmit?: (payload: WorkOrderFormData) => Promise<void> | void;
  onCancel?: () => void;
};

export type WorkOrderFormData = CreateWorkOrderDTO & {
  assignedToId?: string;
};

type PlotOption = {
  id: string;
  name: string;
  fieldId?: string;
  fieldName?: string;
  managerIds?: string[];
};

function toStringArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .filter((item) => item !== undefined && item !== null)
      .map((item) => String(item));
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [String(value)];
}

function asString(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return undefined;
}

function normalizePlots(rawPlots: unknown[]): PlotOption[] {
  return rawPlots
    .map((raw) => {
      const item = raw as Record<string, unknown>;
      const properties = (item.properties as Record<string, unknown> | undefined) ?? {};
      const field = properties.field as Record<string, unknown> | undefined;

      const id = asString(item.id) ?? asString(properties.id);
      const name = asString(properties.name) ?? asString(item.name);

      if (!id || !name) return null;

      const option: PlotOption = {
        id,
        name,
        fieldId:
          asString(item.fieldId) ??
          asString(properties.fieldId) ??
          asString(properties.field_id) ??
          asString(field?.id),
        fieldName:
          asString(item.fieldName) ??
          asString(properties.fieldName) ??
          asString(field?.name),
        managerIds: Array.from(
          new Set([
            ...toStringArray(item.managerIds),
            ...toStringArray(item.managerId),
            ...toStringArray(item.capatazId),
            ...toStringArray(item.capatazIds),
            ...toStringArray(properties.managerIds),
            ...toStringArray(properties.capatazIds),
            ...toStringArray(field?.managerIds),
            ...toStringArray(field?.capatazIds),
          ].filter(Boolean)),
        ),
      };

      if (!option.managerIds?.length) {
        option.managerIds = undefined;
      }

      return option;
    })
    .filter((item): item is PlotOption => item !== null);
}

export function WorkOrderForm({ onSubmit, onCancel }: WorkOrderFormProps) {
  const navigate = useNavigate();
  const auth = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [selectedPlotIds, setSelectedPlotIds] = useState<string[]>([]);
  const [assignedToId, setAssignedToId] = useState<string>('');

  const [plots, setPlots] = useState<PlotOption[]>([]);
  const [loadingPlots, setLoadingPlots] = useState(true);
  const [plotsError, setPlotsError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const role = (auth.accessPayload?.role as string | undefined) ?? 'ADMIN';

  useEffect(() => {
    let cancelled = false;

    async function loadPlots() {
      setLoadingPlots(true);
      setPlotsError(null);
      try {
        const data = await plotApi.getAll(auth.accessToken);
        const normalized = normalizePlots(data as unknown[]);
        if (!cancelled) {
          setPlots(normalized);
        }
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : 'No se pudieron cargar las parcelas';
          setPlotsError(message);
        }
      } finally {
        if (!cancelled) {
          setLoadingPlots(false);
        }
      }
    }

    void loadPlots();
    return () => {
      cancelled = true;
    };
  }, [auth.accessToken]);

  const accessiblePlots = plots;

  useEffect(() => {
    let cancelled = false;

    async function loadUsers() {
      setLoadingUsers(true);
      setUsersError(null);
      try {
        const data = await userApi.getAllUsers(auth.accessToken ?? '');
        if (!cancelled) {
          setUsers(data);
        }
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : 'No se pudieron cargar los usuarios';
          setUsersError(message);
        }
      } finally {
        if (!cancelled) {
          setLoadingUsers(false);
        }
      }
    }

    if (auth.accessToken) {
      void loadUsers();
    } else {
      setLoadingUsers(false);
    }

    return () => {
      cancelled = true;
    };
  }, [auth.accessToken]);

  const assignableUsers = useMemo(() => {
    return users.filter((user) => user.role === 'CAPATAZ' || user.role === 'OPERARIO');
  }, [users]);

  useEffect(() => {
    const visibleIds = new Set(accessiblePlots.map((plot) => plot.id));
    setSelectedPlotIds((prev) => prev.filter((id) => visibleIds.has(id)));
  }, [accessiblePlots]);

  const togglePlotSelection = (plotId: string) => {
    setSelectedPlotIds((prev) => {
      if (prev.includes(plotId)) {
        return prev.filter((id) => id !== plotId);
      }
      return [...prev, plotId];
    });
  };

  const isValid =
  title.trim().length > 0 &&
  description.trim().length > 0 &&
  scheduledDate.trim().length > 0 &&
  dueDate.trim().length > 0 &&
  selectedPlotIds.length > 0;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!isValid) {
      setFormError('Completa todos los campos obligatorios y selecciona al menos una parcela.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit?.({
        title: title.trim(),
        description: description.trim(),
        scheduledDate,
        dueDate,
        plotIds: selectedPlotIds,
        assignedToId: assignedToId || undefined,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo guardar la orden de trabajo';
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate('/work-orders');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2 space-y-2">
          <Label htmlFor="title">Título *</Label>
          <Input
            id="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ej: Aplicación de fertilizante"
            required
          />
        </div>

        <div className="sm:col-span-2 space-y-2">
          <Label htmlFor="description">Descripción *</Label>
          <textarea
            id="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Describe el trabajo a realizar"
            className="min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="scheduledDate">Fecha programada *</Label>
          <Input
            id="scheduledDate"
            type="date"
            value={scheduledDate}
            onChange={(event) => setScheduledDate(event.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dueDate">Fecha límite *</Label>
          <Input
            id="dueDate"
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="assignedTo">Asignar a (Opcional)</Label>
          <select
            id="assignedTo"
            value={assignedToId}
            onChange={(event) => setAssignedToId(event.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
            disabled={loadingUsers || !!usersError}
          >
            <option value="">Sin asignar</option>
            {assignableUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} {user.lastName}
              </option>
            ))}
          </select>
          {loadingUsers && (
            <p className="text-xs text-muted-foreground">Cargando usuarios...</p>
          )}
          {usersError && (
            <p className="text-xs text-destructive">{usersError}</p>
          )}
        </div>

        <div>
          <Label>Parcelas *</Label>
          <p className="text-sm text-muted-foreground">
            Selecciona las parcelas donde se ejecutará la orden de trabajo.
          </p>
        </div>

        {loadingPlots ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Cargando parcelas...
          </div>
        ) : plotsError ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {plotsError}
          </div>
        ) : accessiblePlots.length === 0 ? (
          <div className="rounded-md border border-dashed border-muted px-3 py-4 text-sm text-muted-foreground">
            {role === 'CAPATAZ'
              ? 'No se encontraron parcelas asignadas a tus campos. Contacta al administrador si crees que es un error.'
              : 'No hay parcelas disponibles en el sistema.'}
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {accessiblePlots
              .slice()
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((plot) => {
              const checked = selectedPlotIds.includes(plot.id);
              const subtitle = plot.fieldName;

              return (
                <label
                  key={plot.id}
                  className="flex cursor-pointer items-center gap-3 rounded-md border border-input px-3 py-2 text-sm transition hover:border-ring"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={checked}
                    onChange={() => togglePlotSelection(plot.id)}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">{plot.name}</span>
                    {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {formError && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {formError}
        </div>
      )}

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="outline" onClick={handleCancel} disabled={submitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={!isValid || submitting || loadingPlots}>
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...
            </>
          ) : (
            'Guardar'
          )}
        </Button>
      </div>
    </form>
  );
}

export default WorkOrderForm;
