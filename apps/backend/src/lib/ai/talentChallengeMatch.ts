/*
 * Purpose: AI Talent matching engine.
 * Author: Antigravity Pair Programmer
 * Date: 2026-08-14
 */

import { openai } from '../../config/openai';

export interface TalentMatchResult {
  matchPercentage: number;
  missingSkills: string[];
  recommendationReason: string;
}

export async function talentChallengeMatch(
  userSkills: string[],
  userBio: string,
  challengeTitle: string,
  challengeSkills: string[]
): Promise<TalentMatchResult> {
  const missing = challengeSkills.filter((s) => !userSkills.map((us) => us.toLowerCase()).includes(s.toLowerCase()));
  const matchedCount = challengeSkills.length - missing.length;
  const rawPercentage = challengeSkills.length > 0 ? Math.round((matchedCount / challengeSkills.length) * 100) : 70;

  const defaultResult: TalentMatchResult = {
    matchPercentage: Math.max(20, rawPercentage),
    missingSkills: missing,
    recommendationReason: `Matches ${matchedCount} out of ${challengeSkills.length} requested technologies.`
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
          content: 'You are a career consultant. Evaluate how well the user profile fits this challenge and output a JSON object containing keys: matchPercentage (0-100), missingSkills (array of strings), and recommendationReason (string).'
        },
        {
          role: 'user',
          content: `User Skills: ${userSkills.join(', ')}\nBio: ${userBio}\nChallenge Title: ${challengeTitle}\nChallenge Tech: ${challengeSkills.join(', ')}`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) return defaultResult;
    return JSON.parse(content) as TalentMatchResult;
  } catch (error) {
    console.error('AI talentChallengeMatch error, using fallback:', error);
    return defaultResult;
  }
}
