import { Link, useLocation } from 'react-router-dom';
import { FaPills, FaHome, FaSearch, FaComments, FaExchangeAlt, FaChartLine, FaIdCard } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import '../styles/Navbar.css';

const Navbar: React.FC = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav 
      className={`navbar ${scrolled ? 'scrolled' : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
    >
      <Link to="/" className="nav-brand">
        <motion.div
          className="brand-icon"
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.6 }}
        >
          <FaPills />
        </motion.div>
        <motion.span
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          DrugCheck
        </motion.span>
      </Link>
      
      <div className="nav-links">
        <motion.div className="nav-link-wrapper">
          <Link 
            to="/" 
            className={location.pathname === '/' ? 'active' : ''}
          >
            <FaHome className="nav-icon" />
            <span>Home</span>
          </Link>
          <AnimatePresence>
            {location.pathname === '/' && (
              <motion.div
                className="active-indicator"
                layoutId="activeIndicator"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div className="nav-link-wrapper">
          <Link 
            to="/checker" 
            className={location.pathname === '/checker' ? 'active' : ''}
          >
            <FaSearch className="nav-icon" />
            <span>Check Interactions</span>
          </Link>
          <AnimatePresence>
            {location.pathname === '/checker' && (
              <motion.div
                className="active-indicator"
                layoutId="activeIndicator"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            )}
          </AnimatePresence>
        </motion.div>
        
        <motion.div className="nav-link-wrapper">
          <Link 
            to="/universal-id" 
            className={location.pathname === '/universal-id' ? 'active' : ''}
          >
            <FaIdCard className="nav-icon" />
            <span>Health ID</span>
          </Link>
          <AnimatePresence>
            {location.pathname === '/universal-id' && (
              <motion.div
                className="active-indicator"
                layoutId="activeIndicator"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            )}
          </AnimatePresence>
        </motion.div>
        
        <motion.div className="nav-link-wrapper">
          <Link 
            to="/mental-health" 
            className={location.pathname === '/mental-health' ? 'active' : ''}
          >
            <FaComments className="nav-icon" />
            <span>Mental Health</span>
          </Link>
          <AnimatePresence>
            {location.pathname === '/mental-health' && (
              <motion.div
                className="active-indicator"
                layoutId="activeIndicator"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            )}
          </AnimatePresence>
        </motion.div>
        
        <motion.div className="nav-link-wrapper">
          <Link 
            to="/med-alternatives" 
            className={location.pathname === '/med-alternatives' ? 'active' : ''}
          >
            <FaExchangeAlt className="nav-icon" />
            <span>Med Alternatives</span>
          </Link>
          <AnimatePresence>
            {location.pathname === '/med-alternatives' && (
              <motion.div
                className="active-indicator"
                layoutId="activeIndicator"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            )}
          </AnimatePresence>
        </motion.div>
        
        <motion.div className="nav-link-wrapper">
          <Link 
            to="/health-insights" 
            className={location.pathname === '/health-insights' ? 'active' : ''}
          >
            <FaChartLine className="nav-icon" />
            <span>Health Insights</span>
          </Link>
          <AnimatePresence>
            {location.pathname === '/health-insights' && (
              <motion.div
                className="active-indicator"
                layoutId="activeIndicator"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.nav>
  );
};

export default Navbar; 