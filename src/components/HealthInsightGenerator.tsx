import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaHeartbeat, FaWeight, FaRulerVertical, FaCalendarAlt, 
  FaAngleRight, FaCheck, FaExclamationTriangle, 
  FaInfoCircle, FaChartLine, FaUser, FaBrain
} from 'react-icons/fa';
import '../styles/HealthInsightGenerator.css';

// Interface definitions
interface UserHealthData {
  gender: 'male' | 'female' | 'other';
  birthdate: string;
  height: number; // in cm
  weight: number; // in kg
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  smoker: boolean;
  exerciseFrequency: 'rarely' | 'sometimes' | 'regularly' | 'daily';
  averageSleep: number;
}

interface HealthInsight {
  overview: {
    age: number;
    bmi: string;
    bmiCategory: string;
    bmiRisk: string;
  };
  healthRisks: string[];
  recommendations: string[];
  timestamp: string;
}

// Mistral AI integration for health insights
const generateHealthInsightsWithMistralAI = async (userData: UserHealthData): Promise<HealthInsight> => {
  try {
    // Calculate basic metrics to help the AI model
    const heightInMeters = userData.height / 100;
    const bmi = userData.weight / (heightInMeters * heightInMeters);
    
    // Calculate age for context
    const today = new Date();
    const birthDate = new Date(userData.birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    // Determine BMI category
    let bmiCategory = '';
    let bmiRisk = '';
    
    if (bmi < 18.5) {
      bmiCategory = 'Underweight';
      bmiRisk = 'Moderate';
    } else if (bmi < 25) {
      bmiCategory = 'Normal weight';
      bmiRisk = 'Low';
    } else if (bmi < 30) {
      bmiCategory = 'Overweight';
      bmiRisk = 'Moderate';
    } else {
      bmiCategory = 'Obese';
      bmiRisk = 'High';
    }
    
    // Make API call to Mistral AI
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
            content: `You are an AI health advisor specializing in providing personalized health insights based on user data.
                     Generate evidence-based health risks and recommendations based on the provided metrics.
                     Focus on actionable advice tailored to the individual's specific health profile.
                     Return the output as JSON with two arrays: 'healthRisks' and 'recommendations'.
                     Keep health risks to 2-5 evidence-based concerns.
                     Provide 3-7 specific, actionable recommendations.
                     Be medically accurate but conversational in tone.`
          },
          {
            role: 'user',
            content: `Please analyze the following health data and provide insights:
                     Gender: ${userData.gender}
                     Age: ${age}
                     Height: ${userData.height} cm
                     Weight: ${userData.weight} kg
                     BMI: ${bmi.toFixed(1)} (${bmiCategory}, Risk: ${bmiRisk})
                     Blood Pressure: ${userData.bloodPressureSystolic}/${userData.bloodPressureDiastolic} mmHg
                     Smoker: ${userData.smoker ? 'Yes' : 'No'}
                     Exercise Frequency: ${userData.exerciseFrequency}
                     Average Sleep: ${userData.averageSleep} hours per night`
          }
        ],
        temperature: 0.4,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to get health insights from Mistral AI');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse the JSON response
    try {
      const parsedData = JSON.parse(content);
      
      return {
        overview: {
          age,
          bmi: bmi.toFixed(1),
          bmiCategory,
          bmiRisk
        },
        healthRisks: parsedData.healthRisks || [],
        recommendations: parsedData.recommendations || [],
        timestamp: new Date().toISOString()
      };
    } catch (e) {
      throw new Error('Invalid response format from Mistral AI');
    }
  } catch (error) {
    console.error('Error with Mistral AI:', error);
    
    // Fallback to basic insights calculation if AI fails
    return generateFallbackHealthInsights(userData);
  }
};

