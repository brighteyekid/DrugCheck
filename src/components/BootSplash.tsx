import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPills, FaShieldAlt, FaHeartbeat, FaFlask, FaStethoscope } from 'react-icons/fa';
import '../styles/BootSplash.css';

interface BootSplashProps {
  onFinished: () => void;
}

const BootSplash: React.FC<BootSplashProps> = ({ onFinished }) => {
  const [progress, setProgress] = useState(0);
  const [showReady, setShowReady] = useState(false);
  
  useEffect(() => {
    // Simulate loading progress with a more natural curve
    const interval = setInterval(() => {
      setProgress(prev => {
        // Slow down progress as it approaches 100%
        const increment = Math.max(1, 15 * (1 - prev / 100));
        const newProgress = prev + increment * Math.random();
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, 150);
    
    // Show "Ready!" text after reaching 100%
    const progressCheck = setInterval(() => {
      if (progress >= 100) {
        setShowReady(true);
        clearInterval(progressCheck);
        
        // Trigger onFinished after a delay to allow for final animations
        setTimeout(() => {
          onFinished();
        }, 1200);
      }
    }, 200);
    
    return () => {
      clearInterval(interval);
      clearInterval(progressCheck);
    };
  }, [progress, onFinished]);
  
  // Particles data for the background
  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    size: Math.random() * 8 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 5,
    duration: Math.random() * 20 + 15
  }));
  
  return (
    <motion.div 
      className="boot-splash"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8 } }}
    >
      {/* Animated background particles */}
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="particle"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            x: [0, 40, -30, 20, 0],
            y: [0, -30, 40, -20, 0],
            opacity: [0.1, 0.3, 0.2, 0.4, 0.1],
            scale: [1, 1.5, 0.8, 1.2, 1]
          }}
          transition={{
            duration: particle.duration,
            ease: "linear",
            times: [0, 0.25, 0.5, 0.75, 1],
            repeat: Infinity,
            delay: particle.delay
          }}
        />
      ))}
      
      {/* Glowing orbs */}
      <motion.div 
        className="orb orb-1"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{
          duration: 8,
          ease: "easeInOut",
          repeat: Infinity
        }}
      />
      
      <motion.div 
        className="orb orb-2"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.1, 0.3, 0.1]
        }}
        transition={{
          duration: 12,
          ease: "easeInOut",
          repeat: Infinity,
          delay: 2
        }}
      />
      
      <div className="splash-content">
        <motion.div 
          className="logo-container"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 260, 
            damping: 20,
            delay: 0.2
          }}
        >
          {/* Medical logo with animated icons */}
          <motion.div className="logo-circle" />
          
          <div className="logo-icons">
            <motion.div
              className="icon-wrapper"
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 15,
                ease: "linear",
                repeat: Infinity
              }}
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, -15, 0, 15, 0]
                }}
                transition={{
                  duration: 4,
                  ease: "easeInOut",
                  times: [0, 0.25, 0.5, 0.75, 1],
                  repeat: Infinity
                }}
              >
                <FaPills className="logo-icon pills" />
              </motion.div>
            </motion.div>
            
            <motion.div
              className="icon-wrapper shield-wrapper"
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 3,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <FaShieldAlt className="logo-icon shield" />
            </motion.div>
            
            <motion.div
              className="icon-wrapper flask-wrapper"
              animate={{
                y: [0, -8, 0],
                x: [0, 5, 0, -5, 0],
                rotate: [0, 5, 0, -5, 0]
              }}
              transition={{
                duration: 6,
                ease: "easeInOut",
                times: [0, 0.25, 0.5, 0.75, 1],
                repeat: Infinity,
                delay: 0.5
              }}
            >
              <FaFlask className="logo-icon flask" />
            </motion.div>
            
            <motion.div
              className="icon-wrapper"
              animate={{
                scale: [1, 1.15, 1],
                rotate: [0, 10, 0, -10, 0]
              }}
              transition={{
                duration: 2.5,
                ease: "easeInOut",
                times: [0, 0.25, 0.5, 0.75, 1],
                repeat: Infinity,
                repeatType: "mirror"
              }}
            >
              <FaHeartbeat className="logo-icon heartbeat" />
            </motion.div>
            
            <motion.div
              className="icon-wrapper stethoscope-wrapper"
              animate={{
                rotate: [0, 15, 0, -15, 0],
                y: [0, 5, 0, -5, 0]
              }}
              transition={{
                duration: 7,
                ease: "easeInOut",
                times: [0, 0.25, 0.5, 0.75, 1],
                repeat: Infinity,
                delay: 1
              }}
            >
              <FaStethoscope className="logo-icon stethoscope" />
            </motion.div>
          </div>
        </motion.div>
        
        <motion.h1 
          className="app-title"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <span className="text-gradient">Medi</span>Safe
        </motion.h1>
        
        <motion.p 
          className="app-tagline"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          Your Personal Medication Safety Companion
        </motion.p>
        
        <motion.div 
          className="progress-container"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
        >
          <motion.div 
            className="progress-bar"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
          
          <motion.div 
            className="progress-glow"
            style={{ width: `${progress}%` }}
          />
        </motion.div>
        
        <div className="loading-text-container">
          <AnimatePresence mode="wait">
            {!showReady ? (
              <motion.div 
                key="loading"
                className="loading-text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <motion.span
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  Loading
                </motion.span>
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                >
                  .
                </motion.span>
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                >
                  .
                </motion.span>
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
                >
                  .
                </motion.span>
              </motion.div>
            ) : (
              <motion.div 
                key="ready"
                className="ready-text"
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ 
                  type: "spring",
                  stiffness: 400,
                  damping: 15
                }}
              >
                Ready!
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default BootSplash;