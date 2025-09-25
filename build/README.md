Electron build notes

- Place icon files under `build/`:
  - `icon.png` (512x512) as a source
  - `icon.ico` for Windows
  - `icon.icns` for macOS

- electron-builder picks files from `dist/**` and `dist/electron/**` (configured in package.json).
- For macOS notarization and signing, configure environment variables and certificates before calling electron-builder.
- To customize NSIS installer options or AppImage metadata, extend the `build` section in `package.json`.
