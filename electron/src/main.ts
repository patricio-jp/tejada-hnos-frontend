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

const API_BASE_URL = process.env.API_URL || 'http://localhost:3000';

ipcMain.handle('ping', async () => 'pong')

ipcMain.on('preload-ready', () => {
  console.log('[main] preload signalled ready')
})

ipcMain.handle('getAppVersion', async () => {
  return app.getVersion()
})

// Activity Log handlers
ipcMain.handle('getActivityLogs', async () => {
  const response = await fetch(`${API_BASE_URL}/api/activity-logs`);
  if (!response.ok) throw new Error('Failed to fetch activities');
  return response.json();
})

ipcMain.handle('createActivityLog', async (_, data) => {
  const response = await fetch(`${API_BASE_URL}/api/activity-logs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create activity');
  return response.json();
})

ipcMain.handle('updateActivityLog', async (_, { id, ...data }) => {
  const response = await fetch(`${API_BASE_URL}/api/activity-logs/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update activity');
  return response.json();
})

ipcMain.handle('deleteActivityLog', async (_, id) => {
  const response = await fetch(`${API_BASE_URL}/api/activity-logs/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete activity');
})
