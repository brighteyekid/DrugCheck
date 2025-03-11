import { motion } from 'framer-motion';
// import '../styles/LoadingSpinner.css';

const LoadingSpinner = () => {
  return (
    <motion.div 
      className="loading-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="spinner">
        <motion.div 
          className="spinner-ring"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </motion.div>
  );
};

export default LoadingSpinner;