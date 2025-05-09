export interface Drug {
  id: string;
  name: string;
  genericName: string;
  brandNames?: string[];
  category?: string;
  description?: string;
  warnings?: string[];
  sideEffects?: string[];
  dosageInfo?: string;
  rawData?: any;
  dosage?: string;
  frequency?: string;
}

export interface Interaction {
  severity: 'High' | 'Moderate' | 'Low' | 'Unknown' | 'Contraindicated' | 'Severe' | 'Minor';
  description: string;
  recommendation: string;
  mechanism?: string;
  evidence?: string;
  references?: string[];
  rawData?: any;
  confidence?: number;
  aiGenerated?: boolean;
}

export interface InteractionResult {
  drugPair: [Drug, Drug];
  interaction: Interaction;
}

export interface SearchHistory {
  id: string;
  timestamp: number;
  drugs: Drug[];
  interactions: InteractionResult[];
}

export interface AIAnalysis {
  severity: 'High' | 'Moderate' | 'Low' | 'Unknown';
  description: string;
  mechanism: string;
  recommendation: string;
  confidence: number;
}

export interface DrugDetails extends Drug {
  dosage?: string;
  frequency?: string;
  usageInstructions?: string;
  commonUsages?: string[];
  contraindications?: string[];
  drugClass?: string;
  mechanismOfAction?: string;
  halfLife?: string;
  metabolism?: string;
  excretion?: string;
  foodInteractions?: string[];
  pregnancyCategory?: string;
  breastfeedingSafety?: string;
  monitoring?: string[];
}

export interface DetailedInteraction extends Interaction {
  documentation?: 'Excellent' | 'Good' | 'Fair' | 'Limited' | 'Unknown' | 'AI Generated' | 'RxNav';
  onset?: string;
  clinicalEffects?: string[];
  managementSteps?: string[];
  timingRecommendations: string[];
  riskFactors?: string[];
  mechanismDetail?: string;
}

export interface MedicationReportData {
  timestamp: number;
  medications: DrugDetails[];
  interactions: DetailedInteraction[];
  summary: {
    totalMedications: number;
    totalInteractions: number;
    severityBreakdown: {
      contraindicated: number;
      severe: number;
      moderate: number;
      minor: number;
      unknown: number;
    };
    requiresImmediateAttention: boolean;
    keyFindings: string[];
    recommendations: string[];
  };
  aiAnalysis: {
    overallRiskLevel: string;
    keyConsiderations: string[];
    suggestedMonitoring: string[];
    timingRecommendations: string[];
    lifestyleRecommendations: string[];
  };
}

export interface MedicineAlternative {
  name: string;
  price: number;
  notes: string;
}

export interface MedicineInfo {
  genericName: string;
  category: string;
  price: number;
  purpose: string;
  alternatives: MedicineAlternative[];
}

export interface UserHealthData {
  gender?: 'male' | 'female' | 'other';
  birthdate?: string;
  height?: number; // in cm
  weight?: number; // in kg
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  smoker?: boolean;
  exerciseFrequency?: 'rarely' | 'sometimes' | 'regularly' | 'daily';
  averageSleep?: number;
  // Additional fields for UniversalHealthID
  name?: string;
  age?: string;
  bloodType?: string;
  allergies?: string;
  conditions?: string;
  currentMedications?: string[];
  emergencyContact?: string;
}

export interface HealthInsight {
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

export interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
} 