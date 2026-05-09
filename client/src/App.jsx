import React from 'react'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import LandingPage from './pages/LandingPage'

const App = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <LandingPage />
      <Footer />
    </div>
  )
}

export default App