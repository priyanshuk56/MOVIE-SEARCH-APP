"use client"

import { useState, useEffect } from "react"
import { X, Star, Calendar, Clock, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

export default function MovieModal({ movie, onClose }) {
  const [movieDetails, setMovieDetails] = useState(null)
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const [detailsResponse, videosResponse] = await Promise.all([
          fetch(`/api/movie-details?id=${movie.id}`),
          fetch(`/api/movie-videos?id=${movie.id}`),
        ])

        const details = await detailsResponse.json()
        const videosData = await videosResponse.json()

        setMovieDetails(details)
        setVideos(videosData.results || [])
      } catch (error) {
        console.error("Error fetching movie details:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMovieDetails()
  }, [movie.id])

  const formatRuntime = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const trailers = videos.filter(
    (video) => video.site === "YouTube" && (video.type === "Trailer" || video.type === "Teaser"),
  )

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <Card className="bg-slate-900 border-slate-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <CardContent className="p-0">
          <div className="relative">
            {movieDetails?.backdrop_path && (
              <div className="aspect-video relative">
                <img
                  src={`https://image.tmdb.org/t/p/w1280${movieDetails.backdrop_path}`}
                  alt={movieDetails.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
              </div>
            )}

            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-pulse text-white">Loading movie details...</div>
              </div>
            ) : movieDetails ? (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/3">
                    {movieDetails.poster_path && (
                      <img
                        src={`https://image.tmdb.org/t/p/w500${movieDetails.poster_path}`}
                        alt={movieDetails.title}
                        className="w-full rounded-lg"
                      />
                    )}
                  </div>

                  <div className="md:w-2/3 space-y-4">
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-2">{movieDetails.title}</h2>
                      {movieDetails.tagline && <p className="text-gray-400 italic mb-4">"{movieDetails.tagline}"</p>}
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center text-yellow-400">
                        <Star className="w-4 h-4 mr-1" />
                        <span className="font-semibold">{movieDetails.vote_average.toFixed(1)}</span>
                        <span className="text-gray-400 ml-1">({movieDetails.vote_count.toLocaleString()} votes)</span>
                      </div>

                      {movieDetails.release_date && (
                        <div className="flex items-center text-gray-300">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(movieDetails.release_date).getFullYear()}
                        </div>
                      )}

                      {movieDetails.runtime && (
                        <div className="flex items-center text-gray-300">
                          <Clock className="w-4 h-4 mr-1" />
                          {formatRuntime(movieDetails.runtime)}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {movieDetails.genres.map((genre) => (
                        <Badge key={genre.id} variant="secondary">
                          {genre.name}
                        </Badge>
                      ))}
                    </div>

                    <p className="text-gray-300 leading-relaxed">{movieDetails.overview}</p>

                    {(movieDetails.budget > 0 || movieDetails.revenue > 0) && (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {movieDetails.budget > 0 && (
                          <div>
                            <span className="text-gray-400">Budget:</span>
                            <div className="text-white font-semibold">{formatCurrency(movieDetails.budget)}</div>
                          </div>
                        )}
                        {movieDetails.revenue > 0 && (
                          <div>
                            <span className="text-gray-400">Revenue:</span>
                            <div className="text-white font-semibold">{formatCurrency(movieDetails.revenue)}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {trailers.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">Trailers</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {trailers.slice(0, 4).map((trailer) => (
                        <Card key={trailer.id} className="bg-slate-800 border-slate-700">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="text-white font-medium">{trailer.name}</h4>
                                <p className="text-gray-400 text-sm">{trailer.type}</p>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => window.open(`https://www.youtube.com/watch?v=${trailer.key}`, "_blank")}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                <Play className="w-4 h-4 mr-1" />
                                Watch
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-red-400">Failed to load movie details</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
