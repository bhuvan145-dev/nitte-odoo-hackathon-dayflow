import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        secure: false,
      },
      '/odoo': {
        target: 'http://localhost:8069',
        changeOrigin: true,
        secure: false,
        rewrite: (p) => p.replace(/^\/odoo/, ''),
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes, req, res) => {
            const sc = proxyRes.headers['set-cookie']
            if (sc) {
              const rewritten = sc.map(c => c.replace(/; Domain=[^;]*/i, '').replace(/Path=\/[^;]*/i, 'Path=/'))
              proxyRes.headers['set-cookie'] = rewritten
            }
          })
        }
      }
    }
  }
})
