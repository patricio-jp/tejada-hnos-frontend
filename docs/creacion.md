# Creación del proyecto desde cero (pasos reproducibles)

Este documento explica cómo crear un proyecto con: React + TypeScript (SWC) con Vite, TailwindCSS + Shadcn para UI, Capacitor y soporte Desktop mediante Electron + electron-builder. Incluye todas las dependencias y scripts, tsconfigs, preload CommonJS, IPC tipado, etc.

Checklist inicial
- Crear proyecto Vite React+TS (SWC)
- Instalar dependencias
- Configurar Vite (`base: './'`) para que funcione con Electron `file://`
- Añadir estructura `electron/` (main + preload) y tsconfigs separados
- Añadir script que genere `preload.cjs` (CommonJS) para evitar errores ESM
- Añadir scripts en `package.json` para dev/build/electron
- Implementar IPC tipado (preload expone `window.api`) y wrapper en renderer

1) Crear la plantilla Vite (React + TS con SWC)

```bash
# Crea un proyecto nuevo llamado my-app (elige el nombre que prefieras)
# Elegir la plantilla React + TypeScript (SWC)
npm create vite@latest my-app
cd my-app # carpeta del proyecto
```

2) Instalar dependencias (según las que usa este repo)

Agregar [Shadcn](https://ui.shadcn.com/docs/installation/vite)
```bash
npm install tailwindcss @tailwindcss/vite
# ...
# Seguir los demás pasos de la documentación [IMPORTANTE]
```

Agregar [Capacitor](https://capacitorjs.com/docs/getting-started)
```bash
npm install @capacitor/core
npm install -D @capacitor/cli
npx cap init

# Añadir plataformas (opcional)
npm install @capacitor/android @capacitor/ios
npx cap add android
npx cap add ios

# Sincronizar después de cada build para compilar y testear para mobile
npx cap sync
```

Agregar [Electron](https://www.electronjs.org/es/docs/latest/tutorial/tutorial-first-app) + [electron-builder](https://www.electron.build/)

```bash
npm install -D electron electron-builder concurrently wait-on
```

3) Configurar ficheros

`tsconfig.json` (Agregar lo siguiente dentro de "compilerOptions", dentro de la documentación oficial de Shadcn)
```json
{
  // ...
  "compilerOptions": {
    // ...
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```
`tsconfig.app.json` (agregar lo siguiente dentro de "compilerOptions", dentro de la documentación oficial de Shadcn)
```json
{
  // ...
  "compilerOptions": {
    // ...
    "baseUrl": ".",
    "paths": {
      "@/*": [
        "./src/*"
      ]
    }
  }
}
```

`vite.config.ts` (Archivo completo)
- Importante: usar `base: './'` para que `dist/index.html` haga referencia a assets con rutas relativas (funciona con `file://` en Electron).
- Añadir plugin SWC y alias `@` hacia `src`.

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

4) Añadir la estructura de Electron

Crea carpeta `electron/` con estos ficheros:
- `electron/tsconfig.json` — para el proceso *main* (EMSM preferido)
- `electron/tsconfig.preload.json` — para compilar `preload.ts` como CommonJS
- `electron/src/main.ts` — proceso principal de Electron
- `electron/src/preload.ts` — fuente TS del preload (pero en runtime usaremos `preload.cjs`)

Ficheros completos funcionales:

`electron/tsconfig.json` (main, ESM)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2020",
    "outDir": "../dist/electron",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "moduleResolution": "node",
    "sourceMap": false,
    "rootDir": "src",
    "types": ["node"]
  },
  "include": ["src/**/*"]
}
```

`electron/tsconfig.preload.json` (preload -> CommonJS)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "outDir": "../dist/electron",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "moduleResolution": "node",
    "sourceMap": false,
    "rootDir": "src",
    "types": ["node"]
  },
  "include": ["src/preload.ts"]
}
```

`electron/src/main.ts`
```ts
import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import fs from 'fs'

const DEV_URL = process.env.VITE_DEV_SERVER_URL || (process.env.MAIN_WINDOW_VITE_DEV_SERVER_URL as string)

function createWindow() {
  const preloadPath = path.join(process.cwd(), 'dist', 'electron', 'preload.cjs')
  //console.log('[main] preloadPath =', preloadPath, 'exists=', fs.existsSync(preloadPath))

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  if (DEV_URL) {
    win.loadURL(DEV_URL)
  } else {
    win.loadFile(path.join(process.cwd(), 'dist', 'index.html'))
  }

  return win
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.handle('ping', async () => 'pong')

ipcMain.on('preload-ready', () => {
  console.log('[main] preload signalled ready')
})

ipcMain.handle('getAppVersion', async () => {
  return app.getVersion()
})

```

`electron/src/preload.ts`
```ts
import { contextBridge, ipcRenderer } from 'electron'

type ElectronAPI = {
  invoke: <T = any>(channel: string, ...args: unknown[]) => Promise<T>
}

const api: ElectronAPI = {
  invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args)
}

contextBridge.exposeInMainWorld('electron', api)
```

5) Evitar el error ESM en preload: generar `preload.cjs`

Para evitar el problema "Cannot use import statement outside a module" en preload (mezcla ESM/CJS), es necesario compilar `preload.ts` a CommonJS con `tsc -p electron/tsconfig.preload.json` y asegurarte que el archivo final sea `preload.cjs`. El repo contiene `scripts/ensure-preload.cjs` que se encarga de escribir un `preload.cjs` [TO-DO - Revisar si es necesario (creo que no al tener disponible el comando npm run electron:build)].

