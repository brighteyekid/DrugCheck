import { FC } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaPills, FaSearch, FaShieldAlt, FaUserMd, FaArrowRight, FaHistory, FaCloudDownloadAlt } from 'react-icons/fa';
import { MdWarning, MdSecurity, MdSpeed } from 'react-icons/md';
import '../styles/Home.css';

const Home: FC = () => {
  const features = [
    {
      icon: <FaSearch />,
      title: 'Smart Drug Search',
      description: 'Quickly search and find medications from our comprehensive database',
      color: '#6366f1'
    },
    {
      icon: <MdWarning />,
      title: 'Interaction Detection',
      description: 'Advanced AI-powered detection of potential drug interactions',
      color: '#f43f5e'
    },
    {
      icon: <FaShieldAlt />,
      title: 'Safety First',
      description: 'Get detailed safety information and recommendations',
      color: '#10b981'
    },
    {
      icon: <FaUserMd />,
      title: 'Professional Insights',
      description: 'Based on trusted medical databases and research',
      color: '#8b5cf6'
    },
    {
      icon: <FaHistory />,
      title: 'Search History',
      description: 'Keep track of your previous medication searches and interactions',
      color: '#ec4899'
    },
    {
      icon: <FaCloudDownloadAlt />,
      title: 'Real-Time Updates',
      description: 'Access the latest drug information with automatic database updates',
      color: '#14b8a6'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <motion.div 
      className="home-container"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div 
        className="hero-section"
        variants={itemVariants}
      >
        <motion.div
          className="hero-icon-wrapper"
          animate={{
            rotate: [0, 10, -10, 10, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <FaPills className="hero-icon" />
        </motion.div>
        <motion.h1 
          className="hero-title"
          variants={itemVariants}
        >
          Drug Interaction Checker
        </motion.h1>
        <motion.p 
          className="hero-subtitle"
          variants={itemVariants}
        >
          Check potential interactions between your medications using AI-powered analysis
        </motion.p>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link to="/checker" className="cta-button">
            Check Interactions Now
            <FaArrowRight className="arrow-icon" />
          </Link>
        </motion.div>
      </motion.div>

      <motion.div 
        className="features-grid"
        variants={containerVariants}
      >
        {features.map((feature, index) => (
          <motion.div 
            key={index}
            className="feature-card"
            variants={itemVariants}
            whileHover={{ 
              y: -10,
              transition: { duration: 0.2 }
            }}
            style={{
              '--feature-color': feature.color
            } as React.CSSProperties}
          >
            <motion.div 
              className="feature-icon"
              whileHover={{ 
                rotate: [0, -10, 10, -10, 0],
                transition: { duration: 0.5 }
              }}
            >
              {feature.icon}
            </motion.div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div 
        className="info-section"
        variants={itemVariants}
      >
        <motion.div 
          className="info-content"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2>Why Check Drug Interactions?</h2>
          <p>
            Drug interactions can lead to unexpected side effects or reduce medication effectiveness.
            Our tool helps you make informed decisions about your medications and stay safe.
          </p>
          <motion.div 
            className="stats-container"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <div className="stat-item">
              <MdSpeed className="stat-icon" />
              <h3>Fast Results</h3>
              <p>Instant interaction checks</p>
            </div>
            <div className="stat-item">
              <MdSecurity className="stat-icon" />
              <h3>Reliable Data</h3>
              <p>Trusted medical sources</p>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Home; 