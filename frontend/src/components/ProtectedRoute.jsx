import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth()
  
  // If user is not authenticated, redirect to login page
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  
  // If user is authenticated, render the child component(s)
  return children
}

export default ProtectedRoute