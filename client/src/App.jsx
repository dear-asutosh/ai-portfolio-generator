import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import routes from './routes'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/dashboard/Dashboard'
import Editor from './pages/editor/Editor'
import LoginPage from './pages/auth/LoginPage'

// A simple wrapper for protected routes
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">Loading...</div>;
  
  if (!user) {
    return <Navigate to={routes.auth.login} replace />;
  }
  
  return children;
};

const AppContent = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Routes>
        {/* Public Routes */}
        <Route 
          path={routes.home} 
          element={
            <>
              <Navbar />
              <LandingPage />
              <Footer />
            </>
          } 
        />
        
        <Route path={routes.auth.login} element={<LoginPage />} />

        {/* Dashboard Route (Protected) */}
        <Route 
          path={routes.dashboard} 
          element={
            <ProtectedRoute>
              <Navbar />
              <Dashboard />
              <Footer />
            </ProtectedRoute>
          } 
        />

        {/* Editor/IDE Route (Protected) */}
        <Route 
          path={routes.project.index} 
          element={
            <ProtectedRoute>
              <Editor />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

export default App