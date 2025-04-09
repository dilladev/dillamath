import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import {viteStaticCopy} from 'vite-plugin-static-copy';
// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(),
      viteStaticCopy({
        targets: [
          { src: '*.jpg', dest: '' },
        ]
      })
    ],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    server: {
      host: true,
      port: 3007,
    },
    base: process.env.VITE_BASE
  }
})
