/**
 * Summary Service
 * Generates structured recruiter-focused interview summaries via GPT.
 */

import { Logger } from '@splits-network/shared-logging';

export class SummaryService {
    private openaiApiKey: string;
    private model: string;

    constructor(private logger: Logger) {
        this.openaiApiKey = process.env.OPENAI_API_KEY || '';
        this.model = process.env.OPENAI_SUMMARY_MODEL || 'gpt-4o-mini';

        if (!this.openaiApiKey) {
            this.logger.warn('OPENAI_API_KEY not set. Summary generation will fail.');
        }
    }

    /**
     * Generate a recruiter-focused debrief summary from a transcript.
     */
    async generateSummary(
        transcript: string,
        jobTitle: string,
        jobDescription: string,
        participants: Array<{ name: string; role: string }>,
    ): Promise<string> {
        const truncatedDescription = jobDescription.substring(0, 2000);
        const participantList = participants
            .map((p) => `- ${p.name} (${p.role})`)
            .join('\n');

        const systemPrompt = `You are summarizing a video interview transcript for a recruiter. Produce a concise debrief summary using markdown headers and bullet points.`;

        const userPrompt = `The candidate interviewed for the role: ${jobTitle}

Job description:
${truncatedDescription}

Participants:
${participantList}

Transcript:
${transcript.substring(0, 12000)}

Generate a summary with these sections:

## Key Discussion Points
- 3-5 bullet points of main topics covered

## Strengths
- 3-5 bullet points mapping candidate responses to job requirements

## Concerns
- 0-3 bullet points of gaps or weak areas (omit section if none)

## Overall Impression
- One soft sentence like "Overall positive impression" or "Mixed results with strong technical foundation"

Rules:
- Keep total summary to 200-300 words
- Use bullet points and short phrases, not paragraphs
- Map candidate responses to job requirements where possible
- Do NOT make explicit hire/no-hire recommendations`;

        const body = JSON.stringify({
            model: this.model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            temperature: 0.3,
            max_tokens: 1500,
        });

        const MAX_RETRIES = 2;
        let lastError: Error | null = null;

        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
            if (attempt > 0) {
                const delayMs = Math.min(1000 * Math.pow(2, attempt - 1), 8000);
                await new Promise((resolve) => setTimeout(resolve, delayMs));
                this.logger.info({ attempt }, 'Retrying summary generation');
            }

            const response = await fetch(
                'https://api.openai.com/v1/chat/completions',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${this.openaiApiKey}`,
                    },
                    body,
                    signal: AbortSignal.timeout(60_000),
                },
            );

            if (!response.ok) {
                const errorText = await response.text().catch(() => '');
                lastError = new Error(
                    `OpenAI API error: ${response.status} ${errorText}`,
                );

                if (response.status === 429 || response.status >= 500) {
                    continue;
                }
                throw lastError;
            }

            let data: any;
            try {
                data = await response.json();
            } catch {
                lastError = new Error('OpenAI returned invalid JSON');
                continue;
            }

            const content = data?.choices?.[0]?.message?.content;
            if (!content) {
                lastError = new Error('OpenAI response missing content');
                continue;
            }

            this.logger.info(
                { model: this.model, tokens: data.usage?.total_tokens },
                'Summary generated',
            );
            return content;
        }

        throw lastError || new Error('Summary generation failed after retries');
    }
}
