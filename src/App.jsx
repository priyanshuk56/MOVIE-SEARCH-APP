import "./App.css"
import MovieSearch from "./components/MovieSearch.jsx"

function App() {
  return (
    <div className="App">
      <div className="app-container">
        <header className="app-header">
          <h1>🎬 Movie Search</h1>
          <p>Discover movies, view ratings, watch trailers, and explore detailed information</p>
        </header>
        <MovieSearch />
      </div>
    </div>
  )
}

export default App
