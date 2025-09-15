import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import MovieForm from '../components/MovieForm'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'

const AdminPage = () => {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')

  // Check if user is authenticated and redirect if not
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true)
        
        // If not authenticated, redirect to login
        if (!isAuthenticated()) {
          navigate('/login')
          return
        }
        
        // For now, we'll allow any authenticated user to access this page
        // In a real app, you would check for admin role here
        setLoading(false)
      } catch (err) {
        console.error('Auth check error:', err)
        setError('Authentication error')
        setLoading(false)
      }
    }
    
    checkAuth()
  }, [isAuthenticated, navigate])

  // Handle movie creation success
  const handleMovieCreated = (movie) => {
    setSuccessMessage(`Movie "${movie.title}" created successfully!`)
    
    // Clear success message after 5 seconds
    setTimeout(() => {
      setSuccessMessage('')
    }, 5000)
    
    // Optionally redirect to the movie detail page
    // navigate(`/movies/${movie._id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">
          Admin Dashboard
        </h1>
        
        {error && (
          <ErrorMessage 
            message={error} 
            onClose={() => setError(null)} 
            className="mb-6"
          />
        )}
        
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {successMessage}
          </div>
        )}
        
        <div className="mb-8">
          <MovieForm onSuccess={handleMovieCreated} />
        </div>
      </div>
    </div>
  )
}

export default AdminPage