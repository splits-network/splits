/**
 * Call Pipeline Prompt Templates
 * Per-call-type prompt templates with entity context injection.
 */

import { CallContext } from './repository';

interface PromptOutput {
    systemPrompt: string;
    userPrompt: string;
}

const TRANSCRIPT_LIMIT = 12000;
const JOB_DESCRIPTION_LIMIT = 2000;

/**
 * Prompt version tracking per call type.
 */
export const PROMPT_VERSIONS: Record<string, string> = {
    interview: 'interview-v2',
    client_meeting: 'client_meeting-v1',
};

/**
 * Interview summary prompt — recruiter-focused candidate assessment.
 */
export const INTERVIEW_PROMPT = {
    system: 'You are summarizing a video interview for a recruiter. Produce a concise, structured debrief using markdown headers and bullet points.',
    template: (context: CallContext, transcript: string): string => {
        const entityDetails = extractEntityDetails(context);
        const participantList = context.participants
            .map((p) => `- ${p.name} (${p.role})`)
            .join('\n');

        const jobTitle = entityDetails.job_title || 'Unknown Position';
        const companyName = entityDetails.company_name || '';
        const candidateName = entityDetails.candidate_name || '';
        const jobDescription = entityDetails.job_description || '';

        return `${candidateName ? `Candidate: ${candidateName}\n` : ''}${companyName ? `Company: ${companyName}\n` : ''}Role: ${jobTitle}
${jobDescription ? `\nJob description:\n${jobDescription.substring(0, JOB_DESCRIPTION_LIMIT)}\n` : ''}
Participants:
${participantList}

Transcript:
${transcript.substring(0, TRANSCRIPT_LIMIT)}

Generate a summary with these sections:

**TL;DR:** [One-line summary of the interview outcome, e.g. "Strong frontend candidate with React expertise, needs growth in system design"]

## Key Discussion Points
- 3-5 bullet points of main topics covered

## Strengths
- 3-5 bullet points mapping candidate responses to job requirements

## Concerns
- 0-3 bullet points of gaps or weak areas (omit section if none)

## Overall Impression
- One soft sentence like "Overall positive impression" or "Mixed results with strong technical foundation"

Rules:
- Start with the TL;DR line
- Keep total summary to 200-300 words
- Use bullet points and short phrases, not paragraphs
- Map candidate responses to job requirements where possible
- Do NOT make explicit hire/no-hire recommendations`;
    },
};

/**
 * Client meeting summary prompt — business outcomes and action items.
 */
export const CLIENT_MEETING_PROMPT = {
    system: 'You are summarizing a recruiter-company business meeting. Produce a concise, actionable debrief using markdown headers and bullet points.',
    template: (context: CallContext, transcript: string): string => {
        const entityDetails = extractEntityDetails(context);
        const participantList = context.participants
            .map((p) => `- ${p.name} (${p.role})`)
            .join('\n');

        const companyName = entityDetails.company_name || '';
        const jobTitle = entityDetails.job_title || '';

        return `${companyName ? `Company: ${companyName}\n` : ''}${jobTitle ? `Related role: ${jobTitle}\n` : ''}${context.call.title ? `Meeting topic: ${context.call.title}\n` : ''}${context.call.agenda ? `Agenda: ${context.call.agenda}\n` : ''}
Participants:
${participantList}

Transcript:
${transcript.substring(0, TRANSCRIPT_LIMIT)}

Generate a summary with these sections:

**TL;DR:** [One-line summary of key outcome, e.g. "Agreed to 3 new job postings, follow-up next Tuesday"]

## Action Items
- Bullet points with owners if identifiable (e.g. "- [Recruiter Name] to send updated JD by Friday")
- List all next steps and commitments made during the call

## Key Decisions
- What was agreed upon during the meeting

## Discussion Summary
- 3-5 bullet points of main topics discussed

## Follow-ups
- Items needing future attention or unresolved questions

Rules:
- Start with the TL;DR line
- Keep total summary to 200-400 words
- Use bullet points and short phrases, not paragraphs
- Prioritize actionable items over general discussion
- Attribute action items to specific people when identifiable from the transcript
- Do NOT include sensitive compensation details unless explicitly discussed`;
    },
};

/**
 * Select the appropriate prompt template based on call type.
 */
export function getPromptForCallType(
    callType: string,
    context: CallContext,
    transcript: string,
): PromptOutput {
    switch (callType) {
        case 'interview':
            return {
                systemPrompt: INTERVIEW_PROMPT.system,
                userPrompt: INTERVIEW_PROMPT.template(context, transcript),
            };

        case 'client_meeting':
            return {
                systemPrompt: CLIENT_MEETING_PROMPT.system,
                userPrompt: CLIENT_MEETING_PROMPT.template(context, transcript),
            };

        default:
            // Fallback to client_meeting style for unknown types
            return {
                systemPrompt: CLIENT_MEETING_PROMPT.system,
                userPrompt: CLIENT_MEETING_PROMPT.template(context, transcript),
            };
    }
}

/**
 * Flatten entity context into a simple key-value map for template injection.
 */
function extractEntityDetails(
    context: CallContext,
): Record<string, string> {
    const details: Record<string, string> = {};

    for (const entity of context.entityContext) {
        for (const [key, value] of Object.entries(entity.details)) {
            // First value wins (e.g., job_title from application takes priority)
            if (!details[key]) {
                details[key] = value;
            }
        }
    }

    return details;
}
