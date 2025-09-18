import Generator from './Generator'

function normalizeBaseUrl(value?: string) {
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

  if (trimmed.startsWith('//') || trimmed.includes('://')) {
    return trimmed.endsWith('/') ? trimmed : `${trimmed}/`
  }

  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`
}

function App() {
  const normalizedBaseUrl = normalizeBaseUrl(import.meta.env.BASE_URL)
  const backgroundUrl = `${normalizedBaseUrl}background.jpg`

  return (
    // Root div with dynamic background image
    <div
      className="min-h-screen bg-cover bg-center"
      style={{
        backgroundImage: `url('${backgroundUrl}')`,
      }}
    >
      <div className="bg-black/50 min-h-screen">
        <Generator />
      </div>
    </div>
  )
}

export default App
