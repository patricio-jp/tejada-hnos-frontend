export type ElectronAPI = {
  invoke: <T = unknown>(channel: string, ...args: unknown[]) => Promise<T>
}

declare global {
  interface Window {
    electron?: ElectronAPI
    Capacitor?: any
    process?: any
  }
}

const detectElectron = () => {
  try {
    if (typeof navigator !== 'undefined' && /Electron/.test(navigator.userAgent)) return true
    if (typeof window !== 'undefined' && typeof window.process === 'object' && !!window.process.versions?.electron) return true
    if (typeof window !== 'undefined' && !!window.electron) return true
  } catch (e) {
    // ignore
  }
  return false
}

const detectCapacitor = () => {
  try {
    return typeof window !== 'undefined' && !!(window as any).Capacitor
  } catch (e) {
    return false
  }
}

export const isElectron = detectElectron()
export const isCapacitor = detectCapacitor()
export const isWeb = !isElectron && !isCapacitor

export const electron = {
  invoke: async <T = unknown>(channel: string, ...args: unknown[]): Promise<T> => {
    if (typeof window === 'undefined') {
      return Promise.reject(new Error('Electron API not available'))
    }

    const waitForElectron = async (timeout = 1000): Promise<void> => {
      const start = Date.now()
      while (!window.electron && Date.now() - start < timeout) {
        await new Promise((r) => setTimeout(r, 50))
      }
    }

    if (!window.electron && isElectron) {
      // try to wait briefly for preload to expose the API (race condition)
      await waitForElectron(1000)
    }

    if (!window.electron) {
      return Promise.reject(new Error('Electron API not available'))
    }

    return window.electron.invoke<T>(channel, ...args)
  }
}

export default electron