// Fallback function if Mistral AI fails
const generateFallbackHealthInsights = (userData: UserHealthData): HealthInsight => {
  // Calculate BMI
  const heightInMeters = userData.height / 100;
  const bmi = userData.weight / (heightInMeters * heightInMeters);
  
  // Calculate age
  const today = new Date();
  const birthDate = new Date(userData.birthdate);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  let bmiCategory = '';
  let bmiRisk = '';
  
  if (bmi < 18.5) {
    bmiCategory = 'Underweight';
    bmiRisk = 'Moderate';
  } else if (bmi < 25) {
    bmiCategory = 'Normal weight';
    bmiRisk = 'Low';
  } else if (bmi < 30) {
    bmiCategory = 'Overweight';
    bmiRisk = 'Moderate';
  } else {
    bmiCategory = 'Obese';
    bmiRisk = 'High';
  }
  
  // Determine health risks based on provided data
  const healthRisks = [];
  const recommendations = [];
  
  // Age-related insights
  if (age > 40) {
    recommendations.push('Consider regular health screenings as recommended for your age group, including cardiovascular assessments and cancer screenings.');
  }
  
  // BMI-related insights
  if (bmi < 18.5) {
    healthRisks.push('Potential nutritional deficiencies due to underweight status');
    recommendations.push('Consider consulting with a nutritionist to develop a healthy weight gain plan.');
  } else if (bmi >= 25 && bmi < 30) {
    healthRisks.push('Increased risk of heart disease and diabetes due to overweight status');
    recommendations.push('Consider incorporating more physical activity and balanced nutrition to achieve a healthier weight.');
  } else if (bmi >= 30) {
    healthRisks.push('High risk of heart disease, diabetes, and other obesity-related conditions');
    recommendations.push('Consult with a healthcare provider about a comprehensive weight management plan.');
  }
  
  // Blood pressure insights
  if (userData.bloodPressureSystolic > 130 || userData.bloodPressureDiastolic > 80) {
    healthRisks.push('Elevated blood pressure which increases risk of heart disease and stroke');
    recommendations.push('Monitor blood pressure regularly and consider lifestyle modifications such as reducing sodium intake and increasing physical activity.');
  }
  
  // Smoking insights
  if (userData.smoker) {
    healthRisks.push('Increased risk of lung cancer, heart disease, and respiratory issues due to smoking');
    recommendations.push('Consider a smoking cessation program to reduce health risks significantly.');
  }
  
  // Exercise insights
  if (userData.exerciseFrequency === 'rarely') {
    healthRisks.push('Higher risk of chronic disease due to sedentary lifestyle');
    recommendations.push('Begin with light exercise like walking 30 minutes daily and gradually increase activity level.');
  }
  
  // Sleep insights
  if (userData.averageSleep < 7) {
    healthRisks.push('Increased health risks associated with insufficient sleep');
    recommendations.push('Aim for 7-9 hours of quality sleep by establishing a consistent sleep schedule.');
  }
  
  // Generic recommendations everyone can benefit from
  if (recommendations.length < 3) {
    recommendations.push('Stay hydrated by drinking adequate water throughout the day.');
    recommendations.push('Practice stress management techniques such as mindfulness or deep breathing exercises.');
  }
  
  return {
    overview: {
      age,
      bmi: bmi.toFixed(1),
      bmiCategory,
      bmiRisk
    },
    healthRisks,
    recommendations,
    timestamp: new Date().toISOString()
  };
};

