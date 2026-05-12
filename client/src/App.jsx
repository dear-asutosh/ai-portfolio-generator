import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import routes from './routes'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/dashboard/Dashboard'
import Editor from './pages/editor/Editor'

const App = () => {
  return (
    <Router>
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

          {/* Dashboard Route */}
          <Route
            path={routes.dashboard}
            element={
              <>
                <Navbar />
                <Dashboard />
                <Footer />
              </>
            }
          />

          {/* Editor/IDE Route */}
          <Route path={routes.project.index} element={<Editor />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App