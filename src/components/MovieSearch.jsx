"use client"

import { useState, useEffect } from "react"
import MovieModal from "./MovieModal.jsx"
import "./MovieSearch.css"

const MovieSearch = () => {
  const [query, setQuery] = useState("")
  const [movies, setMovies] = useState([])
  const [popularMovies, setPopularMovies] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingPopular, setLoadingPopular] = useState(true)
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)

  const API_KEY = import.meta.env.VITE_TMDB_API_KEY
  const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500"

  // Multiple proxy options to try
  const PROXY_SERVICES = [
    "https://cors-anywhere.herokuapp.com/",
    "https://api.codetabs.com/v1/proxy?quest=",
    "https://thingproxy.freeboard.io/fetch/",
  ]

  const BASE_API_URL = "https://api.themoviedb.org/3"

  // Fetch popular movies on component mount
  useEffect(() => {
    fetchPopularMovies()
    // Listen for home button clicks
    const handleGoHome = () => {
      setQuery("")
      setMovies([])
      setShowSearchResults(false)
      setPage(1)
      setTotalPages(0)
    }

    window.addEventListener("goHome", handleGoHome)

    return () => {
      window.removeEventListener("goHome", handleGoHome)
    }
  }, [])

  const fetchPopularMovies = async () => {
    if (!API_KEY) return

    setLoadingPopular(true)

    const params = new URLSearchParams({
      api_key: API_KEY,
      page: "1",
    })

    const directUrl = `${BASE_API_URL}/movie/popular?${params}`

    // Try multiple approaches
    const attempts = [
      // Direct connection
      () =>
        fetch(directUrl, {
          headers: { Accept: "application/json" },
          mode: "cors",
        }),

      // Try different proxy services
      ...PROXY_SERVICES.map(
        (proxy) => () =>
          fetch(`${proxy}${encodeURIComponent(directUrl)}`, {
            headers: { Accept: "application/json" },
          }),
      ),

      // JSONP-like approach using a different service
      () => fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(directUrl)}`),
    ]

    for (let i = 0; i < attempts.length; i++) {
      try {
        const response = await attempts[i]()

        if (response.ok) {
          const data = await response.json()

          if (data.results) {
            setPopularMovies(data.results.slice(0, 12)) // Show first 12 movies
            setLoadingPopular(false)
            return
          }
        }
      } catch (error) {
        continue
      }
    }

    setLoadingPopular(false)
  }

  const searchMovies = async (searchQuery, pageNum = 1) => {
    if (!searchQuery.trim()) {
      setMovies([])
      return
    }

    if (!API_KEY) {
      alert("Please add your TMDB API key to the .env file as VITE_TMDB_API_KEY")
      return
    }

    setLoading(true)

    const params = new URLSearchParams({
      api_key: API_KEY,
      query: searchQuery,
      page: pageNum.toString(),
      include_adult: "false",
    })

    const directUrl = `${BASE_API_URL}/search/movie?${params}`

    // Try multiple approaches
    const attempts = [
      // Direct connection
      () =>
        fetch(directUrl, {
          headers: { Accept: "application/json" },
          mode: "cors",
        }),

      // Try different proxy services
      ...PROXY_SERVICES.map(
        (proxy) => () =>
          fetch(`${proxy}${encodeURIComponent(directUrl)}`, {
            headers: { Accept: "application/json" },
          }),
      ),

      // JSONP-like approach using a different service
      () => fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(directUrl)}`),
    ]

    let lastError = null

    for (let i = 0; i < attempts.length; i++) {
      try {
        const response = await attempts[i]()

        if (response.ok) {
          const data = await response.json()

          if (data.results) {
            if (pageNum === 1) {
              setMovies(data.results)
            } else {
              setMovies((prev) => [...prev, ...data.results])
            }
            setTotalPages(data.total_pages || 0)
            setLoading(false)
            return // Success!
          }
        }
      } catch (error) {
        lastError = error
        continue // Try next approach
      }
    }

    // If all attempts failed
    setLoading(false)
    alert("Unable to search movies. Please check your internet connection or try using a VPN.")
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    searchMovies(query, 1)
  }

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    searchMovies(query, nextPage)
  }

  const formatDate = (dateString) => {
    if (!dateString) return "TBA"
    return new Date(dateString).getFullYear()
  }

  const MovieCard = ({ movie, onClick }) => (
    <div className="movie-card" onClick={() => onClick(movie)}>
      <div className="movie-poster-container">
        {movie.poster_path ? (
          <img
            src={`${IMAGE_BASE_URL}${movie.poster_path}`}
            alt={movie.title}
            className="movie-poster"
            onError={(e) => {
              e.target.style.display = "none"
              e.target.nextSibling.style.display = "flex"
            }}
          />
        ) : null}
        <div className="no-poster" style={{ display: movie.poster_path ? "none" : "flex" }}>
          <span>No Image</span>
        </div>
        <div className="movie-rating">⭐ {movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}</div>
      </div>
      <div className="movie-info">
        <h3 className="movie-title">{movie.title}</h3>
        <div className="movie-year">📅 {formatDate(movie.release_date)}</div>
        <p className="movie-overview">{movie.overview || "No description available."}</p>
      </div>
    </div>
  )

  return (
    <div className="movie-search">
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-container">
          <div className="search-input-container">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search for movies..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <button type="submit" disabled={loading} className="search-button">
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </form>

      {/* Search Results */}
      {movies.length > 0 && (
        <div className="section">
          <h2 className="section-title">Search Results</h2>
          <div className="movies-grid">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} onClick={setSelectedMovie} />
            ))}
          </div>
          {page < totalPages && (
            <div className="load-more-container">
              <button onClick={loadMore} disabled={loading} className="load-more-button">
                {loading ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Popular Movies Section */}
      {movies.length === 0 && (
        <div className="section">
          <h2 className="section-title">🔥 Popular Movies</h2>
          {loadingPopular ? (
            <div className="loading-grid">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="movie-card-skeleton">
                  <div className="skeleton-poster"></div>
                  <div className="skeleton-content">
                    <div className="skeleton-title"></div>
                    <div className="skeleton-year"></div>
                    <div className="skeleton-overview"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="movies-grid">
              {popularMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} onClick={setSelectedMovie} />
              ))}
            </div>
          )}
        </div>
      )}

      {selectedMovie && <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} apiKey={API_KEY} />}
    </div>
  )
}

export default MovieSearch
