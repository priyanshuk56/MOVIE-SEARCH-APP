import "./App.css"

import MovieSearch from "./components/MovieSearch.jsx"

function App() {
  const handleHomeClick = () => {
    // Trigger a custom event that the MovieSearch component will listen to
    window.dispatchEvent(new CustomEvent("goHome"))
  }
  
  return (
    <div className="App">
      <div className="app-container">
        <header className="app-header">
           <button className="home-button" onClick={handleHomeClick} title="Go to Homepage">
             Home
          </button>
          <h1>🎬 Movie Nest </h1>
          <p>Discover movies, view ratings, watch trailers, and explore detailed information</p>
        </header>
        <MovieSearch />
        
      </div>
    </div>
  )
}

export default App
