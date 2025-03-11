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
  severity: 'High' | 'Moderate' | 'Low' | 'Unknown';
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
  onset?: 'Rapid' | 'Delayed' | 'Unknown';
  severity: 'Contraindicated' | 'Severe' | 'Moderate' | 'Minor' | 'Unknown';
  documentation?: 'Excellent' | 'Good' | 'Fair' | 'Limited' | 'Unknown';
  clinicalEffects?: string[];
  riskFactors?: string[];
  patientMonitoring?: string[];
  managementSteps?: string[];
  mechanismDetail?: string;
  onsetTime?: string;
  duration?: string;
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