import { Drug, InteractionResult, DrugDetails, DetailedInteraction } from '../types/types';

// Get environment variables
const MISTRAL_API_KEY = import.meta.env.VITE_MISTRAL_API_KEY;
const MEDICAL_MODEL = 'mistral-medium'; // Using a more reliable model

// Validate environment variables
if (!MISTRAL_API_KEY) {
  console.error('Missing Mistral API key! Please set VITE_MISTRAL_API_KEY in your environment variables.');
}

const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';

// Update the Interaction type
interface Interaction {
  severity: 'High' | 'Moderate' | 'Low' | 'Unknown' | 'Contraindicated' | 'Severe' | 'Minor';
  description: string;
  recommendation: string;
  confidence?: number;
  aiGenerated?: boolean;
}

export const analyzeInteractions = async (drugs: Drug[] | [Drug, Drug]): Promise<InteractionResult[]> => {
  if (!MISTRAL_API_KEY || !Array.isArray(drugs) || drugs.length < 2) return [];

  try {
    // Ensure we're working with exactly two drugs
    const drug1 = drugs[0];
    const drug2 = drugs[1];
    
    console.log('Analyzing with Mistral AI:', drug1.name, drug2.name);
    
    const response = await fetch(MISTRAL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MISTRAL_API_KEY}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        model: MEDICAL_MODEL,
        messages: [
          {
            role: "system",
            content: "You are a medical expert analyzing drug interactions. Provide severity levels (High/Moderate/Low) and brief recommendations."
          },
          {
            role: "user",
            content: `Analyze potential drug interactions between ${drug1.name} (${drug1.dosage || 'unknown dosage'} ${drug1.frequency || 'unknown frequency'}) and ${drug2.name} (${drug2.dosage || 'unknown dosage'} ${drug2.frequency || 'unknown frequency'}). 
              Format your response exactly as:
              Severity: [level]
              Description: [brief analysis]
              Recommendation: [medical advice]`
          }
        ],
        temperature: 0.1, // Lower temperature for more consistent results
        max_tokens: 300,
        top_p: 0.95
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Mistral API Error:', errorData);
      throw new Error(`Mistral API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    console.log('Mistral API Response:', data);

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('No response from AI model');
    }

    const analysis = parseAIResponse(data.choices[0].message.content);
    
    // Use the parsed analysis instead of hardcoded values
    return [{
      drugPair: [drug1, drug2],
      interaction: {
        aiGenerated: true,
        severity: analysis.severity as 'High' | 'Moderate' | 'Low' | 'Unknown' | 'Contraindicated' | 'Severe' | 'Minor',
        description: analysis.description,
        recommendation: analysis.recommendation,
        confidence: analysis.confidence
      }
    }];
  } catch (error) {
    console.error('AI analysis error:', error);
    return [{
      drugPair: [drugs[0], drugs[1]],
      interaction: {
        severity: 'Unknown',
        description: 'Unable to analyze this interaction.',
        recommendation: 'Consult with your healthcare provider.',
        aiGenerated: true
      }
    }];
  }
};

function parseAIResponse(response: string) {
  const lines = response.split('\n');
  let severity = 'Unknown';
  let description = '';
  let recommendation = '';

  for (const line of lines) {
    if (line.toLowerCase().includes('severity:')) {
      const severityText = line.split(':')[1]?.trim().toLowerCase() || '';
      if (severityText.includes('high')) severity = 'High';
      else if (severityText.includes('moderate')) severity = 'Moderate';
      else if (severityText.includes('low')) severity = 'Low';
    }
    else if (line.toLowerCase().includes('description:')) {
      description = line.split(':')[1]?.trim() || 'Potential interaction detected.';
    }
    else if (line.toLowerCase().includes('recommendation:')) {
      recommendation = line.split(':')[1]?.trim() || 'Consult with your healthcare provider.';
    }
  }

  return {
    severity,
    description,
    recommendation,
    confidence: 0.8
  };
}

export const generateAIAnalysis = async (drugs: DrugDetails[], interactions: DetailedInteraction[]) => {
  if (!MISTRAL_API_KEY) return defaultAIAnalysis();

  try {
    const prompt = generateMedicationPrompt(drugs, interactions);
    const response = await fetch(MISTRAL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        model: MEDICAL_MODEL,
        messages: [
          {
            role: "system",
            content: "You are a clinical pharmacist analyzing medication profiles. Provide detailed analysis including risk levels, monitoring needs, and lifestyle recommendations."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error('AI analysis failed');
    }

    const data = await response.json();
    return parseAIReportResponse(data.choices[0].message.content);
  } catch (error) {
    console.error('Error in AI analysis:', error);
    return defaultAIAnalysis();
  }
};

function generateMedicationPrompt(drugs: DrugDetails[], interactions: DetailedInteraction[]): string {
  return `Analyze the following medication profile:

Medications:
${drugs.map(drug => `- ${drug.name} (${drug.drugClass || 'Unknown class'})
  Dosage: ${drug.dosage || 'Not specified'}
  Frequency: ${drug.frequency || 'Not specified'}
  Usage: ${drug.commonUsages?.join(', ') || 'Unknown'}
  Mechanism: ${drug.mechanismOfAction || 'Unknown'}`).join('\n')}

Interactions:
${interactions.map(i => `- ${i.severity} interaction: ${i.description}`).join('\n')}

Please provide a comprehensive analysis including:
1. Overall risk assessment (High/Moderate/Low)
2. Key considerations for this medication combination
3. Specific monitoring recommendations based on dosing schedule
4. Timing adjustments if needed
5. Lifestyle recommendations

Format your response exactly as:
Risk Level: [level]
Key Considerations:
- [point 1]
- [point 2]
Monitoring:
- [parameter 1]
- [parameter 2]
Timing Recommendations:
- [timing 1]
- [timing 2]
Lifestyle:
- [recommendation 1]
- [recommendation 2]`;
}

function parseAIReportResponse(response: string) {
  const sections = response.split('\n\n');
  const riskLevel = sections[0]?.split(': ')[1] || 'Unknown';
  
  const keyConsiderations = sections.find(s => s.startsWith('Key Considerations:'))
    ?.split('\n')
    .slice(1)
    .map(s => s.replace('- ', '')) || [];

  const monitoring = sections.find(s => s.startsWith('Monitoring:'))
    ?.split('\n')
    .slice(1)
    .map(s => s.replace('- ', '')) || [];

  const timing = sections.find(s => s.startsWith('Timing Recommendations:'))
    ?.split('\n')
    .slice(1)
    .map(s => s.replace('- ', '')) || [];

  const lifestyle = sections.find(s => s.startsWith('Lifestyle:'))
    ?.split('\n')
    .slice(1)
    .map(s => s.replace('- ', '')) || [];

  return {
    overallRiskLevel: riskLevel,
    keyConsiderations,
    suggestedMonitoring: monitoring,
    timingRecommendations: timing,
    lifestyleRecommendations: lifestyle
  };
}

function defaultAIAnalysis() {
  return {
    overallRiskLevel: 'Unknown',
    keyConsiderations: ['Please consult with your healthcare provider for a detailed analysis'],
    suggestedMonitoring: ['Regular check-ups with your healthcare provider'],
    timingRecommendations: ['Take medications as prescribed'],
    lifestyleRecommendations: ['Follow prescribed medication schedule', 'Report any unusual symptoms']
  };
}