import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    devSourcemap: true,
  },
  server: {
    // YesilEksen projesi için sabit port
    port: 5174,
    host: true,
    strictPort: true, // Port kullanımdaysa hata ver, başka porta geçme
    hmr: {
      overlay: false
    }
  }
})
