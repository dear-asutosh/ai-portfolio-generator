import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
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
import { useEffect } from 'react'

gsap.registerPlugin(ScrollTrigger);

const PageWrapper = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
};

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
  const location = useLocation();

  // 1. Initialize Lenis Smooth Scrolling globally
  useEffect(() => {
    // Disable Lenis smooth scrolling in the Editor page (IDE) where we need native high-performance scrolling inside panel containers
    if (location.pathname.startsWith('/project/')) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // premium ease
      smoothWheel: true,
      autoRaf: false, // Disable default RAF to avoid double updates & layout conflicts
    });

    // Sync ScrollTrigger HMR loops
    lenis.on('scroll', ScrollTrigger.update);

    const updateLenis = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateLenis);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(updateLenis);
      lenis.destroy();
    };
  }, [location.pathname]);

  // 2. Global GSAP Scroll Reveals on page transition
  useEffect(() => {
    const globalTriggers = [];

    const timer = setTimeout(() => {
      // A. Text Reveal: slide up & fade
      const revealTexts = document.querySelectorAll('.reveal-text');
      revealTexts.forEach((el) => {
        const anim = gsap.fromTo(el,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              toggleActions: "play none none none",
            }
          }
        );
        if (anim.scrollTrigger) {
          globalTriggers.push(anim.scrollTrigger);
        }
      });

      // B. Staggered Container Card Reveal
      const revealContainers = document.querySelectorAll('.reveal-container');
      revealContainers.forEach((container) => {
        const cards = container.querySelectorAll('.reveal-card');
        if (cards.length > 0) {
          const anim = gsap.fromTo(cards,
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
              stagger: 0.12,
              ease: "power3.out",
              scrollTrigger: {
                trigger: container,
                start: "top 82%",
                toggleActions: "play none none none",
              }
            }
          );
          if (anim.scrollTrigger) {
            globalTriggers.push(anim.scrollTrigger);
          }
        }
      });

      ScrollTrigger.refresh();
    }, 100);

    return () => {
      clearTimeout(timer);
      globalTriggers.forEach((t) => t.kill());
    };
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public Routes */}
          <Route 
            path={routes.home} 
            element={
              <PageWrapper>
                <Navbar />
                <LandingPage />
                <Footer />
              </PageWrapper>
            } 
          />
          <Route 
            path={routes.features} 
            element={
              <PageWrapper>
                <Navbar />
                <FeaturesPage />
                <Footer />
              </PageWrapper>
            } 
          />

          <Route 
            path={routes.howItWorks} 
            element={
              <PageWrapper>
                <Navbar />
                <HowItWorksPage />
                <Footer />
              </PageWrapper>
            } 
          />

          <Route 
            path={routes.pricing} 
            element={
              <PageWrapper>
                <Navbar />
                <PricingPage />
                <Footer />
              </PageWrapper>
            } 
          />

          <Route path={routes.auth.login} element={<PageWrapper><LoginPage /></PageWrapper>} />
          <Route path={routes.auth.signup} element={<PageWrapper><SignupPage /></PageWrapper>} />
          <Route path={routes.auth.success} element={<PageWrapper><AuthSuccess /></PageWrapper>} />

          {/* Checkout Test (Protected) */}
          <Route 
            path={routes.checkoutTest} 
            element={
              <ProtectedRoute>
                <PageWrapper>
                  <Navbar />
                  <CheckoutTestPage />
                  <Footer />
                </PageWrapper>
              </ProtectedRoute>
            } 
          />

          {/* Public Portfolio Views (Unauthenticated) */}
          <Route path={routes.publicPortfolio} element={<PageWrapper><PublicPortfolio /></PageWrapper>} />
          <Route path={routes.publicPortfolioDefault} element={<PageWrapper><PublicPortfolio /></PageWrapper>} />
          <Route path={routes.publicPortfolioById} element={<PageWrapper><PublicPortfolio /></PageWrapper>} />

          {/* Dashboard Route (Protected) */}
          <Route 
            path={routes.dashboard} 
            element={
              <ProtectedRoute>
                <PageWrapper>
                  <Navbar />
                  <Dashboard />
                  <Footer />
                </PageWrapper>
              </ProtectedRoute>
            } 
          />

          {/* Settings Route (Protected) */}
          <Route 
            path={routes.settings} 
            element={
              <ProtectedRoute>
                <PageWrapper>
                  <Navbar />
                  <SettingsPage />
                  <Footer />
                </PageWrapper>
              </ProtectedRoute>
            } 
          />

          {/* Project Setup Route (Protected) */}
          <Route 
            path={routes.project.new} 
            element={
              <ProtectedRoute>
                <PageWrapper>
                  <ProjectSetup />
                </PageWrapper>
              </ProtectedRoute>
            } 
          />

          {/* Editor/IDE Route (Protected) */}
          <Route 
            path={routes.project.index} 
            element={
              <ProtectedRoute>
                <PageWrapper>
                  <Editor />
                </PageWrapper>
              </ProtectedRoute>
            } 
          />

          {/* Admin Routes (Protected) */}
          <Route 
            path={routes.admin} 
            element={
              <AdminRoute>
                <PageWrapper>
                  <Navbar />
                  <AdminDashboard />
                  <Footer />
                </PageWrapper>
              </AdminRoute>
            } 
          />

          <Route 
            path={routes.adminUsers} 
            element={
              <AdminRoute>
                <PageWrapper>
                  <Navbar />
                  <AdminUsers />
                  <Footer />
                </PageWrapper>
              </AdminRoute>
            } 
          />

          {/* 404 Catch-all Route */}
          <Route path={routes.notFound} element={<PageWrapper><NotFoundPage /></PageWrapper>} />
        </Routes>
      </AnimatePresence>
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