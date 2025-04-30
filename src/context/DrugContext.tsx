import React, { useState, ReactNode } from 'react';
import { Drug, InteractionResult, UserHealthData, HealthInsight, Message } from '../types/types';
import { saveSearchHistory } from '../services/storage';
import { DrugContext, DrugContextType } from './DrugContextType';

export const DrugProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [recentSearches, setRecentSearches] = useState<Drug[]>([]);
  const [savedInteractions, setSavedInteractions] = useState<InteractionResult[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [healthData, setHealthData] = useState<UserHealthData | null>(null);
  const [healthInsights, setHealthInsights] = useState<HealthInsight | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [medications, setMedications] = useState<Drug[]>([
    { id: '1', name: 'Aspirin', genericName: 'Acetylsalicylic acid' },
    { id: '2', name: 'Lisinopril', genericName: 'Lisinopril' },
    { id: '3', name: 'Atorvastatin', genericName: 'Atorvastatin' },
    { id: '4', name: 'Metformin', genericName: 'Metformin' }
  ]);
  const [interactions, setInteractions] = useState<InteractionResult[]>([]);

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
  
  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };
  
  const closeSidebar = () => {
    setSidebarOpen(false);
  };
  
  const saveHealthData = (data: UserHealthData) => {
    setHealthData(data);
  };
  
  const saveHealthInsights = (insights: HealthInsight) => {
    setHealthInsights(insights);
  };

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    setMessages(prev => [
      ...prev, 
      {
        ...message,
        id: Date.now(),
        timestamp: new Date()
      }
    ]);
  };

  const updateMedications = (newMedications: Drug[]) => {
    setMedications(newMedications);
  };

  const updateInteractions = (newInteractions: InteractionResult[]) => {
    setInteractions(newInteractions);
  };

  return (
    <DrugContext.Provider value={{
      recentSearches,
      addToRecentSearches,
      clearRecentSearches,
      savedInteractions,
      saveInteraction,
      sidebarOpen,
      toggleSidebar,
      closeSidebar,
      healthData,
      healthInsights,
      saveHealthData,
      saveHealthInsights,
      messages,
      addMessage,
      medications,
      interactions,
      updateMedications,
      updateInteractions
    }}>
      {children}
    </DrugContext.Provider>
  );
}; 
