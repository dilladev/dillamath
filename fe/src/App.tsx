import Generator from './Generator'

function App() {
  const basePath = !import.meta.env.BASE ? `` : `${import.meta.env.BASE_URL}/` ;

   return (
    // Root div with dynamic background image
    <div
      className="min-h-screen bg-cover bg-center"
      style={{
        backgroundImage: `url('${basePath}background.jpg')`,
      }}
    >
      <div className="bg-black/50 min-h-screen">
        <Generator />
      </div>
    </div>
  )
}

export default App
