import { useState, useEffect } from 'react'
import { getMovies } from '../utils/api'
import MovieCard from '../components/MovieCard'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'

const HomePage = () => {
  const [trendingMovies, setTrendingMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchTrendingMovies()
  }, [])

  const fetchTrendingMovies = async () => {
    try {
      setLoading(true)
      const result = await getMovies({ 
        limit: 8, 
        sortBy: 'averageRating', 
        sortOrder: 'desc' 
      })
      
      if (result.success) {
        setTrendingMovies(result.data.movies)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Failed to fetch movies')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            Welcome to Movie App
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Discover, rate, and review your favorite movies
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Browse Movies
            </h3>
            <p className="text-gray-600">
              Explore our collection of movies with detailed information and ratings.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Rate & Review
            </h3>
            <p className="text-gray-600">
              Share your thoughts and rate movies to help others discover great films.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Watchlist
            </h3>
            <p className="text-gray-600">
              Keep track of movies you want to watch with your personal watchlist.
            </p>
          </div>
        </div>

        {/* Trending Movies Section */}
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Top Rated Movies
          </h2>
          
          {loading ? (
            <LoadingSpinner size="large" text="Loading trending movies..." />
          ) : error ? (
            <ErrorMessage 
              message={error} 
              onRetry={fetchTrendingMovies}
              retryText="Try Again"
            />
          ) : trendingMovies.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {trendingMovies.map((movie) => (
                <MovieCard key={movie._id} movie={movie} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No movies found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default HomePage
