# Guía de Testing Automatizado - Módulo de Actividades

## Instalación de Dependencias

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

## Configuración de Vitest

### 1. Crear `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### 2. Crear `src/test/setup.ts`:

```typescript
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

// Cleanup después de cada test
afterEach(() => {
  cleanup();
});

// Mock window.api
global.window.api = {
  ping: vi.fn(),
  getAppVersion: vi.fn(),
  getActivityLogs: vi.fn(),
  createActivityLog: vi.fn(),
  updateActivityLog: vi.fn(),
  deleteActivityLog: vi.fn(),
  invoke: vi.fn(),
};
```

### 3. Actualizar `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

## Ejemplo de Test 1: Hook useActivities

Crear `src/modules/Activities/hooks/__tests__/useActivities.test.ts`:

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useActivities } from '../useActivities';

describe('useActivities', () => {
  const mockActivities = [
    {
      id: '1',
      activityType: 'riego',
      description: 'Test activity',
      executionDate: new Date('2025-10-25'),
      createdAt: new Date('2025-10-20'),
      updatedAt: new Date('2025-10-20'),
      plotId: 'plot-1',
      createdByUserId: 'user-1',
      status: 'pendiente',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch activities on mount', async () => {
    window.api.getActivityLogs = vi.fn().mockResolvedValue(mockActivities);

    const { result } = renderHook(() => useActivities());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.activities).toEqual(mockActivities);
    expect(window.api.getActivityLogs).toHaveBeenCalledTimes(1);
  });

  it('should handle errors when fetching activities', async () => {
    window.api.getActivityLogs = vi.fn().mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useActivities());

    await waitFor(() => {
      expect(result.current.error).toBe('Error al cargar las actividades');
    });
  });

  it('should add a new activity', async () => {
    const newActivity = { ...mockActivities[0], id: '2' };
    window.api.getActivityLogs = vi.fn().mockResolvedValue([]);
    window.api.createActivityLog = vi.fn().mockResolvedValue(newActivity);

    const { result } = renderHook(() => useActivities());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await result.current.addActivity(newActivity);

    expect(result.current.allActivities).toContainEqual(newActivity);
  });
});
```

## Ejemplo de Test 2: Componente ActivityFormDialog

Crear `src/modules/Activities/components/__tests__/ActivityFormDialog.test.tsx`:

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ActivityFormDialog } from '../ActivityFormDialog';

describe('ActivityFormDialog', () => {
  const mockOnSave = vi.fn();
  const mockOnOpenChange = vi.fn();

  it('should render the form when open', () => {
    render(
      <ActivityFormDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText('Nueva Actividad')).toBeInTheDocument();
    expect(screen.getByLabelText(/Tipo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Descripción/i)).toBeInTheDocument();
  });

  it('should show validation error when submitting empty form', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(
      <ActivityFormDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSave={mockOnSave}
      />
    );

    const submitButton = screen.getByText('Crear Actividad');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Por favor complete todos los campos requeridos');
    });

    alertSpy.mockRestore();
  });

  it('should call onSave with correct data when form is valid', async () => {
    render(
      <ActivityFormDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSave={mockOnSave}
      />
    );

    // Llenar formulario
    const descriptionInput = screen.getByLabelText(/Descripción/i);
    fireEvent.change(descriptionInput, { target: { value: 'Test description' } });

    const plotInput = screen.getByLabelText(/Parcela/i);
    fireEvent.change(plotInput, { target: { value: 'plot-123' } });

    const submitButton = screen.getByText('Crear Actividad');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalled();
    });
  });

  it('should show "Editar Actividad" when editing', () => {
    const mockActivity = {
      id: '1',
      activityType: 'riego',
      description: 'Test',
      executionDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      plotId: 'plot-1',
      createdByUserId: 'user-1',
      status: 'pendiente',
    };

    render(
      <ActivityFormDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSave={mockOnSave}
        activity={mockActivity}
      />
    );

    expect(screen.getByText('Editar Actividad')).toBeInTheDocument();
  });
});
```

## Ejemplo de Test 3: Componente ActivityFeed

Crear `src/modules/Activities/components/__tests__/ActivityFeed.test.tsx`:

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ActivityFeed } from '../ActivityFeed';

// Mock del hook useActivities
vi.mock('../../hooks/useActivities', () => ({
  useActivities: vi.fn(),
}));

import { useActivities } from '../../hooks/useActivities';

describe('ActivityFeed', () => {
  it('should show loading state', () => {
    vi.mocked(useActivities).mockReturnValue({
      activities: [],
      loading: true,
      error: null,
    } as any);

    render(<ActivityFeed />);

    // Verificar que hay skeletons de carga
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should show error message when there is an error', () => {
    vi.mocked(useActivities).mockReturnValue({
      activities: [],
      loading: false,
      error: 'Error al cargar',
    } as any);

    render(<ActivityFeed />);

    expect(screen.getByText(/Error al cargar las actividades recientes/i)).toBeInTheDocument();
  });

  it('should show empty state when no activities', () => {
    vi.mocked(useActivities).mockReturnValue({
      activities: [],
      loading: false,
      error: null,
    } as any);

    render(<ActivityFeed />);

    expect(screen.getByText(/No hay actividades recientes/i)).toBeInTheDocument();
  });

  it('should render activities when loaded', () => {
    const mockActivities = [
      {
        id: '1',
        activityType: 'riego',
        description: 'Test activity 1',
        executionDate: new Date('2025-10-25'),
        createdAt: new Date('2025-10-20'),
        updatedAt: new Date('2025-10-20'),
        plotId: 'plot-1',
        createdByUserId: 'user-1',
        status: 'pendiente',
      },
    ];

    vi.mocked(useActivities).mockReturnValue({
      activities: mockActivities,
      loading: false,
      error: null,
    } as any);

    render(<ActivityFeed />);

    expect(screen.getByText('Test activity 1')).toBeInTheDocument();
  });
});
```

## Ejecutar los Tests

```bash
# Ejecutar todos los tests
npm test

# Ejecutar en modo watch
npm test -- --watch

# Ejecutar con UI
npm run test:ui

# Generar cobertura
npm run test:coverage
```

## Tests de Integración E2E con Playwright (Opcional)

```bash
npm install -D @playwright/test
```

Crear `tests/activities.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Activities Module', () => {
  test.beforeEach(async ({ page }) => {
    // Asegurarse de que el backend está corriendo
    await page.goto('http://localhost:5173');
  });

  test('should load and display activities', async ({ page }) => {
    await page.goto('http://localhost:5173/activities');
    
    // Esperar a que carguen las actividades
    await page.waitForSelector('[data-testid="activity-card"]');
    
    // Verificar que hay actividades
    const activities = await page.locator('[data-testid="activity-card"]').count();
    expect(activities).toBeGreaterThan(0);
  });

  test('should create a new activity', async ({ page }) => {
    await page.goto('http://localhost:5173/activities');
    
    // Abrir formulario
    await page.click('text=Nueva Actividad');
    
    // Llenar formulario
    await page.selectOption('[id="activityType"]', 'riego');
    await page.fill('[id="description"]', 'Test automated activity');
    await page.fill('[id="plotId"]', 'test-plot-123');
    await page.fill('[id="executionDate"]', '2025-10-30');
    
    // Guardar
    await page.click('text=Crear Actividad');
    
    // Verificar que se creó
    await expect(page.locator('text=Test automated activity')).toBeVisible();
  });
});
```
