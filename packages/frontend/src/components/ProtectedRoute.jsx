import { Navigate } from 'react-router-dom'

export function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token')
  
  if (!token) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

export function PublicRoute({ children }) {
  const token = localStorage.getItem('token')
  
  if (token) {
    return <Navigate to="/dashboard" replace />
  }
  
  return children
}
