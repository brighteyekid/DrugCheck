import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaBug, 
  FaExclamationTriangle, 
  FaNetworkWired, 
  FaDatabase, 
  FaCogs, 
  FaServer,
  FaRegSadTear,
  FaHeartBroken,
  FaTools,
  FaRobot
} from 'react-icons/fa';
import '../styles/ErrorBoundary.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private getErrorIcon(errorMessage: string) {
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return <FaNetworkWired className="error-icon network" />;
    }
    if (errorMessage.includes('database') || errorMessage.includes('data')) {
      return <FaDatabase className="error-icon database" />;
    }
    if (errorMessage.includes('syntax') || errorMessage.includes('parsing')) {
      return <FaCogs className="error-icon syntax" />;
    }
    if (errorMessage.includes('server') || errorMessage.includes('500')) {
      return <FaServer className="error-icon server" />;
    }
    if (errorMessage.includes('undefined') || errorMessage.includes('null')) {
      return <FaBug className="error-icon bug" />;
    }
    if (errorMessage.includes('permission') || errorMessage.includes('auth')) {
      return <FaExclamationTriangle className="error-icon auth" />;
    }
    return <FaRegSadTear className="error-icon generic" />;
  }

  private getErrorMessage(error: Error): string {
    const errorMap: { [key: string]: string } = {
      'TypeError': 'Oops! Something unexpected happened',
      'SyntaxError': 'There\'s a small hiccup in our code',
      'ReferenceError': 'We\'re having trouble finding something',
      'NetworkError': 'Having trouble connecting to our servers',
      'AuthError': 'Authentication issues detected',
      'DatabaseError': 'Database connection issues'
    };

    return errorMap[error.name] || 'Something went wrong';
  }

  public render() {
    if (this.state.hasError) {
      return (
        <AnimatePresence>
          <motion.div 
            className="error-boundary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <motion.div 
              className="error-container"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 100 }}
            >
              <motion.div 
                className="error-icon-container"
                animate={{ 
                  rotate: [0, -10, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                {this.getErrorIcon(this.state.error?.message || '')}
              </motion.div>

              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {this.getErrorMessage(this.state.error!)}
              </motion.h2>

              <motion.div 
                className="error-details"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <p>Don't worry, our team has been notified!</p>
                <div className="error-actions">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.location.reload()}
                    className="retry-button"
                  >
                    <FaTools className="button-icon" />
                    Try Again
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.location.href = '/'}
                    className="home-button"
                  >
                    <FaHeartBroken className="button-icon" />
                    Go Home
                  </motion.button>
                </div>
              </motion.div>

              {process.env.NODE_ENV === 'development' && (
                <motion.div 
                  className="dev-error-details"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ delay: 0.6 }}
                >
                  <FaRobot className="dev-icon" />
                  <pre>{this.state.error?.toString()}</pre>
                  <pre>{this.state.errorInfo?.componentStack}</pre>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 