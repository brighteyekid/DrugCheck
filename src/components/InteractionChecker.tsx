import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTimes, FaExclamationTriangle, FaInfoCircle, FaPills, 
  FaFlask, FaShieldAlt, FaSearch,
  FaClock
} from 'react-icons/fa';
import { Drug, DetailedInteraction, MedicationReportData } from '../types/types';
import DrugSearch from './DrugSearch';
import { checkInteractions, generateDetailedReport } from '../services/api';
import '../styles/InteractionChecker.css';
import { useDrugContext } from '../context/useDrugContext';
import MedicationReport from './MedicationReport';

const InteractionChecker: React.FC = () => {
  const [selectedDrugs, setSelectedDrugs] = useState<Drug[]>([]);
  const [interactions, setInteractions] = useState<DetailedInteraction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToRecentSearches, saveInteraction } = useDrugContext();
  const [isAiAnalysis, setIsAiAnalysis] = useState(false);
  const [report, setReport] = useState<MedicationReportData | null>(null);

  const handleDrugSelect = (drug: Drug, dosage: string, frequency: string) => {
    if (selectedDrugs.length >= 10) {
      setError('Maximum 10 drugs can be selected');
      return;
    }
    const drugWithDosage = {
      ...drug,
      dosage,
      frequency
    };
    setSelectedDrugs(prev => [...prev, drugWithDosage]);
    addToRecentSearches(drugWithDosage);
  };

  const handleRemoveDrug = (drugId: string) => {
    setSelectedDrugs(prev => prev.filter(drug => drug.id !== drugId));
    setInteractions([]);
    setReport(null);
  };

  const handleAnalyze = async () => {
    if (selectedDrugs.length < 2) {
      setError('Please select at least 2 medications to analyze');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const rxcuis = selectedDrugs.map(d => d.id);
      const interactionData = await checkInteractions(rxcuis);
      
      setIsAiAnalysis(interactionData.some(result => result.aiGenerated === true));
      setInteractions(interactionData);
      interactionData.forEach((interaction: DetailedInteraction) => {
        saveInteraction({
          drugPair: [selectedDrugs[0], selectedDrugs[1]],
          interaction: interaction
        });
      });
      
      const detailedReport = await generateDetailedReport(selectedDrugs);
      setReport(detailedReport);
      
      if (interactionData.length === 0) {
        setError('No interactions found between selected medications');
      }
    } catch (error) {
      setError('Error checking drug interactions');
      console.error('Error checking interactions:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="interaction-checker"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div className="checker-header">
        <motion.h1 className="checker-title">
          <FaShieldAlt className="title-icon" />
          Drug Interaction Checker
        </motion.h1>
        <p className="checker-subtitle">
          Analyze potential interactions between your medications
        </p>
      </motion.div>
      
      <motion.div className="search-section">
        <div className="search-analyze-container">
          <DrugSearch
            onDrugSelect={handleDrugSelect}
            selectedDrugs={selectedDrugs}
          />
          <button
            className="analyze-button"
            onClick={handleAnalyze}
            disabled={selectedDrugs.length < 2 || loading}
          >
            {loading ? (
              <>
                <div className="loading-spinner" />
                Analyzing...
              </>
            ) : (
              <>
                <FaFlask className="button-icon" />
                Analyze
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Selected Drugs List */}
      <AnimatePresence>
        {selectedDrugs.length > 0 && (
          <motion.div 
            className="selected-drugs"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <h3>
              <FaPills className="section-icon" /> Selected Medications
              <span className="drug-count">{selectedDrugs.length}</span>
            </h3>
            <div className="drug-list">
              {selectedDrugs.map((drug, index) => (
                <motion.div
                  key={drug.id}
                  className="drug-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ 
                    duration: 0.3, 
                    delay: index * 0.05,
                    ease: "easeOut" 
                  }}
                  whileHover={{ 
                    scale: 1.02,
                    transition: { duration: 0.2 } 
                  }}
                >
                  <div className="drug-info">
                    <span className="drug-name">{drug.name}</span>
                    <span className="drug-dosage">
                      <FaPills className="dosage-icon" />
                      {drug.dosage} 
                      <span className="frequency-divider">•</span> 
                      <FaClock className="frequency-icon" />
                      {drug.frequency}
                    </span>
                  </div>
                  <button
                    className="remove-button"
                    onClick={() => handleRemoveDrug(drug.id)}
                    aria-label="Remove medication"
                  >
                    <FaTimes />
                  </button>
                </motion.div>
              ))}
            </div>
            {selectedDrugs.length === 1 && (
              <div className="drug-prompt">
                <FaSearch className="prompt-icon" />
                <p>Add one more medication to analyze interactions</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      {error && (
        <motion.div 
          className="error-message"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <FaExclamationTriangle className="error-icon" /> {error}
        </motion.div>
      )}

      {/* AI Analysis Indicator */}
      {isAiAnalysis && interactions.length > 0 && (
        <motion.div 
          className="ai-notice"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <FaInfoCircle className="ai-icon" /> Some interactions were analyzed using AI assistance
        </motion.div>
      )}

      {/* Interaction Results */}
      {report && <MedicationReport report={report} />}
    </motion.div>
  );
};

export default InteractionChecker; 