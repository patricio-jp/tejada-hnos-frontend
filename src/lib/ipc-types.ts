import type { Activity } from '@/modules/Activities/types/activity';

export type IpcApi = {
  ping: () => Promise<string>
  getAppVersion: () => Promise<string>
  // Activity Log methods
  getActivityLogs: () => Promise<Activity[]>
  createActivityLog: (data: Omit<Activity, 'id' | 'createdAt' | 'createdBy'>) => Promise<Activity>
  updateActivityLog: (id: string, data: Partial<Activity>) => Promise<Activity>
  deleteActivityLog: (id: string) => Promise<void>

  // IPC Bridge methods
  invoke: <T = any>(channel: string, ...args: unknown[]) => Promise<T>
}

declare global {
  interface Window {
    api?: IpcApi
  }

  // allow import style access in other modules
  var api: IpcApi | undefined
}

export default {} as IpcApi
