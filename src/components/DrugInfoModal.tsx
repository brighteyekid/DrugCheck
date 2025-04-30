import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaInfoCircle, FaTimes, FaPills, FaExclamationTriangle, FaRegLightbulb, FaFileMedical, FaFlask, FaShieldAlt, FaListAlt } from 'react-icons/fa';
import { DrugDetails } from '../types/types';
import { getDrugDetails } from '../services/api';
import '../styles/DrugInfoModal.css';

interface DrugInfoModalProps {
  drugId: string | null;
  onClose: () => void;
}

const DrugInfoModal: React.FC<DrugInfoModalProps> = ({ drugId, onClose }) => {
  const [drugDetails, setDrugDetails] = useState<DrugDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'sideEffects' | 'warnings' | 'usage'>('overview');

  useEffect(() => {
    const fetchDrugDetails = async () => {
      if (!drugId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const details = await getDrugDetails(drugId);
        setDrugDetails(details);
      } catch (err) {
        console.error('Error fetching drug details:', err);
        setError('Failed to load drug information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDrugDetails();
  }, [drugId]);
  
  // Handler for clicking outside the modal to close it
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Display loading state
  if (loading) {
    return (
      <div className="drug-info-modal-backdrop" onClick={handleBackdropClick}>
        <motion.div 
          className="drug-info-modal"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          onClick={e => e.stopPropagation()}
        >
          <div className="drug-info-loading">
            <div className="loading-spinner"></div>
            <p>Loading drug information...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Display error state
  if (error) {
    return (
      <div className="drug-info-modal-backdrop" onClick={handleBackdropClick}>
        <motion.div 
          className="drug-info-modal"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          onClick={e => e.stopPropagation()}
        >
          <div className="drug-info-header">
            <h2><FaExclamationTriangle /> Error</h2>
            <button className="close-button" onClick={onClose}>
              <FaTimes />
            </button>
          </div>
          <div className="drug-info-error">
            <p>{error}</p>
            <button onClick={onClose}>Close</button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Return null if there's no drug to display
  if (!drugDetails) {
    return null;
  }

  return (
    <div className="drug-info-modal-backdrop" onClick={handleBackdropClick}>
      <motion.div 
        className="drug-info-modal"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="drug-info-header">
          <h2><FaPills /> {drugDetails.name}</h2>
          <button className="close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        <div className="drug-info-tabs">
          <button 
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <FaInfoCircle /> Overview
          </button>
          <button 
            className={`tab-button ${activeTab === 'sideEffects' ? 'active' : ''}`}
            onClick={() => setActiveTab('sideEffects')}
          >
            <FaRegLightbulb /> Side Effects
          </button>
          <button 
            className={`tab-button ${activeTab === 'warnings' ? 'active' : ''}`}
            onClick={() => setActiveTab('warnings')}
          >
            <FaExclamationTriangle /> Warnings
          </button>
          <button 
            className={`tab-button ${activeTab === 'usage' ? 'active' : ''}`}
            onClick={() => setActiveTab('usage')}
          >
            <FaFileMedical /> Usage
          </button>
        </div>
        
        <div className="drug-info-content">
          {activeTab === 'overview' && (
            <div className="tab-content">
              <div className="info-section">
                <h3><FaInfoCircle /> Basic Information</h3>
                <div className="info-item">
                  <strong>Generic Name:</strong> {drugDetails.genericName}
                </div>
                {drugDetails.brandNames && drugDetails.brandNames.length > 0 && (
                  <div className="info-item">
                    <strong>Brand Names:</strong> {drugDetails.brandNames.join(', ')}
                  </div>
                )}
                {drugDetails.drugClass && (
                  <div className="info-item">
                    <strong>Drug Class:</strong> {drugDetails.drugClass}
                  </div>
                )}
              </div>
              
              {drugDetails.mechanismOfAction && (
                <div className="info-section">
                  <h3><FaFlask /> Mechanism of Action</h3>
                  <p>{drugDetails.mechanismOfAction}</p>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'sideEffects' && (
            <div className="tab-content">
              <div className="info-section">
                <h3><FaRegLightbulb /> Side Effects</h3>
                {drugDetails.sideEffects && drugDetails.sideEffects.length > 0 ? (
                  <ul className="effects-list">
                    {drugDetails.sideEffects.map((effect, index) => (
                      <li key={index}>{effect}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No side effect information available.</p>
                )}
              </div>
              
              {drugDetails.monitoring && drugDetails.monitoring.length > 0 && (
                <div className="info-section">
                  <h3><FaShieldAlt /> Monitoring</h3>
                  <ul className="monitoring-list">
                    {drugDetails.monitoring.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'warnings' && (
            <div className="tab-content">
              <div className="info-section">
                <h3><FaExclamationTriangle /> Warnings</h3>
                {drugDetails.warnings && drugDetails.warnings.length > 0 ? (
                  <ul className="warnings-list">
                    {drugDetails.warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No warnings information available.</p>
                )}
              </div>
              
              {drugDetails.contraindications && drugDetails.contraindications.length > 0 && (
                <div className="info-section">
                  <h3><FaExclamationTriangle /> Contraindications</h3>
                  <ul className="contraindications-list">
                    {drugDetails.contraindications.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'usage' && (
            <div className="tab-content">
              <div className="info-section">
                <h3><FaFileMedical /> Usage Information</h3>
                {drugDetails.usageInstructions ? (
                  <p>{drugDetails.usageInstructions}</p>
                ) : (
                  <p>No dosage information available.</p>
                )}
              </div>
              
              {drugDetails.commonUsages && drugDetails.commonUsages.length > 0 && (
                <div className="info-section">
                  <h3><FaListAlt /> Common Uses</h3>
                  <ul className="uses-list">
                    {drugDetails.commonUsages.map((use, index) => (
                      <li key={index}>{use}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="drug-info-footer">
          <p className="disclaimer">The information provided is for educational purposes only and should not replace professional medical advice.</p>
        </div>
      </motion.div>
    </div>
  );
};

export default DrugInfoModal; 