import type { IpcApi } from './ipc-types'

export const api = {
  ping: async (): Promise<string> => {
    if (typeof window === 'undefined' || !window.api) throw new Error('API not available')
    return window.api.ping()
  },
  getAppVersion: async (): Promise<string> => {
    if (typeof window === 'undefined' || !window.api) throw new Error('API not available')
    return window.api.getAppVersion()
  },
  getActivityLogs: async () => {
    if (typeof window === 'undefined' || !window.api) throw new Error('API not available')
    return window.api.getActivityLogs()
  },
  createActivityLog: async (data) => {
    if (typeof window === 'undefined' || !window.api) throw new Error('API not available')
    return window.api.createActivityLog(data)
  },
  updateActivityLog: async (id, data) => {
    if (typeof window === 'undefined' || !window.api) throw new Error('API not available')
    return window.api.updateActivityLog(id, data)
  },
  deleteActivityLog: async (id) => {
    if (typeof window === 'undefined' || !window.api) throw new Error('API not available')
    return window.api.deleteActivityLog(id)
  }
} as IpcApi

export default api
