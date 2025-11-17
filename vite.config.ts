import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    strictPort: true, // Não tentar outras portas se 5173 estiver ocupada
    host: true, // Permitir acesso de outros dispositivos na rede
    open: false, // Não abrir navegador automaticamente
  },
  preview: {
    port: 5173,
    strictPort: true,
  },
})