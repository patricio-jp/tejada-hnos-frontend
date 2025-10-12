# Ejemplos prácticos (IPC, preload y uso)

Este archivo contiene ejemplos concretos para ayudarte a entender e implementar IPC tipado, preload seguro y cómo llamarlo desde el renderer.

## 1) Tipos compartidos (`src/lib/ipc-types.ts`)
```ts
export type IpcApi = {
  ping: () => Promise<string>
  getAppVersion: () => Promise<string>
}
```

## 2) Preload (CommonJS) — cómo exponer funciones concretas
En este proyecto, el archivo generado por `scripts/ensure-preload.cjs` tiene el siguiente contenido (simplificado):
```js
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  ping: () => ipcRenderer.invoke('ping'),
  getAppVersion: () => ipcRenderer.invoke('getAppVersion')
})
```

Esto es más seguro que exponer `ipcRenderer` directamente o usar `nodeIntegration`.

## 3) Main process — handlers (electron/src/main.ts)
```ts
import { app, ipcMain } from 'electron'

ipcMain.handle('ping', async () => 'pong')
ipcMain.handle('getAppVersion', async () => app.getVersion())
```

## 4) Wrapper tipado en renderer (`src/lib/api.ts`)
```ts
import type { IpcApi } from './ipc-types'

export const api = {
  ping: async (): Promise<string> => {
    if (!window.api) throw new Error('API not available')
    return window.api.ping()
  },
  getAppVersion: async (): Promise<string> => {
    if (!window.api) throw new Error('API not available')
    return window.api.getAppVersion()
  }
} as IpcApi

export default api
```

## 5) Uso en un componente React (`src/App.tsx`)
```tsx
<button onClick={async () => {
  try {
    const api = (await import('@/lib/api')).default
    const res = await api.ping()
    console.log('ping result', res)
    const version = await api.getAppVersion()
    console.log('app version', version)
  } catch (err) {
    console.log('native api not available', err)
  }
}}>
  Ping Electron
</button>
```

## 6) Añadir un nuevo método IPC (ejemplo `openFile`)
1. Añadir tipo en `ipc-types.ts`:
```ts
openFile: (path: string) => Promise<{ ok: boolean, path?: string }>
```
2. Exponer en preload:
```js
openFile: (p) => ipcRenderer.invoke('openFile', p)
```
3. Registrar handler en `main.ts`:
```ts
ipcMain.handle('openFile', async (event, p) => {
  // usar dialog.showOpenDialog o fs para abrir/leer
})
```
4. Añadir wrapper en `src/lib/api.ts` y usar desde renderer.

---

Si quieres, puedo añadir más ejemplos: abrir diálogos nativos, leer/escribir settings, manejar arranque automático o integración con Capacitor.
