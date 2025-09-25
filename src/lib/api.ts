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
