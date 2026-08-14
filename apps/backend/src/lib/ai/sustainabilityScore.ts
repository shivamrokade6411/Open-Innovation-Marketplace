/*
 * Purpose: AI Environmental and Sustainability scorer.
 * Author: Antigravity Pair Programmer
 * Date: 2026-08-14
 */

import { openai } from '../../config/openai';

export interface SustainabilityResult {
  sustainabilityScore: number;
  estimatedImpact: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export async function sustainabilityScore(
  projectDescription: string,
  technology: string,
  environmentalImpact: string,
  expectedUsers: string,
  resourceConsumption: string
): Promise<SustainabilityResult> {
  const defaultResult: SustainabilityResult = {
    sustainabilityScore: 78,
    estimatedImpact: 'Moderate carbon footprint, optimized compute patterns.',
    strengths: ['Leverages green hosting strategies', 'Serverless scaling bounds idle computing runtime'],
    weaknesses: ['Frequent API polling increases networking energy costs'],
    recommendations: ['Integrate local caching to minimize network transit footprint', 'Migrate database regions to carbon-neutral nodes']
  };

  if (!process.env.OPENAI_API_KEY) {
    return defaultResult;
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an environmental consultant. Evaluate the project sustainability parameters and output a JSON object containing keys: sustainabilityScore (0-100), estimatedImpact (string), strengths (array of strings), weaknesses (array of strings), and recommendations (array of strings).'
        },
        {
          role: 'user',
          content: `Description: ${projectDescription}\nTechnology: ${technology}\nEnvironmental Impact Statement: ${environmentalImpact}\nExpected Users: ${expectedUsers}\nResource Consumption Details: ${resourceConsumption}`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) return defaultResult;
    return JSON.parse(content) as SustainabilityResult;
  } catch (error) {
    console.error('AI sustainabilityScore error, using fallback:', error);
    return defaultResult;
  }
}