const HealthInsightGenerator: React.FC = () => {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserHealthData>({
    gender: 'male',
    birthdate: '',
    height: 170,
    weight: 70,
    bloodPressureSystolic: 120,
    bloodPressureDiastolic: 80,
    smoker: false,
    exerciseFrequency: 'sometimes',
    averageSleep: 7
  });
  const [insights, setInsights] = useState<HealthInsight | null>(null);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setUserData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setUserData(prev => ({ ...prev, [name]: parseFloat(value) }));
    } else {
      setUserData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      generateInsights();
    }
  };
  
  const generateInsights = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      // Generate insights using Mistral AI
      const generatedInsights = await generateHealthInsightsWithMistralAI(userData);
      setInsights(generatedInsights);
      setStep(4);
    } catch (err) {
      setError('An error occurred while generating insights. Using backup analysis method.');
      // Fallback to local generation
      const fallbackInsights = generateFallbackHealthInsights(userData);
      setInsights(fallbackInsights);
      setStep(4);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  const handleReset = () => {
    setStep(1);
    setInsights(null);
    setError(null);
  };
  
  const getDotProgressStatus = (dotStep: number) => {
    if (dotStep < step) return 'completed';
    if (dotStep === step) return 'active';
    return 'inactive';
  };
  
  return (
    <div className="health-insight-generator">
      <div className="header-with-badge">
        <h3 className="insight-title">Health Insights Generator</h3>
        <span className="ai-badge">
          Powered by Mistral AI
        </span>
      </div>
      
      <div className="progress-indicator">
        {[1, 2, 3, 4].map((dotStep) => (
          <div key={dotStep} className={`progress-dot ${getDotProgressStatus(dotStep)}`}>
            {dotStep < step && <FaCheck className="dot-icon" />}
          </div>
        ))}
      </div>
      
      {error && (
        <div className="error-message">
          <FaExclamationTriangle />
          <p>{error}</p>
        </div>
      )}
      
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            className="form-step"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <h4 className="step-title">Basic Information</h4>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Gender</label>
                <select
                  name="gender"
                  value={userData.gender}
                  onChange={handleInputChange}
                  required
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Date of Birth</label>
                <div className="input-with-icon">
                  <FaCalendarAlt className="input-icon" />
                  <input
                    type="date"
                    name="birthdate"
                    value={userData.birthdate}
                    onChange={handleInputChange}
                    max={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Height (cm)</label>
                <div className="input-with-icon">
                  <FaRulerVertical className="input-icon" />
                  <input
                    type="number"
                    name="height"
                    min="50"
                    max="300"
                    value={userData.height}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Weight (kg)</label>
                <div className="input-with-icon">
                  <FaWeight className="input-icon" />
                  <input
                    type="number"
                    name="weight"
                    min="20"
                    max="300"
                    value={userData.weight}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-buttons">
                <button type="submit" className="next-button">
                  Next <FaAngleRight />
                </button>
              </div>
            </form>
          </motion.div>
        )}
        
        {step === 2 && (
          <motion.div
            key="step2"
            className="form-step"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <h4 className="step-title">Health Metrics</h4>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Blood Pressure (Systolic)</label>
                <div className="input-with-icon">
                  <FaHeartbeat className="input-icon" />
                  <input
                    type="number"
                    name="bloodPressureSystolic"
                    min="70"
                    max="250"
                    value={userData.bloodPressureSystolic}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Blood Pressure (Diastolic)</label>
                <div className="input-with-icon">
                  <FaHeartbeat className="input-icon" />
                  <input
                    type="number"
                    name="bloodPressureDiastolic"
                    min="40"
                    max="150"
                    value={userData.bloodPressureDiastolic}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="smoker"
                    checked={userData.smoker}
                    onChange={handleInputChange}
                  />
                  Are you a smoker?
                </label>
              </div>
              
              <div className="form-buttons">
                <button type="button" className="back-button" onClick={handleBack}>
                  Back
                </button>
                <button type="submit" className="next-button">
                  Next <FaAngleRight />
                </button>
              </div>
            </form>
          </motion.div>
        )}
        
        {step === 3 && (
          <motion.div
            key="step3"
            className="form-step"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <h4 className="step-title">Lifestyle Factors</h4>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>How often do you exercise?</label>
                <select
                  name="exerciseFrequency"
                  value={userData.exerciseFrequency}
                  onChange={handleInputChange}
                  required
                >
                  <option value="rarely">Rarely (Less than once a week)</option>
                  <option value="sometimes">Sometimes (1-2 times a week)</option>
                  <option value="regularly">Regularly (3-5 times a week)</option>
                  <option value="daily">Daily (6-7 times a week)</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Average hours of sleep per night</label>
                <input
                  type="number"
                  name="averageSleep"
                  min="1"
                  max="14"
                  step="0.5"
                  value={userData.averageSleep}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-buttons">
                <button type="button" className="back-button" onClick={handleBack}>
                  Back
                </button>
                <button type="submit" className="generate-button">
                  <FaBrain className="button-icon" /> Generate AI Insights
                </button>
              </div>
            </form>
          </motion.div>
        )}
        
        {step === 4 && insights && (
          <motion.div
            key="results"
            className="results-step"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="results-header">
              <FaUser className="user-icon" />
              <div className="results-overview">
                <h4>AI Health Insights</h4>
                <div className="overview-details">
                  <div className="overview-item">
                    <span>Age:</span> {insights.overview.age} years
                  </div>
                  <div className="overview-item">
                    <span>BMI:</span> {insights.overview.bmi} ({insights.overview.bmiCategory})
                  </div>
                  <div className="overview-item">
                    <span>Risk Level:</span> <span className={`risk-${insights.overview.bmiRisk.toLowerCase()}`}>{insights.overview.bmiRisk}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {insights.healthRisks.length > 0 && (
              <div className="insights-section">
                <h5>
                  <FaExclamationTriangle className="section-icon warning" /> Potential Health Risks
                </h5>
                <ul className="insights-list risks-list">
                  {insights.healthRisks.map((risk, index) => (
                    <li key={index}>{risk}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="insights-section">
              <h5>
                <FaInfoCircle className="section-icon info" /> Recommendations
              </h5>
              <ul className="insights-list recommendations-list">
                {insights.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
            
            <div className="insights-disclaimer">
              <FaInfoCircle />
              <p>These insights are for informational purposes only and should not replace professional medical advice. Always consult with a healthcare provider for medical concerns.</p>
              <p className="ai-powered">Analysis powered by Mistral AI</p>
            </div>
            
            <div className="form-buttons">
              <button type="button" className="reset-button" onClick={handleReset}>
                New Assessment
              </button>
            </div>
          </motion.div>
        )}
        
        {isGenerating && (
          <motion.div
            key="generating"
            className="generating-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="loading-animation">
              <FaChartLine className="loading-icon" />
            </div>
            <p>Analyzing your health data with Mistral AI...</p>
            <p className="processing-note">Creating personalized insights based on your profile</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HealthInsightGenerator; 