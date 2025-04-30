import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Home from './components/Home';
import InteractionChecker from './components/InteractionChecker';
import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';
import BootSplash from './components/BootSplash';
import MentalHealthChatbot from './components/MentalHealthChatbot';
import MedicineAlternativeFinder from './components/MedicineAlternativeFinder';
import HealthInsightGenerator from './components/HealthInsightGenerator';
import UniversalHealthID from './components/UniversalHealthID';
import { DrugProvider } from './context/DrugContext';
import './styles/global.css';

function MainContent() {
  return (
    <Router>
      <Navbar />
      <div className="page-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/checker" element={<InteractionChecker />} />
          <Route path="/universal-id" element={<UniversalHealthID />} />
          <Route path="/mental-health" element={<MentalHealthChatbot />} />
          <Route path="/med-alternatives" element={<MedicineAlternativeFinder />} />
          <Route path="/health-insights" element={<HealthInsightGenerator />} />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  const [loading, setLoading] = useState(true);

  const handleSplashFinished = () => {
    setLoading(false);
  };

  return (
    <ErrorBoundary>
      <DrugProvider>
        <AnimatePresence mode="wait">
          {loading ? (
            <BootSplash key="bootsplash" onFinished={handleSplashFinished} />
          ) : (
            <MainContent key="app-content" />
          )}
        </AnimatePresence>
      </DrugProvider>
    </ErrorBoundary>
  );
}

export default App;
