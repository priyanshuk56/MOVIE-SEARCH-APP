import { Suspense } from "react"
import MovieSearch from "./components/movie-search"
import { Card, CardContent } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">Movie Nest</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Discover movies, view ratings, watch trailers, and explore detailed information powered by TMDB
          </p>
        </div>

        <Suspense
          fallback={
            <Card className="max-w-4xl mx-auto">
              <CardContent className="p-8 text-center">
                <div className="animate-pulse">Loading...</div>
              </CardContent>
            </Card>
          }
        >
          <MovieSearch />
        </Suspense>
      </div>
    </div>
  )
}
