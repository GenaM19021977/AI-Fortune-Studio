import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * Плагин для шага 0.9 (туннель → Telegram).
 *
 * Зачем: бесплатный ngrok иногда показывает промежуточную HTML-страницу
 * («Visit Site») вместо нашего Mini App. Telegram WebView на телефоне
 * часто не проходит этот клик. Заголовок просит ngrok пропустить warning.
 * На cloudflared этот заголовок безвреден (просто игнорируется).
 */
function tunnelFriendlyHeaders(): Plugin {
  return {
    name: 'tunnel-friendly-headers',
    configureServer(server) {
      server.middlewares.use((_req, res, next) => {
        res.setHeader('ngrok-skip-browser-warning', 'true')
        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), tunnelFriendlyHeaders()],
  server: {
    port: 5173,
    /*
     * host: true — слушаем 0.0.0.0, а не только 127.0.0.1.
     * Без этого туннель (ngrok / cloudflared) не достучится до Vite
     * с «внешней» стороны, и Mini App на телефоне не откроется.
     */
    host: true,
    /*
     * allowedHosts: true — Vite 5+ по умолчанию режет неизвестный Host.
     * Туннель шлёт Host вроде xxx.ngrok-free.app / xxx.trycloudflare.com —
     * без этого получим 403 Blocked request.
     */
    allowedHosts: true,
    /*
     * Прокси /api → Django. Схема для телефона:
     *   телефон → HTTPS-туннель → Vite :5173 → proxy → Django :8000
     * Браузер видит один origin (туннель), CORS не мешает.
     */
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
