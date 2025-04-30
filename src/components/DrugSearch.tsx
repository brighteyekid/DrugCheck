import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaPills, FaSpinner, FaPlus, FaClock, FaFlask, FaClipboardCheck, FaExchangeAlt } from 'react-icons/fa';
import { searchDrugs, searchByIngredient } from '../services/api';
import { Drug } from '../types/types';
import '../styles/DrugSearch.css';
import { useDrugContext } from '../context/useDrugContext';

interface DrugSearchProps {
  onDrugSelect: (drug: Drug, dosage: string, frequency: string) => void;
  selectedDrugs: Drug[];
}

const DrugSearch: React.FC<DrugSearchProps> = ({ onDrugSelect, selectedDrugs }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Drug[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [searchMode, setSearchMode] = useState<'name' | 'ingredient'>('name');
  const searchTimeout = useRef<NodeJS.Timeout>();
  const { recentSearches } = useDrugContext();

  const toggleSearchMode = () => {
    setSearchMode(prev => prev === 'name' ? 'ingredient' : 'name');
    setQuery('');
    setResults([]);
    setError(null);
  };

  useEffect(() => {
    const fetchDrugs = async () => {
      if (query.length < 2) {
        setResults([]);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        let drugs: Drug[];
        if (searchMode === 'name') {
          drugs = await searchDrugs(query);
        } else {
          drugs = await searchByIngredient(query);
        }

        // Filter out already selected drugs and duplicates
        const filteredDrugs = drugs.filter(
          drug => !selectedDrugs.some(selected => selected.id === drug.id)
        );
        
        setResults(filteredDrugs);
        if (filteredDrugs.length === 0 && query.length >= 2) {
          setError(`No medications found by ${searchMode === 'name' ? 'name' : 'ingredient'}`);
        }
      } catch (error) {
        setError('Error searching medications');
        console.error('Error searching drugs:', error);
      } finally {
        setLoading(false);
      }
    };

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(fetchDrugs, 300);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [query, selectedDrugs, searchMode]);

  // Add recent searches to results when query is empty
  useEffect(() => {
    if (!query.trim() && recentSearches.length > 0) {
      setResults(recentSearches);
      setError(null);
    }
  }, [query, recentSearches]);

  const handleDrugClick = (drug: Drug) => {
    setSelectedDrug(drug);
    setQuery('');
    setResults([]);
  };

  const handleSubmitDosage = () => {
    if (selectedDrug && dosage && frequency) {
      onDrugSelect(selectedDrug, dosage, frequency);
      setSelectedDrug(null);
      setDosage('');
      setFrequency('');
    }
  };

  return (
    <div className="search-container">
      <motion.div 
        className={`search-bar ${focused ? 'focused' : ''}`}
        whileFocus={{ scale: 1.01 }}
      >
        {loading ? (
          <FaSpinner className="search-icon spinning" />
        ) : (
          <FaSearch className="search-icon" />
        )}
        <input
          type="text"
          placeholder={searchMode === 'name' 
            ? "Type medication name (min. 2 characters)..." 
            : "Type active ingredient (min. 2 characters)..."}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setTimeout(() => setFocused(false), 200);
          }}
          className="search-input"
          disabled={!!selectedDrug}
        />
        <button 
          className="toggle-search-mode"
          onClick={toggleSearchMode}
          title={`Switch to ${searchMode === 'name' ? 'ingredient' : 'name'} search`}
        >
          <FaExchangeAlt className={`toggle-icon ${searchMode === 'ingredient' ? 'active' : ''}`} />
        </button>
      </motion.div>

      <AnimatePresence>
        {selectedDrug ? (
          <motion.div 
            className="dosage-form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <h4><FaFlask className="form-icon" /> Add Details for {selectedDrug.name}</h4>
            <div className="dosage-inputs">
              <div className="input-group">
                <label><FaPills /> Dosage Amount</label>
                <input
                  type="text"
                  placeholder="e.g., 10mg, 1 tablet"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  className="dosage-input"
                />
              </div>
              <div className="input-group">
                <label><FaClock /> Frequency</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="frequency-input"
                >
                  <option value="">Select frequency</option>
                  <option value="Once daily">Once daily</option>
                  <option value="Twice daily">Twice daily</option>
                  <option value="Three times daily">Three times daily</option>
                  <option value="Four times daily">Four times daily</option>
                  <option value="As needed">As needed</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                </select>
              </div>
            </div>
            <div className="dosage-actions">
              <button 
                className="cancel-button"
                onClick={() => setSelectedDrug(null)}
              >
                Cancel
              </button>
              <button 
                className="add-button"
                onClick={handleSubmitDosage}
                disabled={!dosage || !frequency}
              >
                <FaClipboardCheck className="button-icon" />
                Add Medication
              </button>
            </div>
          </motion.div>
        ) : (
          (results.length > 0 || error) && focused && (
            <motion.div 
              className="results-container"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {error ? (
                <div className="error-message">{error}</div>
              ) : (
                results.map((drug) => (
                  <motion.div
                    key={`${drug.id}-${drug.name}`}
                    className="result-item"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ 
                      scale: 1.02,
                      backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    }}
                    onClick={() => handleDrugClick(drug)}
                  >
                    <div className="drug-info">
                      <div className="pill-icon-container">
                        <FaPills className="pill-icon" />
                      </div>
                      <div>
                        <div className="drug-name">{drug.name}</div>
                        {drug.genericName !== drug.name && (
                          <div className="generic-name">{drug.genericName}</div>
                        )}
                      </div>
                    </div>
                    <div className="add-icon-container">
                      <FaPlus className="add-icon" />
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )
        )}
      </AnimatePresence>
    </div>
  );
};

export default DrugSearch; 
