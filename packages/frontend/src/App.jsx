import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ProductsPage from './pages/ProductsPage'
import UsersPage from './pages/UsersPage'
import POSPage from './pages/POSPage'
import SalesPage from './pages/SalesPage'

function App() {
  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } 
      />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/products" 
        element={
          <ProtectedRoute>
            <ProductsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/users" 
        element={
          <ProtectedRoute>
            <UsersPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/pos" 
        element={
          <ProtectedRoute>
            <POSPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/sales" 
        element={
          <ProtectedRoute>
            <SalesPage />
          </ProtectedRoute>
        } 
      />
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
