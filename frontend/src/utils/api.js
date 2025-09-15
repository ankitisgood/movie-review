import axios from 'axios'

// Base URL for API calls
const API_BASE_URL = 'http://localhost:3002/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear auth data
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// API Functions

// Get movies with optional query parameters
export const getMovies = async (query = {}) => {
  try {
    const response = await api.get('/movies', { params: query })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Get movies error:', error)
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch movies'
    }
  }
}

// Get movie by ID
export const getMovieById = async (id) => {
  try {
    const response = await api.get(`/movies/${id}`)
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Get movie by ID error:', error)
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch movie'
    }
  }
}

// Add review to a movie
export const addReview = async (movieId, reviewData) => {
  try {
    const response = await api.post(`/movies/${movieId}/reviews`, reviewData)
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Add review error:', error)
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to add review'
    }
  }
}

// User authentication
export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials)
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Login error:', error)
    return {
      success: false,
      error: error.response?.data?.message || 'Login failed'
    }
  }
}

export const register = async (data) => {
  try {
    const response = await api.post('/auth/register', data)
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Registration error:', error)
    return {
      success: false,
      error: error.response?.data?.message || 'Registration failed'
    }
  }
}

// Get user profile
export const getUserProfile = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`)
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Get user profile error:', error)
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch user profile'
    }
  }
}

// Manage user watchlist
export const manageWatchlist = async (userId, movieId, action) => {
  try {
    let response
    if (action === 'add') {
      response = await api.post(`/users/${userId}/watchlist`, { movieId })
    } else if (action === 'remove') {
      response = await api.delete(`/users/${userId}/watchlist/${movieId}`)
    } else {
      throw new Error('Invalid action. Use "add" or "remove"')
    }
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Manage watchlist error:', error)
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to manage watchlist'
    }
  }
}

// Additional utility functions

// Upload movie poster
export const uploadPoster = async (formData) => {
  try {
    const response = await api.post('/movies/uploadPoster', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Upload poster error:', error)
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to upload poster'
    }
  }
}

// Create movie (admin only)
export const createMovie = async (movieData) => {
  try {
    const response = await api.post('/movies', movieData)
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Create movie error:', error)
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to create movie'
    }
  }
}

// Update user profile
export const updateUserProfile = async (userId, profileData) => {
  try {
    const response = await api.put(`/users/${userId}`, profileData)
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Update user profile error:', error)
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update profile'
    }
  }
}

// Get user watchlist
export const getWatchlist = async (userId, query = {}) => {
  try {
    const response = await api.get(`/users/${userId}/watchlist`, { params: query })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Get watchlist error:', error)
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch watchlist'
    }
  }
}

// Get movie reviews
export const getMovieReviews = async (movieId, query = {}) => {
  try {
    const response = await api.get(`/movies/${movieId}/reviews`, { params: query })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Get movie reviews error:', error)
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch reviews'
    }
  }
}

export default api
