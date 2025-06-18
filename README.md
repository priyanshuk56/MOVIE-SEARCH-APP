# TMDB Movie Search App

A React application built with Vite for searching movies using The Movie Database (TMDB) API.

## Features

- 🔍 Search for movies by title
- ⭐ View movie ratings and details
- 🎬 Watch movie trailers on YouTube
- 📱 Responsive design
- 🎨 Beautiful dark theme UI

## Setup Instructions

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Get TMDB API Key

1. Go to [TMDB API](https://www.themoviedb.org/settings/api)
2. Create an account and get your API key
3. Create a `.env` file in the root directory
4. Add your API key:

\`\`\`env
VITE_TMDB_API_KEY=your_api_key_here
\`\`\`

### 3. Start the Development Server

\`\`\`bash
npm run dev
\`\`\`

The app will open at [http://localhost:5173](http://localhost:5173)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Technologies Used

- React 18
- Vite
- JavaScript/JSX
- CSS3
- TMDB API

## Project Structure

\`\`\`
src/
  components/
    MovieSearch.jsx
    MovieModal.jsx
    MovieSearch.css
    MovieModal.css
  App.jsx
  App.css
  main.jsx
  index.css
