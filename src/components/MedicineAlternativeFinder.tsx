import React, { useState } from 'react';
import { useDrugContext } from '../context/useDrugContext';
import '../styles/MedicineAlternativeFinder.css';

interface AlternativeMedication {
  name: string;
  description: string;
  effectiveness?: string;
  costComparison?: string;
  sideEffectProfile?: string;
}

const MedicineAlternativeFinder: React.FC = () => {
  const { medications, interactions, healthData } = useDrugContext();
  const [selectedMedication, setSelectedMedication] = useState<string>('');
  const [alternatives, setAlternatives] = useState<AlternativeMedication[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Legacy backup database in case API fails
  const alternativesDB = {
    "Aspirin": [
      { name: "Ibuprofen", description: "Non-steroidal anti-inflammatory drug (NSAID)" },
      { name: "Acetaminophen", description: "Pain reliever and fever reducer" },
      { name: "Naproxen", description: "NSAID with longer lasting effects" }
    ],
    "Lisinopril": [
      { name: "Losartan", description: "Angiotensin II receptor blocker (ARB)" },
      { name: "Amlodipine", description: "Calcium channel blocker" },
      { name: "Enalapril", description: "Another ACE inhibitor option" }
    ],
    "Atorvastatin": [
      { name: "Rosuvastatin", description: "Another HMG-CoA reductase inhibitor" },
      { name: "Simvastatin", description: "Lower potency statin" },
      { name: "Pravastatin", description: "Lower intensity statin with fewer drug interactions" }
    ],
    "Metformin": [
      { name: "Glipizide", description: "Sulfonylurea that increases insulin production" },
      { name: "Pioglitazone", description: "Thiazolidinedione that increases insulin sensitivity" },
      { name: "Sitagliptin", description: "DPP-4 inhibitor" }
    ],
  };

  const getMistralAIAlternatives = async (medicationName: string): Promise<AlternativeMedication[]> => {
    try {
      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_MISTRAL_API_KEY}`
        },
        body: JSON.stringify({
          model: import.meta.env.VITE_MEDICAL_MODEL || 'mistral-medium',
          messages: [
            {
              role: 'system',
              content: `You are a pharmaceutical expert AI that provides evidence-based alternatives to medications.
                       For each alternative, provide the name, a brief description, effectiveness comparison, 
                       cost comparison, and side effect profile comparison. Return the output as a valid JSON array of 
                       objects with fields: name, description, effectiveness, costComparison, and sideEffectProfile.
                       Base your recommendations on current medical knowledge and consider common alternatives 
                       that doctors might prescribe. Limit to 3-5 alternatives.
                       ${healthData ? `Consider this patient health data: ${JSON.stringify(healthData)}` : ''}`
            },
            {
              role: 'user',
              content: `Please provide alternative medications for ${medicationName} in JSON format.`
            }
          ],
          temperature: 0.2,
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch alternatives from Mistral AI');
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      // Parse the JSON string from the content
      try {
        const parsedData = JSON.parse(content);
        return parsedData.alternatives || [];
      } catch (e) {
        console.error('Error parsing JSON from Mistral AI:', e);
        throw new Error('Invalid response format from AI');
      }
    } catch (error) {
      console.error('Error fetching from Mistral AI:', error);
      // Fallback to local database
      return alternativesDB[medicationName as keyof typeof alternativesDB] || [];
    }
  };

  const findAlternatives = async () => {
    if (!selectedMedication) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Get intelligent alternatives from Mistral AI
      const aiAlternatives = await getMistralAIAlternatives(selectedMedication);
      setAlternatives(aiAlternatives);
    } catch (error) {
      setError('An error occurred while fetching alternatives. Showing local database results instead.');
      // Fallback to local database
      const fallbackResults = alternativesDB[selectedMedication as keyof typeof alternativesDB] || [];
      setAlternatives(fallbackResults);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="alt-finder-container">
      <div className="alt-finder-header">
        <h2>Find Medication Alternatives</h2>
        <span className="ai-badge">Powered by Mistral AI</span>
      </div>
      
      <div className="search-section">
        <select 
          value={selectedMedication}
          onChange={(e) => setSelectedMedication(e.target.value)}
          className="medication-select"
        >
          <option value="">Select a medication</option>
          {medications.map((med, index) => (
            <option key={index} value={med.name}>
              {med.name}
            </option>
          ))}
        </select>
        <button 
          onClick={findAlternatives}
          disabled={!selectedMedication || isLoading}
          className="search-button"
        >
          {isLoading ? 'Searching...' : 'Find Alternatives'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Searching for alternatives with Mistral AI...</p>
        </div>
      ) : alternatives.length > 0 ? (
        <div className="results-container">
          <h3>Alternatives for {selectedMedication}</h3>
          <div className="alternatives-list">
            {alternatives.map((alt, index) => (
              <div key={index} className="alternative-card">
                <h4>{alt.name}</h4>
                <p className="alt-description">{alt.description}</p>
                
                {alt.effectiveness && (
                  <div className="alt-detail">
                    <span className="detail-label">Effectiveness:</span>
                    <span>{alt.effectiveness}</span>
                  </div>
                )}
                
                {alt.costComparison && (
                  <div className="alt-detail">
                    <span className="detail-label">Cost:</span>
                    <span>{alt.costComparison}</span>
                  </div>
                )}
                
                {alt.sideEffectProfile && (
                  <div className="alt-detail">
                    <span className="detail-label">Side Effects:</span>
                    <span>{alt.sideEffectProfile}</span>
                  </div>
                )}
                
                <button className="info-button">More Info</button>
              </div>
            ))}
          </div>
          <div className="disclaimer">
            <p>Always consult with your healthcare provider before making any changes to your medication.</p>
            <p>These recommendations are generated using AI and may not account for your specific medical history.</p>
          </div>
        </div>
      ) : selectedMedication ? (
        <div className="no-results">
          <p>No alternatives found for {selectedMedication}.</p>
        </div>
      ) : (
        <div className="empty-state">
          <p>Select a medication to find potential alternatives.</p>
          <p className="note">This tool uses Mistral AI to provide personalized medication alternatives based on current medical knowledge.</p>
          <p className="note">Note: This tool should be used for informational purposes only and not as medical advice.</p>
        </div>
      )}
    </div>
  );
};

export default MedicineAlternativeFinder; 