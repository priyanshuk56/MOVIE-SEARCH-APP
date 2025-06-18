"use client"

import { useState } from "react"
import { Search, Star, Calendar } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import MovieModal from "./movie-modal"

export default function MovieSearch() {
  const [query, setQuery] = useState("")
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)

  const searchMovies = async (searchQuery, pageNum = 1) => {
    if (!searchQuery.trim()) {
      setMovies([])
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/search-movies?query=${encodeURIComponent(searchQuery)}&page=${pageNum}`)
      const data = await response.json()

      if (pageNum === 1) {
        setMovies(data.results)
      } else {
        setMovies((prev) => [...prev, ...data.results])
      }

      setTotalPages(data.total_pages)
    } catch (error) {
      console.error("Error searching movies:", error)
    } finally {
      setLoading(false)
    }
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
    return new Date(dateString).getFullYear()
  }

  return (
    <div className="max-w-6xl mx-auto">
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2 max-w-2xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search for movies..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
          </div>
          <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700">
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>
      </form>

      {movies.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {movies.map((movie) => (
            <Card
              key={movie.id}
              className="bg-white/10 border-white/20 hover:bg-white/20 transition-all cursor-pointer group"
              onClick={() => setSelectedMovie(movie)}
            >
              <CardContent className="p-0">
                <div className="aspect-[2/3] relative overflow-hidden rounded-t-lg">
                  {movie.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-yellow-500 text-black">
                      <Star className="w-3 h-3 mr-1" />
                      {movie.vote_average.toFixed(1)}
                    </Badge>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-white mb-2 line-clamp-2">{movie.title}</h3>
                  <div className="flex items-center text-gray-400 text-sm mb-2">
                    <Calendar className="w-4 h-4 mr-1" />
                    {movie.release_date ? formatDate(movie.release_date) : "TBA"}
                  </div>
                  <p className="text-gray-300 text-sm line-clamp-3">{movie.overview}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {movies.length > 0 && page < totalPages && (
        <div className="text-center">
          <Button
            onClick={loadMore}
            disabled={loading}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            {loading ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}

      {selectedMovie && <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />}
    </div>
  )
}
