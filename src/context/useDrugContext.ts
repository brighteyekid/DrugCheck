import { useContext } from 'react';
import { DrugContext } from './DrugContextType';

export const useDrugContext = () => {
  const context = useContext(DrugContext);
  if (context === undefined) {
    throw new Error('useDrugContext must be used within a DrugProvider');
  }
  return context;
}; 