Ejemplo de `scripts/ensure-preload.cjs` (escribe preload CommonJS que expone `window.api`):
```js
const fs = require('fs')
const path = require('path')

const out = path.join(__dirname, '..', 'dist', 'electron')
const js = path.join(out, 'preload.js')
const cjs = path.join(out, 'preload.cjs')

// overwrite existing preload.cjs to ensure no stale ESM artifacts remain
if (!fs.existsSync(js)) {
  console.error('preload.js not found; compile first')
  process.exit(1)
}

try {
  // write a minimal CommonJS preload directly to avoid ESM import issues
  const content = `const { contextBridge, ipcRenderer } = require('electron');
// typed API surface
contextBridge.exposeInMainWorld('api', {
  ping: () => ipcRenderer.invoke('ping'),
  getAppVersion: () => ipcRenderer.invoke('getAppVersion')
});
contextBridge.exposeInMainWorld('platform', { isElectron: true });
try { ipcRenderer.send('preload-ready') } catch (e) { }
console.log('[preload] typed API exposed');
`;
  fs.mkdirSync(out, { recursive: true })
  fs.writeFileSync(cjs, content, 'utf8')
  console.log('preload.cjs written (CommonJS)')
} catch (e) {
  console.error('failed to create preload.cjs', e)
  process.exit(2)
}

```

6) Contrato IPC tipado y wrapper en renderer

Crear `src/lib/ipc-types.ts` con la forma de la API:
```ts
export type IpcApi = {
  ping: () => Promise<string>
  getAppVersion: () => Promise<string>
}

declare global {
  interface Window {
    api?: IpcApi
  }

  // allow import style access in other modules
  var api: IpcApi | undefined
}

export default {} as IpcApi

```

Crear `src/lib/api.ts` como wrapper tipado que llama a `window.api`:
```ts
import type { IpcApi } from './ipc-types'

export const api = {
  ping: async (): Promise<string> => {
    if (typeof window === 'undefined' || !window.api) throw new Error('API not available')
    return window.api.ping()
  },
  getAppVersion: async (): Promise<string> => {
    if (typeof window === 'undefined' || !window.api) throw new Error('API not available')
    return window.api.getAppVersion()
  }
} as IpcApi

export default api

```

7) Actualizar `package.json` con scripts (ejemplo adaptado al repo)

Añade las entradas de scripts que usamos en este repo (puedes pegarlas exactamente):
```json
{
  "scripts": {s
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "build:preload": "tsc -p electron/tsconfig.preload.json",
    "build:electron": "npm run build:preload && tsc -p electron/tsconfig.json",
    "electron:dev": "concurrently \"vite --port 5173 --strictPort\" \"wait-on http://localhost:5173 && VITE_DEV_SERVER_URL=http://localhost:5173 npm run build:electron && node scripts/ensure-preload.cjs && electron .\"",
    "electron:build": "vite build && npx tsc -p electron/tsconfig.preload.json && npx tsc -p electron/tsconfig.json && node scripts/ensure-preload.cjs && electron-builder", [TO-DO - revisar si es necesario el ensure-preload.cjs xq ya compila en el paso anterior]
    "electron:dist": "vite build && npx tsc -p electron/tsconfig.preload.json && npx tsc -p electron/tsconfig.json && node scripts/ensure-preload.cjs && electron-builder --publish never"
  }
}
```

- `electron:dev` levanta Vite en puerto fijo (5173) y solo cuando el server esté listo compila y lanza Electron.
- `ensure-preload.cjs` se ejecuta antes de lanzar Electron para garantizar que `preload.cjs` existe y es CommonJS.

8) Configuración de `electron-builder` (sección `build` en `package.json`)
- Agrega `main` apuntando a `dist/electron/main.js` y la sección `build` con `appId`, `productName`, `files`, y targets por plataforma (linux/mac/win). En el repo ya hay una sección de ejemplo que puedes reutilizar.

9) Desarrollo y comandos útiles

- Desarrollo web (solo renderer):
```bash
npm run dev
```

- Desarrollo Electron (Vite + Electron)
```bash
npm run electron:dev
```
(esperar a que Vite arranque en 5173 y que el script compile main/preload; no matar con Ctrl+C hasta probar el botón/funciones)

- Build producción web:
```bash
npm run build
```

- Build y empaquetado Electron:
```bash
npm run electron:build
```

10) Troubleshooting rápido (resumen de problemas que solucionamos en el repo)
- Preload ESM vs CJS: generar `preload.cjs` (CommonJS) para evitar "Cannot use import statement outside a module".
- Rutas de assets 404 en Electron: definir `base: './'` en `vite.config.ts` para usar rutas relativas en `dist/index.html`.
- Electron arrancando antes de compilar main: usar `build:electron` en el flujo `electron:dev`.
- Race conditions: el wrapper del renderer puede implementar un pequeño polling (espera hasta 1s) verificando `window.api` antes de rechazar la llamada.

11) Buenas prácticas
- Exponer una API explícita y tipada desde preload (evita `invoke(channel)` genérico si es posible).
- Mantener `contextIsolation: true` y `nodeIntegration: false` en `BrowserWindow`.
- Añadir validaciones y sanitización en los handlers `ipcMain.handle(...)`.
- Añadir iconos y metadatos en `build/` antes de ejecutar `electron-builder`.

---

Si quieres, puedo:
- Generar todos los ficheros de ejemplo automáticamente en un nuevo repo (esqueleto), o
- Añadir un workflow de GitHub Actions para compilar y generar artefactos multiplataforma.

Dime qué prefieres y lo hago.
