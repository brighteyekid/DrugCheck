import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Drug, InteractionResult } from '../types/types';
import { saveSearchHistory } from '../services/storage';

interface DrugContextType {
  recentSearches: Drug[];
  addToRecentSearches: (drug: Drug) => void;
  clearRecentSearches: () => void;
  savedInteractions: InteractionResult[];
  saveInteraction: (interaction: InteractionResult) => void;
}

const DrugContext = createContext<DrugContextType | undefined>(undefined);

export const DrugProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [recentSearches, setRecentSearches] = useState<Drug[]>([]);
  const [savedInteractions, setSavedInteractions] = useState<InteractionResult[]>([]);

  const addToRecentSearches = (drug: Drug) => {
    setRecentSearches(prev => {
      const newSearches = [drug, ...prev.filter(d => d.id !== drug.id)].slice(0, 10);
      return newSearches;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
  };

  const saveInteraction = (interaction: InteractionResult) => {
    setSavedInteractions(prev => {
      const newInteractions = [interaction, ...prev];
      saveSearchHistory(recentSearches, newInteractions);
      return newInteractions;
    });
  };

  return (
    <DrugContext.Provider value={{
      recentSearches,
      addToRecentSearches,
      clearRecentSearches,
      savedInteractions,
      saveInteraction
    }}>
      {children}
    </DrugContext.Provider>
  );
};

export const useDrugContext = () => {
  const context = useContext(DrugContext);
  if (context === undefined) {
    throw new Error('useDrugContext must be used within a DrugProvider');
  }
  return context;
}; 