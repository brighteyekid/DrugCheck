import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Home from './components/Home';
import InteractionChecker from './components/InteractionChecker';
import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';
import BootSplash from './components/BootSplash';
import { DrugProvider } from './context/DrugContext';
import './styles/global.css';

function App() {
  const [loading, setLoading] = useState(true);

  const handleSplashFinished = () => {
    setLoading(false);
  };

  return (
    <ErrorBoundary>
      <AnimatePresence mode="wait">
        {loading ? (
          <BootSplash key="bootsplash" onFinished={handleSplashFinished} />
        ) : (
          <DrugProvider key="app-content">
            <Router>
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/checker" element={<InteractionChecker />} />
              </Routes>
            </Router>
          </DrugProvider>
        )}
      </AnimatePresence>
    </ErrorBoundary>
  );
}

export default App;
