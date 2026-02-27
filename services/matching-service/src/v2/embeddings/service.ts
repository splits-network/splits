/**
 * Embedding Service
 *
 * Generates 1536-dimensional embeddings using OpenAI text-embedding-3-small.
 * Uses raw fetch (no SDK) following the ai-service pattern.
 */

import { Logger } from '@splits-network/shared-logging';

const MAX_TEXT_LENGTH = 8000;

export class EmbeddingService {
    private apiKey: string;
    private model = 'text-embedding-3-small';

    constructor(private logger: Logger) {
        this.apiKey = process.env.OPENAI_API_KEY || '';
    }

    async generateEmbedding(text: string): Promise<number[]> {
        if (!this.apiKey) {
            throw new Error('OPENAI_API_KEY not configured');
        }

        const truncated = text.substring(0, MAX_TEXT_LENGTH);

        const response = await fetch('https://api.openai.com/v1/embeddings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
                model: this.model,
                input: truncated,
            }),
        });

        if (!response.ok) {
            const body = await response.text();
            throw new Error(`OpenAI embeddings API error: ${response.status} ${body}`);
        }

        const data = await response.json() as any;
        return data.data[0].embedding;
    }

    buildCandidateText(candidate: any): string {
        const parts: string[] = [];
        const meta = candidate.resume_metadata;

        if (candidate.current_title) parts.push(candidate.current_title);
        if (candidate.current_company) parts.push(`at ${candidate.current_company}`);
        if (candidate.location) parts.push(`Location: ${candidate.location}`);

        if (meta?.skills?.length) {
            const skillNames = meta.skills.map((s: any) => s.name).join(', ');
            parts.push(`Skills: ${skillNames}`);
        }

        if (meta?.experience?.length) {
            const recent = meta.experience.slice(0, 5);
            const expText = recent.map((e: any) =>
                `${e.title} at ${e.company}${e.description ? `: ${e.description.substring(0, 200)}` : ''}`
            ).join('. ');
            parts.push(`Experience: ${expText}`);
        }

        if (meta?.education?.length) {
            const eduText = meta.education.map((e: any) =>
                `${e.degree || ''} ${e.field_of_study || ''} from ${e.institution || ''}`.trim()
            ).join(', ');
            parts.push(`Education: ${eduText}`);
        }

        if (meta?.total_years_experience) {
            parts.push(`${meta.total_years_experience} years of experience`);
        }

        if (candidate.bio) parts.push(candidate.bio.substring(0, 500));

        return parts.join('. ').substring(0, MAX_TEXT_LENGTH);
    }

    buildJobText(job: any, requirements: any[]): string {
        const parts: string[] = [];

        if (job.title) parts.push(job.title);
        if (job.employment_type) parts.push(`Type: ${job.employment_type}`);
        if (job.job_level) parts.push(`Level: ${job.job_level}`);
        if (job.location) parts.push(`Location: ${job.location}`);

        const description = job.recruiter_description || job.candidate_description || '';
        if (description) parts.push(description.substring(0, 1000));

        if (requirements.length) {
            const reqText = requirements.map(r =>
                `[${r.requirement_type}] ${r.description}`
            ).join('. ');
            parts.push(`Requirements: ${reqText}`);
        }

        if (job.company_name) parts.push(`Company: ${job.company_name}`);
        if (job.company_industry) parts.push(`Industry: ${job.company_industry}`);

        return parts.join('. ').substring(0, MAX_TEXT_LENGTH);
    }
}
