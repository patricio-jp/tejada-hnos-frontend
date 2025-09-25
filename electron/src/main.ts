import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import fs from 'fs'

const DEV_URL = process.env.VITE_DEV_SERVER_URL || (process.env.MAIN_WINDOW_VITE_DEV_SERVER_URL as string)

function createWindow() {
  const preloadPath = path.join(process.cwd(), 'dist', 'electron', 'preload.cjs')
  console.log('[main] preloadPath =', preloadPath, 'exists=', fs.existsSync(preloadPath))

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
