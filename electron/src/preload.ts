import { contextBridge, ipcRenderer } from 'electron'

type ElectronAPI = {
  invoke: <T = any>(channel: string, ...args: unknown[]) => Promise<T>
}

const api: ElectronAPI = {
  invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args)
}

contextBridge.exposeInMainWorld('electron', api)
