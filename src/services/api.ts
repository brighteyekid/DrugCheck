import { Drug, InteractionResult, DetailedInteraction, MedicationReportData } from "../types/types";
import { analyzeInteractions, generateAIAnalysis } from './aiService';

const RXNORM_API_BASE = 'https://rxnav.nlm.nih.gov/REST';

// Define DrugDetails interface here if needed
export interface DrugDetails {
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
  properties?: any;
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

// Combined comprehensive drug details function
export const getDrugDetails = async (rxcui: string): Promise<DrugDetails> => {
  try {
    // Get all necessary data in parallel
    const responses = await Promise.all([
      fetch(`${RXNORM_API_BASE}/rxcui/${rxcui}/properties.json`),
      fetch(`${RXNORM_API_BASE}/rxcui/${rxcui}/allProperties.json?prop=all`),
      fetch(`${RXNORM_API_BASE}/rxcui/${rxcui}/related.json?tty=IN+PIN`),
      fetch(`${RXNORM_API_BASE}/rxcui/${rxcui}/related.json?tty=BN`)
    ]);
    
    const [propertiesResponse, allPropertiesResponse, ingredientsResponse, brandsResponse] = responses;
    
    if (!propertiesResponse.ok || !allPropertiesResponse.ok) {
      throw new Error(`Failed to get details for rxcui ${rxcui}`);
    }
    
    const [properties, allProperties, ingredients, brands] = await Promise.all([
      propertiesResponse.json(),
      allPropertiesResponse.json(),
      ingredientsResponse.json(),
      brandsResponse.json()
    ]);

    const propConcepts = allProperties?.propConceptGroup?.propConcept || [];
    
    return {
      id: rxcui,
      name: properties?.properties?.name || `Drug ${rxcui}`,
      genericName: propConcepts.find(
        (p: any) => p.propName === 'RxNorm Name'
      )?.propValue || properties?.properties?.name || `Drug ${rxcui}`,
      brandNames: brands?.relatedGroup?.conceptGroup?.[0]?.conceptProperties?.map((b: any) => b.name) || [],
      category: 'Medication',
      drugClass: propConcepts.find((p: any) => p.propName === 'DRUG_CLASS')?.propValue,
      mechanismOfAction: propConcepts.find((p: any) => p.propName === 'MECHANISM_OF_ACTION')?.propValue,
      usageInstructions: propConcepts.find((p: any) => p.propName === 'DOSAGE')?.propValue,
      commonUsages: propConcepts.filter((p: any) => p.propName === 'INDICATION').map((p: any) => p.propValue) || [],
      contraindications: propConcepts.filter((p: any) => p.propName === 'CONTRAINDICATION').map((p: any) => p.propValue) || [],
      warnings: propConcepts.filter((p: any) => p.propName === 'WARNING').map((p: any) => p.propValue) || [],
      sideEffects: propConcepts.filter((p: any) => p.propName === 'ADVERSE_REACTION').map((p: any) => p.propValue) || [],
      monitoring: propConcepts.filter((p: any) => p.propName === 'MONITORING').map((p: any) => p.propValue) || [],
      properties: propConcepts
    };
  } catch (error) {
    console.error(`Error fetching drug details for ${rxcui}:`, error);
    throw error;
  }
};

// Main interaction checking function
export const checkInteractions = async (rxcuis: string[]): Promise<DetailedInteraction[]> => {
  if (rxcuis.length < 2) {
    console.log('Need at least 2 drugs for interaction check');
    return [];
  }

  try {
    // Try the interaction/list endpoint
    const response = await fetch(
      `${RXNORM_API_BASE}/interaction/list.json?rxcuis=${rxcuis.join('+')}`
    );

    if (!response.ok) {
      console.log('No RxNav interaction found, using AI analysis...');
      
      // Get drug details for AI analysis
      const drugDetails = await Promise.all(
        rxcuis.map(rxcui => getDrugDetails(rxcui).catch(() => ({
          id: rxcui,
          name: `Drug ${rxcui}`,
          genericName: `Drug ${rxcui}`,
          category: 'Unknown'
        } as DrugDetails)))
      );
      
      // Generate all possible pairs of medications
      const allPairs: [DrugDetails, DrugDetails][] = [];
      for (let i = 0; i < drugDetails.length; i++) {
        for (let j = i + 1; j < drugDetails.length; j++) {
          allPairs.push([drugDetails[i], drugDetails[j]]);
        }
      }
      
      // Analyze each pair with AI
      const allInteractions: DetailedInteraction[] = [];
      
      // Process pairs sequentially to avoid rate limiting
      for (const pair of allPairs) {
        try {
          const aiResult = await analyzeInteractions([
            {
              id: pair[0].id || pair[0].name,
              name: pair[0].name,
              genericName: pair[0].genericName,
              dosage: pair[0].dosage,
              frequency: pair[0].frequency
            } as Drug,
            {
              id: pair[1].id || pair[1].name,
              name: pair[1].name,
              genericName: pair[1].genericName,
              dosage: pair[1].dosage,
              frequency: pair[1].frequency
            } as Drug
          ]);
          
          if (aiResult && aiResult.length > 0) {
            const detailedInteraction: DetailedInteraction = {
              severity: mapSeverity(aiResult[0].interaction.severity),
              description: aiResult[0].interaction.description,
              documentation: 'Unknown',
              onset: '',
              clinicalEffects: [],
              riskFactors: [],
              managementSteps: [],
              mechanism: aiResult[0].interaction.mechanism || '',
              aiGenerated: true,
              timingRecommendations: ['Take as directed by your healthcare provider'],
              recommendation: aiResult[0].interaction.recommendation || 'Consult your healthcare provider'
            };
            
            allInteractions.push(detailedInteraction);
          }
        } catch (error) {
          console.error(`Error analyzing interaction between ${pair[0].name} and ${pair[1].name}:`, error);
        }
      }
      
      return allInteractions;
    }

    const data = await response.json();
    return parseInteractionResponse(data) || [];
  } catch (error) {
    console.error('Error checking interactions:', error);
    return [];
  }
};

// Helper function to parse interaction response
function parseInteractionResponse(data: any): DetailedInteraction[] {
  const interactions: DetailedInteraction[] = [];
  
  if (data?.fullInteractionTypeGroup) {
    data.fullInteractionTypeGroup.forEach((group: any) => {
      group.fullInteractionType?.forEach((interaction: any) => {
        interactions.push({
          severity: mapSeverity(interaction.severity),
          description: interaction.comment || 'No description available',
          documentation: 'Unknown',
          onset: '',
          clinicalEffects: [interaction.effect || ''],
          riskFactors: [],
          managementSteps: [],
          mechanism: interaction.interactionMechanism || '',
          aiGenerated: false,
          timingRecommendations: ['Take as directed by your healthcare provider'],
          recommendation: interaction.comment || 'Consult your healthcare provider'
        });
      });
    });
  }
  
  return interactions;
}

// Helper function to map severity strings to the required format
function mapSeverity(severity: string): 'Contraindicated' | 'Severe' | 'Moderate' | 'Minor' | 'Unknown' {
  const lowerSeverity = severity.toLowerCase();
  if (lowerSeverity.includes('contraindicated')) return 'Contraindicated';
  if (lowerSeverity.includes('severe') || lowerSeverity.includes('high')) return 'Severe';
  if (lowerSeverity.includes('moderate')) return 'Moderate';
  if (lowerSeverity.includes('minor') || lowerSeverity.includes('low')) return 'Minor';
  return 'Unknown';
}

// Helper function to generate key findings based on medications and interactions
function generateKeyFindings(drugs: DrugDetails[], interactions: DetailedInteraction[]): string[] {
  const findings: string[] = [];
  
  // Add findings for severe interactions
  const severeInteractions = interactions.filter(i => 
    i.severity === 'Contraindicated' || 
    i.severity === 'Severe'
  );
  
  if (severeInteractions.length > 0) {
    findings.push(`Found ${severeInteractions.length} severe or contraindicated interactions that require immediate attention.`);
    
    // Add specific severe interactions
    severeInteractions.forEach(interaction => {
      findings.push(interaction.description);
    });
  }
  
  // Add findings for medications with narrow therapeutic index if any
  const narrowTherapeuticDrugs = drugs.filter(d => 
    d.name.toLowerCase().includes('warfarin') || 
    d.name.toLowerCase().includes('digoxin') || 
    d.name.toLowerCase().includes('phenytoin') ||
    d.name.toLowerCase().includes('lithium') ||
    d.name.toLowerCase().includes('theophylline')
  );
  
  if (narrowTherapeuticDrugs.length > 0) {
    findings.push(`Your regimen includes ${narrowTherapeuticDrugs.length} medications with a narrow therapeutic index that require careful monitoring.`);
  }
  
  // If no specific findings, add a general note
  if (findings.length === 0) {
    if (interactions.length > 0) {
      findings.push(`Found ${interactions.length} potential interactions of varying severity.`);
    } else {
      findings.push('No significant interactions detected between your medications.');
    }
  }
  
  return findings;
}

// Helper function to generate recommendations based on interactions
function generateRecommendations(interactions: DetailedInteraction[]): string[] {
  const recommendations: string[] = [];
  
  // Add recommendations for severe interactions
  const severeInteractions = interactions.filter(i => 
    i.severity === 'Contraindicated' || 
    i.severity === 'Severe'
  );
  
  if (severeInteractions.length > 0) {
    recommendations.push('Consult with your healthcare provider immediately about the severe interactions detected.');
  }
  
  // Add recommendations for moderate interactions
  const moderateInteractions = interactions.filter(i => i.severity === 'Moderate');
  if (moderateInteractions.length > 0) {
    recommendations.push('Monitor for side effects from moderate interactions and discuss with your healthcare provider.');
  }
  
  // Collect unique recommendations from all interactions
  const uniqueRecommendations = new Set<string>();
  interactions.forEach(interaction => {
    if (interaction.recommendation) {
      uniqueRecommendations.add(interaction.recommendation);
    }
  });
  
  // Add unique recommendations
  uniqueRecommendations.forEach(rec => {
    recommendations.push(rec);
  });
  
  // If no specific recommendations, add general advice
  if (recommendations.length === 0) {
    recommendations.push('Take all medications as prescribed by your healthcare provider.');
    recommendations.push('Report any unusual symptoms or side effects to your healthcare provider.');
  }
  
  return recommendations;
}

// Update the generateDetailedReport function to handle errors better
export const generateDetailedReport = async (drugs: Drug[]): Promise<MedicationReportData> => {
  try {
    // Convert drugs to DrugDetails
    const detailedDrugs = await Promise.all(
      drugs.map(async (drug) => {
        // Ensure each drug has an id
        return {
          id: drug.id || drug.name,
          name: drug.name,
          genericName: drug.genericName,
          dosage: drug.dosage,
          frequency: drug.frequency,
          // ... other properties
        } as import('../types/types').DrugDetails;
      })
    );

    // Get interactions between all drugs
    const rxcuis = drugs.map(d => d.id);
    let interactions: DetailedInteraction[] = [];
    
    try {
      interactions = await checkInteractions(rxcuis);
    } catch (error) {
      console.error('Error getting interactions:', error);
      // Provide a fallback empty array if interactions fail
      interactions = [];
    }

    // Generate AI analysis with error handling
    let aiAnalysis = {
      overallRiskLevel: 'Unknown',
      keyConsiderations: [] as string[],
      suggestedMonitoring: [] as string[],
      timingRecommendations: [] as string[],
      lifestyleRecommendations: [] as string[]
    };
    try {
      const generatedAnalysis = await generateAIAnalysis(detailedDrugs, interactions);
      aiAnalysis = {
        overallRiskLevel: generatedAnalysis.overallRiskLevel,
        keyConsiderations: generatedAnalysis.keyConsiderations,
        suggestedMonitoring: generatedAnalysis.suggestedMonitoring,
        timingRecommendations: ['Take medications as prescribed'],
        lifestyleRecommendations: generatedAnalysis.lifestyleRecommendations
      };
    } catch (error) {
      console.error('Error generating AI analysis:', error);
      // Provide fallback AI analysis
      aiAnalysis = defaultAIAnalysis();
    }

    // Count interactions by severity
    const severityCounts = {
      contraindicated: 0,
      severe: 0,
      moderate: 0,
      minor: 0,
      unknown: 0
    };

    interactions.forEach(interaction => {
      const severity = interaction.severity.toLowerCase();
      if (severity.includes('contraindicated')) severityCounts.contraindicated++;
      else if (severity.includes('severe') || severity.includes('high')) severityCounts.severe++;
      else if (severity.includes('moderate')) severityCounts.moderate++;
      else if (severity.includes('minor') || severity.includes('low')) severityCounts.minor++;
      else severityCounts.unknown++;
    });

    // Generate report with safe function calls
    return {
      timestamp: Date.now(),
      medications: detailedDrugs,
      interactions,
      summary: {
        totalMedications: detailedDrugs.length,
        totalInteractions: interactions.length,
        severityBreakdown: severityCounts,
        requiresImmediateAttention: severityCounts.contraindicated > 0 || severityCounts.severe > 0,
        keyFindings: generateKeyFindings(detailedDrugs, interactions),
        recommendations: generateRecommendations(interactions)
      },
      aiAnalysis
    };
  } catch (error) {
    console.error('Error generating detailed report:', error);
    // Return a minimal valid report in case of errors
    return {
      timestamp: Date.now(),
      medications: drugs.map(drug => ({
        ...drug,
        dosage: drug.dosage || 'Not specified',
        frequency: drug.frequency || 'Not specified',
        drugClass: 'Unknown'
      } as DrugDetails)),
      interactions: [],
      summary: {
        totalMedications: drugs.length,
        totalInteractions: 0,
        severityBreakdown: {
          contraindicated: 0,
          severe: 0,
          moderate: 0,
          minor: 0,
          unknown: 0
        },
        requiresImmediateAttention: false,
        keyFindings: ['Unable to analyze interactions. Please consult with your healthcare provider.'],
        recommendations: ['Consult with your healthcare provider about potential interactions.']
      },
      aiAnalysis: defaultAIAnalysis()
    };
  }
};

export const searchDrugs = async (query: string): Promise<Drug[]> => {
  if (!query.trim()) return [];
  
  try {
    // First, get the RxNorm concepts (rxcui) for the drug name
    const searchResponse = await fetch(
      `${RXNORM_API_BASE}/rxcui.json?name=${encodeURIComponent(query)}`
    );
    const searchData = await searchResponse.json();
    
    if (!searchData.idGroup?.rxnormId?.length) {
      // If no exact match, try approximate match
      const approxResponse = await fetch(
        `${RXNORM_API_BASE}/approximateTerm.json?term=${encodeURIComponent(query)}&maxEntries=20`
      );
      const approxData = await approxResponse.json();
      const candidates = approxData.approximateGroup?.candidate || [];

      // Get detailed info for each candidate
      const detailedDrugs = await Promise.all(
        candidates.map(async (candidate: any) => {
          const detailResponse = await fetch(
            `${RXNORM_API_BASE}/rxcui/${candidate.rxcui}/allProperties.json?prop=all`
          );
          const detailData = await detailResponse.json();
          const properties = detailData.propConceptGroup?.propConcept || [];
          
          // Find the name and synonym properties
          const nameProp = properties.find((p: any) => p.propName === 'RxNorm Name');
          const synonymProp = properties.find((p: any) => p.propName === 'DISPLAY_NAME');
          
          return {
            id: candidate.rxcui,
            name: nameProp?.propValue || candidate.name,
            genericName: synonymProp?.propValue || candidate.name,
            score: candidate.score,
            rawData: properties // Include raw data for debugging
          };
        })
      );

      // Sort by score and remove duplicates
      return Array.from(
        new Map(
          detailedDrugs
            .sort((a, b) => b.score - a.score)
            .map(drug => [drug.id, drug])
        ).values()
      );
    }

    // Get detailed info for exact matches
    const rxcui = searchData.idGroup.rxnormId[0];
    const detailResponse = await fetch(
      `${RXNORM_API_BASE}/rxcui/${rxcui}/allProperties.json?prop=all`
    );
    const detailData = await detailResponse.json();
    const properties = detailData.propConceptGroup?.propConcept || [];

    return [{
      id: rxcui,
      name: properties.find((p: any) => p.propName === 'RxNorm Name')?.propValue || query,
      genericName: properties.find((p: any) => p.propName === 'DISPLAY_NAME')?.propValue || query,
      rawData: properties // Include raw data for debugging
    }];

  } catch (error) {
    console.error('Error fetching drugs:', error);
    return [];
  }
};

// Ensure the function returns an object with timingRecommendations
function defaultAIAnalysis() {
  return {
    overallRiskLevel: 'Unknown',
    keyConsiderations: ['Please consult with your healthcare provider for a detailed analysis'],
    suggestedMonitoring: ['Regular check-ups with your healthcare provider'],
    timingRecommendations: ['Take medications as prescribed'],
    lifestyleRecommendations: ['Follow prescribed medication schedule', 'Report any unusual symptoms']
  };
}

