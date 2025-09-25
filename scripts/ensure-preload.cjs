const fs = require('fs')
const path = require('path')

const out = path.join(__dirname, '..', 'dist', 'electron')
const js = path.join(out, 'preload.js')
const cjs = path.join(out, 'preload.cjs')

// overwrite existing preload.cjs to ensure no stale ESM artifacts remain
if (!fs.existsSync(js)) {
  console.error('preload.js not found; compile first')
  process.exit(1)
}

try {
  // write a minimal CommonJS preload directly to avoid ESM import issues
  const content = `const { contextBridge, ipcRenderer } = require('electron');
const api = { invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args) };
// expose platform helper and the electron api
contextBridge.exposeInMainWorld('electron', api);
contextBridge.exposeInMainWorld('platform', { isElectron: true });
// notify main process that preload loaded
try { ipcRenderer.send('preload-ready') } catch (e) { /* ignore */ }
console.log('[preload] executed and electron API exposed');
`;
  fs.mkdirSync(out, { recursive: true })
  fs.writeFileSync(cjs, content, 'utf8')
  console.log('preload.cjs written (CommonJS)')
} catch (e) {
  console.error('failed to create preload.cjs', e)
  process.exit(2)
}
