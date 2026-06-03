import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import routes from './routes'
import { AuthProvider, useAuth } from './context/AuthContext'
import { SubscriptionProvider } from './context/SubscriptionContext'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import LandingPage from './pages/LandingPage'
import FeaturesPage from './pages/features/FeaturesPage'
import HowItWorksPage from './pages/how-it-works/HowItWorksPage'
import PricingPage from './pages/pricing/PricingPage'
import Dashboard from './pages/dashboard/Dashboard'
import Editor from './pages/editor/Editor'
import ProjectSetup from './pages/editor/ProjectSetup'
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import AuthSuccess from './pages/auth/AuthSuccess'
import SettingsPage from './pages/settings/SettingsPage'
import NotFoundPage from './pages/error/NotFoundPage'
import PublicPortfolio from './pages/portfolio/PublicPortfolio'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import CheckoutTestPage from './pages/payment/CheckoutTestPage'

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

// Admin route guard
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">Loading...</div>;

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
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
        <Route 
          path={routes.features} 
          element={
            <>
              <Navbar />
              <FeaturesPage />
              <Footer />
            </>
          } 
        />

        <Route 
          path={routes.howItWorks} 
          element={
            <>
              <Navbar />
              <HowItWorksPage />
              <Footer />
            </>
          } 
        />

        <Route 
          path={routes.pricing} 
          element={
            <>
              <Navbar />
              <PricingPage />
              <Footer />
            </>
          } 
        />

        <Route path={routes.auth.login} element={<LoginPage />} />
        <Route path={routes.auth.signup} element={<SignupPage />} />
        <Route path={routes.auth.success} element={<AuthSuccess />} />

        {/* Checkout Test (Protected) */}
        <Route 
          path={routes.checkoutTest} 
          element={
            <ProtectedRoute>
              <Navbar />
              <CheckoutTestPage />
              <Footer />
            </ProtectedRoute>
          } 
        />

        {/* Public Portfolio Views (Unauthenticated) */}
        <Route path={routes.publicPortfolio} element={<PublicPortfolio />} />
        <Route path={routes.publicPortfolioDefault} element={<PublicPortfolio />} />
        <Route path={routes.publicPortfolioById} element={<PublicPortfolio />} />

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

        {/* Project Setup Route (Protected) */}
        <Route 
          path={routes.project.new} 
          element={
            <ProtectedRoute>
              <ProjectSetup />
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

        {/* Admin Routes (Protected) */}
        <Route 
          path={routes.admin} 
          element={
            <AdminRoute>
              <Navbar />
              <AdminDashboard />
              <Footer />
            </AdminRoute>
          } 
        />

        <Route 
          path={routes.adminUsers} 
          element={
            <AdminRoute>
              <Navbar />
              <AdminUsers />
              <Footer />
            </AdminRoute>
          } 
        />

        {/* 404 Catch-all Route */}
        <Route path={routes.notFound} element={<NotFoundPage />} />
      </Routes>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <Router>
          <AppContent />
        </Router>
      </SubscriptionProvider>
    </AuthProvider>
  )
}

export default App