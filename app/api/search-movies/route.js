import { NextResponse } from "next/server"

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get("query")
  const page = searchParams.get("page") || "1"

  if (!query) {
    return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
  }

  const apiKey = process.env.TMDB_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: "TMDB API key not configured" }, { status: 500 })
  }

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&page=${page}&include_adult=false`,
      { next: { revalidate: 3600 } }, // Cache for 1 hour
    )

    if (!response.ok) {
      throw new Error("Failed to fetch from TMDB API")
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error searching movies:", error)
    return NextResponse.json({ error: "Failed to search movies" }, { status: 500 })
  }
}
