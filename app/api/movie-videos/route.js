import { NextResponse } from "next/server"

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "Movie ID is required" }, { status: 400 })
  }

  const apiKey = process.env.TMDB_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: "TMDB API key not configured" }, { status: 500 })
  }

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${id}/videos?api_key=${apiKey}`,
      { next: { revalidate: 3600 } }, // Cache for 1 hour
    )

    if (!response.ok) {
      throw new Error("Failed to fetch movie videos from TMDB API")
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching movie videos:", error)
    return NextResponse.json({ error: "Failed to fetch movie videos" }, { status: 500 })
  }
}
