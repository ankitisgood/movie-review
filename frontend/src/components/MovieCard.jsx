import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const MovieCard = ({ 
  movie, 
  showRating = true, 
  showWatchlistButton = false, 
  onWatchlistToggle,
  inWatchlist = false 
}) => {
  const { isAuthenticated } = useAuth()

  const handleWatchlistClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (onWatchlistToggle) {
      onWatchlistToggle(movie._id)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <Link to={`/movies/${movie._id}`}>
        <div className="aspect-[2/3] relative">
          {movie.posterUrl ? (
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500 text-sm">No Image</span>
            </div>
          )}
          {showRating && movie.averageRating > 0 && (
            <div className="absolute top-2 right-2 bg-yellow-400 text-black px-2 py-1 rounded-full text-sm font-semibold">
              ⭐ {movie.averageRating.toFixed(1)}
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-4">
        <Link to={`/movies/${movie._id}`}>
          <h3 className="font-semibold text-gray-800 text-lg mb-2 hover:text-blue-600 transition-colors">
            {movie.title}
          </h3>
        </Link>
        
        <div className="text-sm text-gray-600 space-y-1">
          {movie.releaseYear && (
            <p>Year: {movie.releaseYear}</p>
          )}
          {movie.director && (
            <p>Director: {movie.director}</p>
          )}
          {movie.genre && movie.genre.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {movie.genre.slice(0, 3).map((genre, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                >
                  {genre}
                </span>
              ))}
              {movie.genre.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{movie.genre.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Watchlist Button */}
        {showWatchlistButton && isAuthenticated() && (
          <button
            onClick={handleWatchlistClick}
            className={`w-full mt-3 px-3 py-2 rounded-md text-sm font-medium transition duration-200 ${
              inWatchlist
                ? 'bg-red-500 hover:bg-red-700 text-white'
                : 'bg-blue-500 hover:bg-blue-700 text-white'
            }`}
          >
            {inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
          </button>
        )}
      </div>
    </div>
  )
}

export default MovieCard
