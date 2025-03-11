import { Link, useLocation } from 'react-router-dom';
import { FaPills, FaHome, FaSearch } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import '../styles/Navbar.css';

const Navbar = () => {
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
      </div>
    </motion.nav>
  );
};

export default Navbar; 