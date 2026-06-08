
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Ghost } from 'lucide-react';
import routes from '../../routes';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-white px-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="z-10 text-center"
      >
        <motion.div
          animate={{ 
            y: [0, -20, 0],
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="mb-8 flex justify-center"
        >
          <div className="p-6 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl relative">
             <Ghost size={80} className="text-cyan-400 opacity-80" />
             <div className="absolute -top-2 -right-2 bg-red-500 text-xs font-bold px-2 py-1 rounded-full border border-white/20">404</div>
          </div>
        </motion.div>

        <h1 className="text-7xl md:text-9xl font-bold mb-4 tracking-tighter gradient-text leading-none">
          Lost?
        </h1>
        
        <p className="text-xl md:text-2xl text-white/60 mb-12 max-w-md mx-auto font-light leading-relaxed">
          Oops! We're sorry, but the page you're looking for has vanished into the digital void. Don't worry, we'll help you find your way back.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to={routes.home}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-cyan-400 transition-colors duration-300"
            >
              <Home size={18} />
              Back to Home
            </motion.button>
          </Link>
          
          <button 
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-8 py-4 bg-white/5 border border-white/10 hover:border-white/30 text-white font-semibold rounded-full backdrop-blur-sm transition-all duration-300"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
        </div>
      </motion.div>

      {/* Subtle bottom text */}
      <div className="absolute bottom-10 left-0 right-0 text-center opacity-20 pointer-events-none">
        <p className="text-sm uppercase tracking-[0.5em] font-medium">PortfolioAI / Infinity</p>
      </div>
    </div>
  );
};

export default NotFoundPage;
