import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getMovieById, addReview, manageWatchlist } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import ProtectedReviewForm from '../components/ProtectedReviewForm'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'

const MovieDetailPage = () => {
  const { id } = useParams()
  const { user, isAuthenticated } = useAuth()
  
  const [movie, setMovie] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [inWatchlist, setInWatchlist] = useState(false)
  
  // Review form state
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    reviewText: ''
  })
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    fetchMovieDetails()
  }, [id])

  const fetchMovieDetails = async () => {
    try {
      setLoading(true)
      const result = await getMovieById(id)
      
      if (result.success) {
        setMovie(result.data.movie)
        setReviews(result.data.reviews)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Failed to fetch movie details')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToWatchlist = async () => {
    if (!isAuthenticated()) return
    
    try {
      const action = inWatchlist ? 'remove' : 'add'
      const result = await manageWatchlist(user.id, id, action)
      
      if (result.success) {
        setInWatchlist(!inWatchlist)
      }
    } catch (err) {
      console.error('Watchlist error:', err)
    }
  }

  const handleSubmitReview = async (formData) => {
    if (!isAuthenticated()) return
    
    try {
      setSubmittingReview(true)
      const result = await addReview(id, formData)
      
      if (result.success) {
        setReviewForm({ rating: 5, reviewText: '' })
        fetchMovieDetails() // Refresh reviews
      }
    } catch (err) {
      console.error('Review submission error:', err)
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading movie details..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorMessage 
          message={error} 
          onRetry={fetchMovieDetails}
          retryText="Try Again"
        />
      </div>
    )
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Movie not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Movie Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Movie Poster */}
            <div className="flex-shrink-0">
              {movie.posterUrl ? (
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-64 h-96 object-cover rounded-lg"
                />
              ) : (
                <div className="w-64 h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">No Image</span>
                </div>
              )}
            </div>

            {/* Movie Info */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                {movie.title}
              </h1>
              
              <div className="flex items-center gap-4 mb-4">
                {movie.averageRating > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-400 text-2xl">⭐</span>
                    <span className="text-2xl font-semibold">{movie.averageRating.toFixed(1)}</span>
                  </div>
                )}
                {movie.releaseYear && (
                  <span className="text-lg text-gray-600">({movie.releaseYear})</span>
                )}
              </div>

              {movie.director && (
                <p className="text-gray-700 mb-2">
                  <span className="font-semibold">Director:</span> {movie.director}
                </p>
              )}

              {movie.genre && movie.genre.length > 0 && (
                <div className="mb-4">
                  <span className="font-semibold text-gray-700">Genres:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {movie.genre.map((genre, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {movie.cast && movie.cast.length > 0 && (
                <div className="mb-4">
                  <span className="font-semibold text-gray-700">Cast:</span>
                  <p className="text-gray-600">{movie.cast.join(', ')}</p>
                </div>
              )}

              {movie.synopsis && (
                <div className="mb-6">
                  <span className="font-semibold text-gray-700">Synopsis:</span>
                  <p className="text-gray-600 mt-1">{movie.synopsis}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                {isAuthenticated() && (
                  <button
                    onClick={handleAddToWatchlist}
                    className={`px-6 py-2 rounded-md transition duration-200 ${
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
          </div>
        </div>

        {/* Reviews Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add Review Form */}
          <ProtectedReviewForm
            movieId={id}
            onSubmit={handleSubmitReview}
            loading={submittingReview}
          />

          {/* Reviews List */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Reviews ({reviews.length})
            </h3>
            
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review._id} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800">
                          {review.userId?.username || 'Anonymous'}
                        </span>
                        <div className="flex text-yellow-400">
                          {'⭐'.repeat(review.rating)}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    {review.reviewText && (
                      <p className="text-gray-600">{review.reviewText}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No reviews yet. Be the first to review!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MovieDetailPage
