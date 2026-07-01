/*
 * Purpose: Automated AI grading request handlers.
 * Author: Copilot
 * Date: 2026-07-01
 */

import { Response } from 'express';
import { Submission } from '../models/Submission.model';
import { GradingResult } from '../models/GradingResult.model';
import { openai } from '../config/openai';
import type { AuthRequest } from '../types/express';

const GRADING_SYSTEM_PROMPT = `You are an expert software engineer evaluating code submissions.
Analyze the provided code and provide structured feedback in JSON format with these exact fields:
{
  "codeQualityScore": <0-100>,
  "uniquenessScore": <0-100>,
  "securityScore": <0-100>,
  "innovationScore": <0-100>,
  "overallScore": <0-100>,
  "summary": "<executive summary, max 200 chars>",
  "strengths": ["<strength1>", "<strength2>", ...],
  "vulnerabilities": ["<vulnerability1>", ...],
  "recommendations": ["<recommendation1>", ...]
}

Scoring guide:
- Code Quality (0-100): Readability, structure, error handling, documentation
- Uniqueness (0-100): How original/non-derivative the solution is
- Security (0-100): Absence of common vulnerabilities (SQL injection, XSS, etc)
- Innovation (0-100): Creative problem-solving, advanced techniques used
- Overall: Weighted average emphasizing quality and security

Return ONLY valid JSON.`;

export const gradeSubmission = async (req: AuthRequest, res: Response) => {
  try {
    const { submissionId } = req.params;

    // Check if already graded
    const existing = await GradingResult.findOne({ submissionId });
    if (existing) {
      return res.json({
        success: true,
        data: existing,
        message: 'Grading result already exists'
      });
    }

    // Get submission with code
    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    // Fetch code from sandbox URL or use description
    let codeContent = submission.description || '';
    
    if (submission.solutionUrl) {
      try {
        const response = await fetch(submission.solutionUrl);
        if (response.ok) {
          codeContent = await response.text();
        }
      } catch (e) {
        console.log('Could not fetch code from URL, using description');
      }
    }

    if (!codeContent.trim()) {
      return res.status(400).json({
        success: false,
        message: 'No code content available for grading'
      });
    }

    // Truncate code if too long (to avoid token limits)
    const maxChars = 8000;
    if (codeContent.length > maxChars) {
      codeContent = codeContent.substring(0, maxChars) + '\n... (truncated)';
    }

    const startTime = Date.now();

    // Call OpenAI API
    const response = await openai.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      system: GRADING_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Please grade this code submission:\n\n${codeContent}`
        }
      ]
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from OpenAI');
    }

    // Parse JSON response
    let gradingData;
    try {
      // Extract JSON from response (may have markdown code blocks)
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in response');
      gradingData = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('Failed to parse grading response:', content.text);
      return res.status(500).json({
        success: false,
        message: 'Failed to parse AI grading response'
      });
    }

    // Validate required fields
    if (
      typeof gradingData.codeQualityScore !== 'number' ||
      typeof gradingData.uniquenessScore !== 'number' ||
      typeof gradingData.securityScore !== 'number'
    ) {
      return res.status(500).json({
        success: false,
        message: 'Invalid grading data from AI'
      });
    }

    const processingTime = Date.now() - startTime;

    // Create grading result
    const gradingResult = await GradingResult.create({
      submissionId,
      codeQualityScore: Math.round(gradingData.codeQualityScore),
      uniquenessScore: Math.round(gradingData.uniquenessScore),
      securityScore: Math.round(gradingData.securityScore),
      innovationScore: Math.round(gradingData.innovationScore || 0),
      overallScore: Math.round(gradingData.overallScore),
      summary: gradingData.summary || '',
      strengths: gradingData.strengths || [],
      vulnerabilities: gradingData.vulnerabilities || [],
      recommendations: gradingData.recommendations || [],
      processingTime
    });

    // Update submission with AI score
    await Submission.findByIdAndUpdate(submissionId, {
      aiScore: gradingResult.overallScore,
      aiFeedback: {
        summary: gradingData.summary,
        codeQuality: gradingData.codeQualityScore,
        innovation: gradingData.innovationScore,
        plagiarismScore: 0,
        strengths: gradingData.strengths || [],
        weaknesses: gradingData.vulnerabilities || [],
        suggestions: gradingData.recommendations || []
      }
    });

    // Emit real-time notification
    const io = req.app.get('io');
    if (io) {
      io.emit('submission-graded', {
        submissionId,
        score: gradingResult.overallScore
      });
    }

    res.status(201).json({
      success: true,
      data: gradingResult,
      processingTime,
      message: 'Submission graded successfully'
    });
  } catch (error) {
    console.error('[AI Grading] Error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to grade submission'
    });
  }
};

export const getGradingResult = async (req: AuthRequest, res: Response) => {
  try {
    const { submissionId } = req.params;

    const result = await GradingResult.findOne({ submissionId });
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'No grading result found for this submission'
      });
    }

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('[AI Grading] Get error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch grading result'
    });
  }
};

export const getGradingStats = async (req: AuthRequest, res: Response) => {
  try {
    const { challengeId } = req.params;

    // Get stats for all submissions in a challenge
    const stats = await GradingResult.aggregate([
      {
        $lookup: {
          from: 'submissions',
          localField: 'submissionId',
          foreignField: '_id',
          as: 'submission'
        }
      },
      {
        $match: {
          'submission.challengeId': new (require('mongoose').Types.ObjectId)(challengeId)
        }
      },
      {
        $group: {
          _id: null,
          avgCodeQuality: { $avg: '$codeQualityScore' },
          avgUniqueness: { $avg: '$uniquenessScore' },
          avgSecurity: { $avg: '$securityScore' },
          avgOverall: { $avg: '$overallScore' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: stats[0] || {
        avgCodeQuality: 0,
        avgUniqueness: 0,
        avgSecurity: 0,
        avgOverall: 0,
        count: 0
      }
    });
  } catch (error) {
    console.error('[AI Grading] Stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch grading stats'
    });
  }
};
