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
