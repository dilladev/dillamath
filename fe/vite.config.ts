import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'

function normalizeBase(value?: string) {
  if (!value) {
    return '/'
  }

  const trimmed = value.trim()
  if (!trimmed) {
    return '/'
  }

  if (trimmed.startsWith('.')) {
    return trimmed.endsWith('/') ? trimmed : `${trimmed}/`
  }

  if (/^[\w+.-]+:\/\//.test(trimmed)) {
    return trimmed.endsWith('/') ? trimmed : `${trimmed}/`
  }

  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const base = normalizeBase(env.VITE_BASE)

  return {
    plugins: [
      react(),
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
    base,
  }
})
