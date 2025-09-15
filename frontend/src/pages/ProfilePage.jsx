import { useState, useEffect } from 'react'
import { getUserProfile, getWatchlist, manageWatchlist } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import MovieCard from '../components/MovieCard'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'

const ProfilePage = () => {
  const { user, isAuthenticated } = useAuth()
  const [profile, setProfile] = useState(null)
  const [reviews, setReviews] = useState([])
  const [watchlist, setWatchlist] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isAuthenticated()) {
      fetchProfile()
    }
  }, [isAuthenticated])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const result = await getUserProfile(user.id)
      
      if (result.success) {
        setProfile(result.data.user)
        setReviews(result.data.reviews)
      } else {
        setError(result.error)
      }

      // Fetch watchlist
      const watchlistResult = await getWatchlist(user.id)
      if (watchlistResult.success) {
        setWatchlist(watchlistResult.data.watchlist)
      }
    } catch (err) {
      setError('Failed to fetch profile')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFromWatchlist = async (movieId) => {
    try {
      const result = await manageWatchlist(user.id, movieId, 'remove')
      if (result.success) {
        setWatchlist(prev => prev.filter(item => item.movieId._id !== movieId))
      }
    } catch (err) {
      console.error('Remove from watchlist error:', err)
    }
  }

  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Please log in to view your profile
          </h2>
          <p className="text-gray-600">
            You need to be logged in to access this page.
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading profile..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorMessage 
          message={error} 
          onRetry={fetchProfile}
          retryText="Try Again"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">
          Profile
        </h1>
        
        {/* User Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-2xl font-semibold text-gray-600">
                {profile?.username?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">
                {profile?.username}
              </h2>
              <p className="text-gray-600">{profile?.email}</p>
              <p className="text-sm text-gray-500">
                Member since {new Date(profile?.joinDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Reviews Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Your Reviews ({reviews.length})
            </h3>
            
            {reviews.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {reviews.map((review) => (
                  <div key={review._id} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-800">
                        {review.movieId?.title}
                      </h4>
                      <div className="flex text-yellow-400">
                        {'⭐'.repeat(review.rating)}
                      </div>
                    </div>
                    {review.reviewText && (
                      <p className="text-gray-600 text-sm">{review.reviewText}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(review.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">You haven't written any reviews yet.</p>
            )}
          </div>

          {/* Watchlist Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Your Watchlist ({watchlist.length})
            </h3>
            
            {watchlist.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {watchlist.map((item) => (
                  <div key={item._id} className="flex items-center gap-4 border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="flex-shrink-0">
                      {item.movieId.posterUrl ? (
                        <img
                          src={item.movieId.posterUrl}
                          alt={item.movieId.title}
                          className="w-16 h-24 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-24 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-xs text-gray-500">No Image</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-800 truncate">
                        {item.movieId.title}
                      </h4>
                      {item.movieId.releaseYear && (
                        <p className="text-sm text-gray-600">
                          {item.movieId.releaseYear}
                        </p>
                      )}
                      {item.movieId.averageRating > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-yellow-400 text-sm">⭐</span>
                          <span className="text-sm text-gray-600">
                            {item.movieId.averageRating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => handleRemoveFromWatchlist(item.movieId._id)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Your watchlist is empty.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
