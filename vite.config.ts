import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Esto le dice: "Cualquier llamada que empiece con /api..."
      '/api': {
        // "...mandala a esta dirección:"
        target: 'http://localhost:3000',
        // Esto es clave: cambia el "origen" para que el backend piense que es de confianza
        changeOrigin: true,
        // Esto borra el "/api" para que al backend le llegue la ruta limpia
        rewrite: (path) => path.replace(/^\/api/, ''), 
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
