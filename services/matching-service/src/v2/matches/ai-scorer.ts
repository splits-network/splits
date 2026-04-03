/**
 * Layer 3: AI Scoring Engine (True Matches)
 *
 * Uses pgvector cosine similarity + optional GPT-4o-mini nuanced analysis.
 * Only runs for partner-tier recruiter jobs.
 */

import { Logger } from '@splits-network/shared-logging';
import type { IAiClient } from '@splits-network/shared-ai-client';

export interface AiScoringSmartResume {
    professional_summary?: string;
    experiences?: Array<{ title: string; company: string; achievements?: string[] }>;
    projects?: Array<{ name: string; outcomes?: string; skills_used?: string[] }>;
    skills?: Array<{ name: string; proficiency?: string; years_used?: number }>;
}

export interface AiScoringInput {
    candidate: {
        full_name?: string;
        current_title?: string;
        current_company?: string;
        location?: string;
        bio?: string;
        resume_metadata?: any;
    };
    job: {
        title: string;
        recruiter_description?: string;
        candidate_description?: string;
        location?: string;
        employment_type?: string;
        job_level?: string;
    };
    requirements: Array<{ description: string; requirement_type: string }>;
    cosine_similarity: number;
    smart_resume?: AiScoringSmartResume;
}

export interface AiScoringResult {
    score: number;
    summary: string;
    cosine_similarity: number;
}

export async function computeAiScore(
    input: AiScoringInput,
    logger: Logger,
    aiClient?: IAiClient,
): Promise<AiScoringResult> {
    const { cosine_similarity } = input;

    // Base score from embedding similarity (70% weight)
    const embeddingScore = cosine_similarity * 70;

    // Try GPT nuanced analysis (30% weight)
    const gptResult = await callGptAnalysis(input, logger, aiClient);

    if (gptResult) {
        const score = Math.round((embeddingScore + gptResult.score * 0.3) * 100) / 100;
        return {
            score: Math.min(100, Math.max(0, score)),
            summary: gptResult.summary,
            cosine_similarity,
        };
    }

    // Fallback: embedding similarity only
    const fallbackScore = Math.round(cosine_similarity * 100 * 100) / 100;
    return {
        score: Math.min(100, fallbackScore),
        summary: 'Score based on profile similarity',
        cosine_similarity,
    };
}

async function callGptAnalysis(
    input: AiScoringInput,
    logger: Logger,
    aiClient?: IAiClient,
): Promise<{ score: number; summary: string } | null> {
    if (!aiClient) return null;

    try {
        const prompt = buildAnalysisPrompt(input);
        const messages = [
            { role: 'system' as const, content: 'You are a recruiting match analyst. Evaluate candidate-job fit. Respond with JSON only.' },
            { role: 'user' as const, content: prompt },
        ];

        const result = await aiClient.chatCompletion('matching_scoring', messages, {
            jsonMode: true,
        });

        const parsed = JSON.parse(result.content);
        return {
            score: Math.min(100, Math.max(0, parsed.fit_score || 50)),
            summary: parsed.summary || 'AI analysis completed',
        };
    } catch (error) {
        logger.warn({ error }, 'AI analysis failed, using embedding-only score');
        return null;
    }
}

function buildAnalysisPrompt(input: AiScoringInput): string {
    const { candidate, job, requirements, smart_resume } = input;
    const reqText = requirements.map(r => `[${r.requirement_type}] ${r.description}`).join('\n');

    if (smart_resume) {
        return buildSmartResumePrompt(candidate, job, reqText, smart_resume);
    }

    const skills = candidate.resume_metadata?.skills?.map((s: any) => s.name).join(', ') || 'Unknown';
    const experience = candidate.resume_metadata?.total_years_experience || 'Unknown';

    return `Evaluate this candidate-job match:

CANDIDATE: ${candidate.current_title || 'Unknown'} at ${candidate.current_company || 'Unknown'}
Location: ${candidate.location || 'Unknown'}
Skills: ${skills}
Experience: ${experience} years

JOB: ${job.title} (${job.employment_type || 'Unknown'}, ${job.job_level || 'Unknown'})
Location: ${job.location || 'Unknown'}
Description: ${(job.recruiter_description || job.candidate_description || '').substring(0, 500)}

REQUIREMENTS:
${reqText || 'None specified'}

Respond with JSON: { "fit_score": <0-100>, "summary": "<1-2 sentence assessment>" }`;
}

function buildSmartResumePrompt(
    candidate: AiScoringInput['candidate'],
    job: AiScoringInput['job'],
    reqText: string,
    sr: AiScoringSmartResume,
): string {
    const skillsText = sr.skills?.length
        ? sr.skills.map(s => {
            const parts = [s.name];
            if (s.proficiency) parts.push(`(${s.proficiency})`);
            if (s.years_used) parts.push(`${s.years_used}yr`);
            return parts.join(' ');
        }).join(', ')
        : 'Unknown';

    const achievementsText = sr.experiences?.length
        ? sr.experiences
            .filter(e => e.achievements?.length)
            .flatMap(e => e.achievements!.map(a => `- ${e.title} at ${e.company}: ${a}`))
            .slice(0, 8)
            .join('\n')
        : '';

    const projectsText = sr.projects?.length
        ? sr.projects.slice(0, 5).map(p => {
            const parts = [p.name];
            if (p.outcomes) parts.push(`(${p.outcomes})`);
            if (p.skills_used?.length) parts.push(`[${p.skills_used.join(', ')}]`);
            return `- ${parts.join(' ')}`;
        }).join('\n')
        : '';

    let prompt = `Evaluate this candidate-job match:

CANDIDATE: ${candidate.current_title || 'Unknown'} at ${candidate.current_company || 'Unknown'}
Location: ${candidate.location || 'Unknown'}
${sr.professional_summary ? `Summary: ${sr.professional_summary.substring(0, 400)}` : ''}
Skills: ${skillsText}`;

    if (achievementsText) prompt += `\n\nKEY ACHIEVEMENTS:\n${achievementsText}`;
    if (projectsText) prompt += `\n\nPROJECTS:\n${projectsText}`;

    prompt += `

JOB: ${job.title} (${job.employment_type || 'Unknown'}, ${job.job_level || 'Unknown'})
Location: ${job.location || 'Unknown'}
Description: ${(job.recruiter_description || job.candidate_description || '').substring(0, 500)}

REQUIREMENTS:
${reqText || 'None specified'}

Respond with JSON: { "fit_score": <0-100>, "summary": "<1-2 sentence assessment>" }`;

    return prompt;
}
