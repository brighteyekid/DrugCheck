import { Drug, InteractionResult, SearchHistory } from '../types/types';

const HISTORY_KEY = 'drug_search_history';
const MAX_HISTORY_ITEMS = 10;

export const saveSearchHistory = (drugs: Drug[], interactions: InteractionResult[]) => {
  try {
    const existingHistory: SearchHistory[] = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    
    const newHistory: SearchHistory = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      drugs,
      interactions
    };

    const updatedHistory = [newHistory, ...existingHistory].slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Error saving search history:', error);
  }
};

export const getSearchHistory = (): SearchHistory[] => {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch (error) {
    console.error('Error reading search history:', error);
    return [];
  }
};

export const clearSearchHistory = () => {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error('Error clearing search history:', error);
  }
}; 