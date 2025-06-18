"use client"

import { useState, useEffect } from "react"
import "./MovieModal.css"

const MovieModal = ({ movie, onClose, apiKey }) => {
  const [movieDetails, setMovieDetails] = useState(null)
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)

  const BASE_URL = "https://api.allorigins.win/get?url=" + encodeURIComponent("https://api.themoviedb.org/3")
  const DIRECT_BASE_URL = "https://api.themoviedb.org/3"
  const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500"
  const BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/w1280"

  const PROXY_SERVICES = [
    "https://cors-anywhere.herokuapp.com/",
    "https://api.codetabs.com/v1/proxy?quest=",
    "https://thingproxy.freeboard.io/fetch/",
  ]

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const detailsParams = new URLSearchParams({ api_key: apiKey })
        const videosParams = new URLSearchParams({ api_key: apiKey })

        const directDetailsUrl = `${DIRECT_BASE_URL}/movie/${movie.id}?${detailsParams}`
        const directVideosUrl = `${DIRECT_BASE_URL}/movie/${movie.id}/videos?${videosParams}`

        // Try multiple approaches for both details and videos
        const attempts = [
          // Direct connection
          () =>
            Promise.all([
              fetch(directDetailsUrl, { headers: { Accept: "application/json" } }),
              fetch(directVideosUrl, { headers: { Accept: "application/json" } }),
            ]),

          // Try different proxy services
          ...PROXY_SERVICES.map(
            (proxy) => () =>
              Promise.all([
                fetch(`${proxy}${encodeURIComponent(directDetailsUrl)}`, { headers: { Accept: "application/json" } }),
                fetch(`${proxy}${encodeURIComponent(directVideosUrl)}`, { headers: { Accept: "application/json" } }),
              ]),
          ),

          // AllOrigins proxy
          () =>
            Promise.all([
              fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(directDetailsUrl)}`),
              fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(directVideosUrl)}`),
            ]),
        ]

        for (let i = 0; i < attempts.length; i++) {
          try {
            const [detailsResponse, videosResponse] = await attempts[i]()

            if (detailsResponse.ok && videosResponse.ok) {
              const detailsData = await detailsResponse.json()
              const videosData = await videosResponse.json()

              setMovieDetails(detailsData)
              setVideos(videosData.results || [])
              break
            }
          } catch (error) {
            continue
          }
        }
      } catch (error) {
        console.error("Error fetching movie details:", error)
      } finally {
        setLoading(false)
      }
    }

    if (apiKey && movie.id) {
      fetchMovieDetails()
    }
  }, [movie.id, apiKey])

  const formatRuntime = (minutes) => {
    if (!minutes) return ""
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const formatCurrency = (amount) => {
    if (!amount) return "N/A"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Filter for OFFICIAL trailers only
  const officialTrailers = videos.filter(
    (video) => video.site === "YouTube" && video.type === "Trailer" && video.official === true, // Only official trailers
  )

  // If no official trailers, fall back to any trailers but prioritize official ones
  const trailers =
    officialTrailers.length > 0
      ? officialTrailers
      : videos
          .filter((video) => video.site === "YouTube" && (video.type === "Trailer" || video.type === "Teaser"))
          .sort((a, b) => {
            // Prioritize official content
            if (a.official && !b.official) return -1
            if (!a.official && b.official) return 1
            // Then prioritize trailers over teasers
            if (a.type === "Trailer" && b.type === "Teaser") return -1
            if (a.type === "Teaser" && b.type === "Trailer") return 1
            return 0
          })

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        <div className="modal-header">
          {movieDetails?.backdrop_path && (
            <div className="backdrop-container">
              <img
                src={`${BACKDROP_BASE_URL}${movieDetails.backdrop_path}`}
                alt={movieDetails.title}
                className="backdrop-image"
              />
              <div className="backdrop-overlay"></div>
            </div>
          )}
          <button onClick={onClose} className="close-button">
            ✕
          </button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="loading-container">
              <div className="loading-text">Loading movie details...</div>
            </div>
          ) : movieDetails ? (
            <div className="movie-details">
              <div className="details-layout">
                <div className="poster-section">
                  {movieDetails.poster_path && (
                    <img
                      src={`${IMAGE_BASE_URL}${movieDetails.poster_path}`}
                      alt={movieDetails.title}
                      className="detail-poster"
                    />
                  )}
                </div>  

                <div className="info-section">
                  <div className="title-section">
                    <h2 className="detail-title">{movieDetails.title}</h2>
                    {movieDetails.tagline && <p className="tagline">"{movieDetails.tagline}"</p>}
                  </div>

                  <div className="meta-info">
                    <div className="rating-info">
                      ⭐ <span className="rating-score">{movieDetails.vote_average?.toFixed(1) || "N/A"}</span>
                      <span className="vote-count">({movieDetails.vote_count?.toLocaleString() || 0} votes)</span>
                    </div>

                    {movieDetails.release_date && (
                      <div className="meta-item">📅 {new Date(movieDetails.release_date).getFullYear()}</div>
                    )}

                    {movieDetails.runtime && <div className="meta-item">🕐 {formatRuntime(movieDetails.runtime)}</div>}
                  </div>

                  <div className="genres">
                    {movieDetails.genres?.map((genre) => (
                      <span key={genre.id} className="genre-badge">
                        {genre.name}
                      </span>
                    ))}
                  </div>

                  <p className="overview">{movieDetails.overview}</p>

                  {(movieDetails.budget > 0 || movieDetails.revenue > 0) && (
                    <div className="financial-info">
                      {movieDetails.budget > 0 && (
                        <div className="financial-item">
                          <span className="financial-label">Budget:</span>
                          <div className="financial-value">{formatCurrency(movieDetails.budget)}</div>
                        </div>
                      )}
                      {movieDetails.revenue > 0 && (
                        <div className="financial-item">
                          <span className="financial-label">Revenue:</span>
                          <div className="financial-value">{formatCurrency(movieDetails.revenue)}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {trailers.length > 0 && (
                <div className="trailers-section">
                  <h3 className="trailers-title">
                    🎬 {officialTrailers.length > 0 ? "Official Trailers" : "Trailers"}
                  </h3>
                  <div className="trailers-grid">
                    {trailers.slice(0, 4).map((trailer) => (
                      <div key={trailer.id} className="trailer-card">
                        <div className="trailer-info">
                          <h4 className="trailer-name">{trailer.name}</h4>
                          <p className="trailer-type">
                            {trailer.type}
                            {trailer.official && <span className="official-badge"> • Official</span>}
                          </p>
                        </div>
                        <button
                          onClick={() => window.open(`https://www.youtube.com/watch?v=${trailer.key}`, "_blank")}
                          className="watch-button"
                        >
                          ▶️ Watch
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="error-message">Failed to load movie details</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MovieModal
