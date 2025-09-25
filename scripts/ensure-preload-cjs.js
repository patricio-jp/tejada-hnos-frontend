const fs = require('fs')
const path = require('path')

const out = path.join(__dirname, '..', 'dist', 'electron')
const js = path.join(out, 'preload.js')
const cjs = path.join(out, 'preload.cjs')

if (fs.existsSync(cjs)) {
  console.log('preload.cjs already present')
  process.exit(0)
}

if (!fs.existsSync(js)) {
  console.error('preload.js not found; compile first')
  process.exit(1)
}

try {
  fs.copyFileSync(js, cjs)
  console.log('preload.cjs created')
} catch (e) {
  console.error('failed to create preload.cjs', e)
  process.exit(2)
}
