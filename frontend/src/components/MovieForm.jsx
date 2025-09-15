import { useState } from 'react'
import { createMovie } from '../utils/api'
import UploadPoster from './UploadPoster'
import LoadingSpinner from './LoadingSpinner'
import ErrorMessage from './ErrorMessage'

const MovieForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    genre: [],
    releaseYear: new Date().getFullYear(),
    director: '',
    cast: [],
    synopsis: '',
    posterUrl: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')

  // Available genres
  const availableGenres = [
    'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary',
    'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller'
  ]

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  // Handle genre selection
  const handleGenreChange = (e) => {
    const value = Array.from(
      e.target.selectedOptions,
      option => option.value
    )
    setFormData({
      ...formData,
      genre: value
    })
  }

  // Handle cast input (comma-separated)
  const handleCastChange = (e) => {
    const castArray = e.target.value
      .split(',')
      .map(actor => actor.trim())
      .filter(actor => actor !== '')
    
    setFormData({
      ...formData,
      cast: castArray
    })
  }

  // Handle poster upload success
  const handlePosterUpload = (posterUrl) => {
    setFormData({
      ...formData,
      posterUrl
    })
    setSuccessMessage('Poster uploaded successfully!')
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage('')
    }, 3000)
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Basic validation
    if (!formData.title) {
      setError('Title is required')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const result = await createMovie(formData)

      if (result.success) {
        // Reset form
        setFormData({
          title: '',
          genre: [],
          releaseYear: new Date().getFullYear(),
          director: '',
          cast: [],
          synopsis: '',
          posterUrl: ''
        })
        
        // Call success callback if provided
        if (onSuccess) {
          onSuccess(result.data.movie)
        }
      } else {
        setError(result.error || 'Failed to create movie')
      }
    } catch (err) {
      console.error('Create movie error:', err)
      setError('An error occurred while creating the movie')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Movie</h2>
      
      {error && (
        <ErrorMessage 
          message={error} 
          onClose={() => setError(null)} 
          className="mb-4"
        />
      )}
      
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Movie Details Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Movie title"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Release Year */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Release Year
            </label>
            <input
              type="number"
              name="releaseYear"
              value={formData.releaseYear}
              onChange={handleChange}
              min="1900"
              max={new Date().getFullYear() + 5}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Director */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Director
            </label>
            <input
              type="text"
              name="director"
              value={formData.director}
              onChange={handleChange}
              placeholder="Movie director"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Cast */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cast (comma-separated)
            </label>
            <input
              type="text"
              name="cast"
              value={formData.cast.join(', ')}
              onChange={handleCastChange}
              placeholder="Actor 1, Actor 2, Actor 3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Genre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Genre
            </label>
            <select
              name="genre"
              multiple
              value={formData.genre}
              onChange={handleGenreChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              size="5"
            >
              {availableGenres.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Hold Ctrl (or Cmd) to select multiple genres
            </p>
          </div>

          {/* Synopsis */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Synopsis
            </label>
            <textarea
              name="synopsis"
              value={formData.synopsis}
              onChange={handleChange}
              placeholder="Movie synopsis..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Poster URL is handled by UploadPoster component */}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-700 text-white py-2 px-4 rounded-md transition duration-200 disabled:opacity-50 mt-4"
          >
            {loading ? <LoadingSpinner size="sm" /> : 'Create Movie'}
          </button>
        </form>

        {/* Poster Upload */}
        <div>
          <UploadPoster onUploadSuccess={handlePosterUpload} />
        </div>
      </div>
    </div>
  )
}

export default MovieForm