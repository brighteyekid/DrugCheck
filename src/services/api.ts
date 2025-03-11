import { Drug, InteractionResult, DrugDetails, DetailedInteraction, MedicationReportData } from "../types/types";
import { analyzeInteractions, generateAIAnalysis } from './aiService';

const RXNORM_API_BASE = 'https://rxnav.nlm.nih.gov/REST';

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
          const aiResult = await analyzeInteractions(pair);
          
          if (aiResult && aiResult.length > 0) {
            const detailedInteraction: DetailedInteraction = {
              severity: mapSeverity(aiResult[0].interaction.severity),
              description: `Interaction between ${pair[0].name} and ${pair[1].name}: ${aiResult[0].interaction.description}`,
              documentation: 'AI Generated',
              onset: 'Unknown',
              clinicalEffects: [],
              riskFactors: [],
              patientMonitoring: [],
              managementSteps: [aiResult[0].interaction.recommendation],
              mechanismDetail: aiResult[0].interaction.mechanism || '',
              onsetTime: '',
              duration: '',
              aiGenerated: true
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
          documentation: 'RxNav',
          onset: 'Unknown',
          clinicalEffects: [interaction.effect || ''],
          riskFactors: [],
          patientMonitoring: [],
          managementSteps: [],
          mechanismDetail: interaction.interactionMechanism || '',
          onsetTime: '',
          duration: '',
          aiGenerated: false
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

// Generate summary statistics
function generateSummary(drugs: DrugDetails[], interactions: DetailedInteraction[]) {
  const severityCount = {
    contraindicated: 0,
    severe: 0,
    moderate: 0,
    minor: 0,
    unknown: 0
  };

  interactions.forEach(interaction => {
    const severity = interaction.severity.toLowerCase();
    if (severity in severityCount) {
      severityCount[severity as keyof typeof severityCount]++;
    } else {
      severityCount.unknown++;
    }
  });

  const requiresImmediateAttention = interactions.some(
    i => i.severity === 'Contraindicated' || i.severity === 'Severe'
  );

  return {
    totalMedications: drugs.length,
    totalInteractions: interactions.length,
    severityBreakdown: severityCount,
    requiresImmediateAttention,
    keyFindings: generateKeyFindings(drugs, interactions),
    recommendations: generateRecommendations(interactions)
  };
}

// Helper function to generate key findings
function generateKeyFindings(drugs: DrugDetails[], interactions: DetailedInteraction[]): string[] {
  if (!interactions || interactions.length === 0) {
    return ['No significant interactions detected between the selected medications.'];
  }
  
  const findings = [];
  
  // Count severe interactions
  const severeCount = interactions.filter(i => 
    i.severity.toLowerCase().includes('contraindicated') || 
    i.severity.toLowerCase().includes('severe')
  ).length;
  
  if (severeCount > 0) {
    findings.push(`${severeCount} severe interaction${severeCount > 1 ? 's' : ''} detected that require immediate attention.`);
  }
  
  // Add drug-specific findings
  drugs.forEach(drug => {
    const drugInteractions = interactions.filter(i => 
      i.description.toLowerCase().includes(drug.name.toLowerCase())
    );
    
    if (drugInteractions.length > 0) {
      findings.push(`${drug.name} is involved in ${drugInteractions.length} interaction${drugInteractions.length > 1 ? 's' : ''}.`);
    }
  });
  
  return findings;
}

// Helper function to generate recommendations
function generateRecommendations(interactions: DetailedInteraction[]): string[] {
  if (!interactions || interactions.length === 0) {
    return ['No specific recommendations at this time.'];
  }
  
  // Create recommendations based on severity
  const severeInteractions = interactions.filter(i => 
    i.severity.toLowerCase().includes('contraindicated') || 
    i.severity.toLowerCase().includes('severe')
  );
  
  const recommendations = [];
  
  if (severeInteractions.length > 0) {
    recommendations.push('Consult with your healthcare provider immediately about these medication interactions.');
  }
  
  // Add general recommendations
  recommendations.push('Review all medication timing to minimize interaction risks.');
  recommendations.push('Report any unusual symptoms to your healthcare provider promptly.');
  
  // Add specific recommendations from interactions
  const specificRecs = interactions
    .filter(i => i.managementSteps && i.managementSteps.length > 0)
    .flatMap(i => i.managementSteps || []);
  
  return [...recommendations, ...specificRecs];
}

// Update the generateDetailedReport function to handle errors better
export const generateDetailedReport = async (drugs: Drug[]): Promise<MedicationReportData> => {
  try {
    // Convert drugs to DrugDetails
    const detailedDrugs = drugs.map(drug => {
      return {
        ...drug,
        // Preserve existing dosage and frequency if they exist
        dosage: drug.dosage || 'Not specified',
        frequency: drug.frequency || 'Not specified',
        // Add other details as needed
        drugClass: drug.category || 'Unknown',
        commonUsages: drug.description ? [drug.description] : [],
        mechanismOfAction: '',
        contraindications: drug.warnings || []
      } as DrugDetails;
    });

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
    let aiAnalysis;
    try {
      aiAnalysis = await generateAIAnalysis(detailedDrugs, interactions);
    } catch (error) {
      console.error('Error generating AI analysis:', error);
      // Provide fallback AI analysis
      aiAnalysis = {
        overallRiskLevel: 'Unknown',
        keyConsiderations: ['Unable to generate detailed analysis. Please consult with your healthcare provider.'],
        suggestedMonitoring: ['Regular check-ups with your healthcare provider'],
        timingRecommendations: ['Take medications as prescribed'],
        lifestyleRecommendations: ['Follow your healthcare provider\'s recommendations']
      };
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
      aiAnalysis: {
        overallRiskLevel: 'Unknown',
        keyConsiderations: ['Unable to generate detailed analysis. Please consult with your healthcare provider.'],
        suggestedMonitoring: ['Regular check-ups with your healthcare provider'],
        timingRecommendations: ['Take medications as prescribed'],
        lifestyleRecommendations: ['Follow your healthcare provider\'s recommendations']
      }
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

function checkRxNavInteractions(rxcuis: string[]): Promise<InteractionResult[]> {
  // Implementation of checkRxNavInteractions function
  // This is a placeholder and should be implemented based on the actual RxNav API
  return Promise.resolve([]);
}

