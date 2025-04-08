import Generator from './Generator'

function App() {
   return (
    // Root div with dynamic background image
    <div
      className="min-h-screen bg-cover bg-center"
      style={{
        backgroundImage: `url('/dillamath/background.jpg')`,
      }}
    >
      <div className="bg-black/50 min-h-screen">
        <Generator />
      </div>
    </div>
  )
}

export default App
