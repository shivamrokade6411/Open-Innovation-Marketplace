/*
 * Purpose: AI challenge summary generator.
 * Author: Antigravity Pair Programmer
 * Date: 2026-08-14
 */

import { openai } from '../../config/openai';

export interface ChallengeSummaryResult {
  summary: string;
  requiredSkills: string[];
  expectedDifficulty: string;
  keyDeliverables: string[];
}

export async function challengeSummary(title: string, description: string): Promise<ChallengeSummaryResult> {
  const defaultResult: ChallengeSummaryResult = {
    summary: description.slice(0, 180) + '...',
    requiredSkills: ['React', 'Node.js', 'Typescript'],
    expectedDifficulty: 'medium',
    keyDeliverables: ['Source code repository link', 'Working production URL', 'Design presentation slide PDF']
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
          content: 'You are an expert technical evaluator. Analyze the challenge title and description and output a JSON object containing keys: summary (string, 2 sentences max), requiredSkills (array of strings), expectedDifficulty ("easy" | "medium" | "hard" | "expert"), and keyDeliverables (array of strings).'
        },
        {
          role: 'user',
          content: `Title: ${title}\nDescription: ${description}`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) return defaultResult;
    return JSON.parse(content) as ChallengeSummaryResult;
  } catch (error) {
    console.error('AI challengeSummary error, using fallback:', error);
    return defaultResult;
  }
}
