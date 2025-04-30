import { createContext } from 'react';
import { Drug, InteractionResult, UserHealthData, HealthInsight, Message } from '../types/types';

export interface DrugContextType {
  recentSearches: Drug[];
  addToRecentSearches: (drug: Drug) => void;
  clearRecentSearches: () => void;
  savedInteractions: InteractionResult[];
  saveInteraction: (interaction: InteractionResult) => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  healthData: UserHealthData | null;
  healthInsights: HealthInsight | null;
  saveHealthData: (data: UserHealthData) => void;
  saveHealthInsights: (insights: HealthInsight) => void;
  messages: Message[];
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  medications: Drug[];
  interactions: InteractionResult[];
  updateMedications: (medications: Drug[]) => void;
  updateInteractions: (interactions: InteractionResult[]) => void;
}

export const DrugContext = createContext<DrugContextType | undefined>(undefined); 