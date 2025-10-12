# Instrucciones para proyecto Tejada (Web + Capacitor + Electron)

Resumen rápido: esta guía explica cómo instalar, desarrollar y empaquetar la aplicación en su estado actual (React + Vite + Capacitor + Electron). Incluye scripts relevantes, flujos de desarrollo y troubleshooting.

## Checklist inicial
- Node.js >= 18
- Ejecutar `npm install` en la raíz del proyecto
- Conocer los scripts en `package.json` (dev, build, electron:dev, electron:build)

---

## Requisitos
- Node.js >= 18
- npm
- (Opcional) herramientas para firmar/notarizar cuando empaquetes para macOS/Windows

## Instalación
```bash
npm install
```

## Estructura relevante
- `src/` — código React/renderer
- `electron/src/` — main y preload (TypeScript)
- `dist/` — salida `vite build`
- `dist/electron/` — main.js y preload.cjs compilados
- `scripts/ensure-preload.cjs` — genera `preload.cjs` (CommonJS)
- `src/lib/` — wrappers y tipos IPC

## Scripts principales
- `npm run dev` — Vite dev
- `npm run build` — TSC + vite build (producción)
- `npm run preview` — preview del build
- `npm run lint` — eslint
- `npm run build:preload` — tsc para preload (CommonJS)
- `npm run build:electron` — compila preload + main
- `npm run electron:dev` — Vite + build electron + ejecutar Electron (dev)
- `npm run electron:build` — build + electron-builder
- `npm run electron:dist` — build sin publicación

### Ejecución de ejemplo
```bash
# desarrollo web
npm run dev

# desarrollo desktop (levanta vite y electron)
npm run electron:dev

# build web
npm run build

# build y empaquetado electron
npm run electron:build
```

## Flujo Electron (dev)
El script `electron:dev` hace:
- arranca Vite en el puerto 5173 (con `--strictPort`)
- espera con `wait-on` a que esté listo
- compila el preload y el main
- escribe `dist/electron/preload.cjs` (CommonJS) para evitar errores ESM en preload
- lanza Electron con `preload` apuntando a `dist/electron/preload.cjs`

Si la ventana aparece en blanco, revisa DevTools por errores 404 en `./assets/...` o errores del preload.

## IPC tipado y detección de plataforma (resumen)
- Tipos: `src/lib/ipc-types.ts` define la interfaz `IpcApi` (por ejemplo `ping`, `getAppVersion`).
- Preload: `scripts/ensure-preload.cjs` expone `window.api` con funciones tipadas (`ping`, `getAppVersion`).
- Main: handlers con `ipcMain.handle('ping', ...)` y `ipcMain.handle('getAppVersion', ...)`.
- Renderer: wrapper `src/lib/api.ts` con funciones tipadas que llaman `window.api`.
- Detección plataforma: `src/lib/electron.ts` exporta `isElectron`, `isCapacitor`, `isWeb`.

Uso básico:
```ts
import api from '@/lib/api'
if (isElectron) {
  const res = await api.ping()
}
```

## Troubleshooting rápido
- "Cannot use import statement outside a module" en preload
  - Usa preload CommonJS (`preload.cjs`). El proyecto ya genera `preload.cjs` con `scripts/ensure-preload.cjs`.
- "Cannot find module '.../dist/electron/main.js'"
  - Compila electron antes de lanzar Electron: `npm run build:electron` o usa `electron:dev`.
- Ventana en blanco / 404 assets
  - Asegúrate `base: './'` en `vite.config.ts` para que `dist/index.html` use rutas relativas.
  - En dev, `--strictPort` para evitar que Vite cambie de puerto.
- Race condition preload
  - El wrapper cliente realiza un pequeño polling (1s) esperando a `window.api` antes de rechazar.

## Buenas prácticas
- Mantén el contrato `ipc-types.ts` actualizado.
- Exponer funciones concretas en preload (no `invoke(channel)` genérico).
- No habilitar `nodeIntegration` en renderer; usar `contextIsolation`.
- Añadir tests/mocks para la capa IPC.

## Comandos útiles (recap)
```bash
npm install
npm run dev
npm run electron:dev
npm run build
npm run electron:build
npm run lint
```

---

Si quieres, puedo añadir este contenido como `README.md` o incluir pasos para CI/CD con GitHub Actions para builds multiplataforma.
