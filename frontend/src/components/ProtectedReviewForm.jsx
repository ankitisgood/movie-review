import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'
import ReviewForm from './ReviewForm'

const ProtectedReviewForm = (props) => {
  const { isAuthenticated } = useAuth()
  
  // If user is not authenticated, redirect to login page
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  
  // If user is authenticated, render the ReviewForm component
  return <ReviewForm {...props} />
}

export default ProtectedReviewForm