/*
 * Purpose: AI Submission scoring assistant.
 * Author: Antigravity Pair Programmer
 * Date: 2026-08-14
 */

import { openai } from '../../config/openai';

export interface ScoringAssistantResult {
  scoreInnovation: number;
  scoreTechnical: number;
  scoreImpact: number;
  scoreFeasibility: number;
  scorePresentation: number;
  comments: string;
}

export async function submissionScoringAssistant(
  title: string,
  description: string,
  githubUrl?: string
): Promise<ScoringAssistantResult> {
  const defaultResult: ScoringAssistantResult = {
    scoreInnovation: 75,
    scoreTechnical: 70,
    scoreImpact: 72,
    scoreFeasibility: 80,
    scorePresentation: 75,
    comments: 'Good project structure and core feature implementation. Feasibility is high, with room for technical polish.'
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
          content: 'You are an expert technical judge. Grade the project submission and return a JSON object with: scoreInnovation (0-100), scoreTechnical (0-100), scoreImpact (0-100), scoreFeasibility (0-100), scorePresentation (0-100), and comments (string summary).'
        },
        {
          role: 'user',
          content: `Title: ${title}\nDescription: ${description}\nGitHub: ${githubUrl || 'N/A'}`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) return defaultResult;
    return JSON.parse(content) as ScoringAssistantResult;
  } catch (error) {
    console.error('AI submissionScoringAssistant error, using fallback:', error);
    return defaultResult;
  }
}
