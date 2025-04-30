import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaComments, FaPills, FaChartLine, FaTimes } from 'react-icons/fa';
import MentalHealthChatbot from './MentalHealthChatbot';
import MedicineAlternativeFinder from './MedicineAlternativeFinder';
import HealthInsightGenerator from './HealthInsightGenerator';
import { useDrugContext } from '../context/useDrugContext';
import '../styles/Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'chatbot' | 'alternatives' | 'insights'>('chatbot');
  const { healthData, healthInsights } = useDrugContext();

  return (
    <motion.div 
      className={`sidebar-container ${isOpen ? 'open' : ''}`}
      initial={{ x: '100%' }}
      animate={{ x: isOpen ? 0 : '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="sidebar-header">
        <h2>Health Toolkit</h2>
        <button className="close-button" onClick={onClose}>
          <FaTimes />
        </button>
      </div>
      
      <div className="sidebar-tabs">
        <button 
          className={`tab-button ${activeTab === 'chatbot' ? 'active' : ''}`}
          onClick={() => setActiveTab('chatbot')}
        >
          <FaComments /> Mental Health
        </button>
        <button 
          className={`tab-button ${activeTab === 'alternatives' ? 'active' : ''}`}
          onClick={() => setActiveTab('alternatives')}
        >
          <FaPills /> Med Alternatives
        </button>
        <button 
          className={`tab-button ${activeTab === 'insights' ? 'active' : ''}`}
          onClick={() => setActiveTab('insights')}
        >
          <FaChartLine /> Health Insights
        </button>
      </div>
      
      <div className="sidebar-content">
        {activeTab === 'chatbot' && <MentalHealthChatbot />}
        {activeTab === 'alternatives' && <MedicineAlternativeFinder />}
        {activeTab === 'insights' && <HealthInsightGenerator />}
      </div>
    </motion.div>
  );
};

export default Sidebar; 