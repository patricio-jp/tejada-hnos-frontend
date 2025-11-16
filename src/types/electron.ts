/**
 * Tipos e interfaces para integración con Electron
 */

/**
 * API de IPC para comunicación con proceso principal de Electron
 */
export type IpcApi = {
  ping: () => Promise<string>
  getAppVersion: () => Promise<string>
}

/**
 * API de Electron expuesta en window
 */
export type ElectronAPI = {
  invoke: <T = unknown>(channel: string, ...args: unknown[]) => Promise<T>
}

declare global {
  interface Window {
    api?: IpcApi
    electron?: ElectronAPI
    Capacitor?: any
    process?: any
  }

  // allow import style access in other modules
  var api: IpcApi | undefined
}
