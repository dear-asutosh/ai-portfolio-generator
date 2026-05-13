import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import routes from './routes'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/dashboard/Dashboard'
import Editor from './pages/editor/Editor'
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import AuthSuccess from './pages/auth/AuthSuccess'

import SettingsPage from './pages/settings/SettingsPage'

// A simple wrapper for protected routes
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  if (loading) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">Loading...</div>;
  
  if (!user) {
    return <Navigate to={routes.auth.login} replace />;
  }

  // If user is logged in but hasn't set a username, force them to settings
  // unless they are already on the settings page
  if (!user.username && location.pathname !== routes.settings) {
    return <Navigate to={`${routes.settings}?onboarding=true`} replace />;
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
        <Route path={routes.auth.signup} element={<SignupPage />} />
        <Route path={routes.auth.success} element={<AuthSuccess />} />

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

        {/* Settings Route (Protected) */}
        <Route 
          path={routes.settings} 
          element={
            <ProtectedRoute>
              <Navbar />
              <SettingsPage />
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