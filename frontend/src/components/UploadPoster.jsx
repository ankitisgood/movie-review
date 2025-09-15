import { useState } from 'react'
import { uploadPoster } from '../utils/api'
import LoadingSpinner from './LoadingSpinner'
import ErrorMessage from './ErrorMessage'

const UploadPoster = ({ onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB')
      return
    }

    setSelectedFile(file)
    setError(null)

    // Create preview URL
    const fileReader = new FileReader()
    fileReader.onload = () => {
      setPreviewUrl(fileReader.result)
    }
    fileReader.readAsDataURL(file)
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!selectedFile) {
      setError('Please select an image file')
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Create form data
      const formData = new FormData()
      formData.append('poster', selectedFile)

      // Upload poster
      const result = await uploadPoster(formData)

      if (result.success) {
        // Call the callback with the poster URL
        if (onUploadSuccess) {
          onUploadSuccess(result.data.posterUrl)
        }
      } else {
        setError(result.error || 'Failed to upload poster')
      }
    } catch (err) {
      console.error('Upload error:', err)
      setError('An error occurred while uploading the poster')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        Upload Movie Poster
      </h3>

      {error && (
        <ErrorMessage 
          message={error} 
          onClose={() => setError(null)} 
          className="mb-4"
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* File Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="mt-1 text-xs text-gray-500">
            Supported formats: JPG, JPEG, PNG, GIF, WEBP (Max: 5MB)
          </p>
        </div>

        {/* Image Preview */}
        {previewUrl && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
            <div className="relative w-40 h-60 mx-auto border border-gray-300 rounded-md overflow-hidden">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !selectedFile}
          className="w-full bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition duration-200 disabled:opacity-50"
        >
          {loading ? <LoadingSpinner size="sm" /> : 'Upload Poster'}
        </button>
      </form>
    </div>
  )
}

export default UploadPoster