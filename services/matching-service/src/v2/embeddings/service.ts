/**
 * Embedding Service
 *
 * Generates 1536-dimensional embeddings using OpenAI text-embedding-3-small.
 * Uses raw fetch (no SDK) following the ai-service pattern.
 */

import { Logger } from '@splits-network/shared-logging';
import { SupabaseClient } from '@supabase/supabase-js';
import type { IAiClient } from '@splits-network/shared-ai-client';

const MAX_TEXT_LENGTH = 8000;

export class EmbeddingService {
    constructor(
        private logger: Logger,
        private supabase?: SupabaseClient,
        private aiClient?: IAiClient,
    ) {}

    async generateEmbedding(text: string): Promise<number[]> {
        if (!this.aiClient) {
            throw new Error('AI client is not configured');
        }

        const truncated = text.substring(0, MAX_TEXT_LENGTH);
        const result = await this.aiClient.embedding('embedding', truncated);
        return result.embedding;
    }

    async buildCandidateTextFromSmartResume(candidateId: string): Promise<string | null> {
        if (!this.supabase) {
            this.logger.warn('No Supabase client available for smart resume lookup');
            return null;
        }

        const { data: profile } = await this.supabase
            .from('smart_resume_profiles')
            .select('*')
            .eq('candidate_id', candidateId)
            .is('deleted_at', null)
            .maybeSingle();

        if (!profile) return null;

        const profileId = profile.id;
        const parts: string[] = [];

        if (profile.headline) parts.push(profile.headline);
        if (profile.professional_summary) parts.push(profile.professional_summary);

        // Parallel fetch all visible child data
        const [experiences, projects, tasks, skills, education, certifications, publications] = await Promise.all([
            this.supabase.from('smart_resume_experiences').select('*').eq('profile_id', profileId).eq('visible_to_matching', true).is('deleted_at', null).order('sort_order'),
            this.supabase.from('smart_resume_projects').select('*').eq('profile_id', profileId).eq('visible_to_matching', true).is('deleted_at', null).order('sort_order'),
            this.supabase.from('smart_resume_tasks').select('*').eq('profile_id', profileId).eq('visible_to_matching', true).is('deleted_at', null).order('sort_order'),
            this.supabase.from('smart_resume_skills').select('*').eq('profile_id', profileId).eq('visible_to_matching', true).is('deleted_at', null).order('sort_order'),
            this.supabase.from('smart_resume_education').select('*').eq('profile_id', profileId).eq('visible_to_matching', true).is('deleted_at', null).order('sort_order'),
            this.supabase.from('smart_resume_certifications').select('*').eq('profile_id', profileId).eq('visible_to_matching', true).is('deleted_at', null).order('sort_order'),
            this.supabase.from('smart_resume_publications').select('*').eq('profile_id', profileId).eq('visible_to_matching', true).is('deleted_at', null).order('sort_order'),
        ]);

        if (experiences.data?.length) {
            const expText = experiences.data.map((e: any) => {
                const items = [e.title, e.company].filter(Boolean).join(' at ');
                const desc = e.description ? `: ${e.description.substring(0, 300)}` : '';
                const achievements = e.achievements?.length
                    ? ` | Achievements: ${e.achievements.join('; ')}` : '';
                return `${items}${desc}${achievements}`;
            }).join('. ');
            parts.push(`Experience: ${expText}`);
        }

        if (projects.data?.length) {
            const projText = projects.data.map((p: any) => {
                const items = [p.name, p.description?.substring(0, 200)].filter(Boolean).join(': ');
                const outcome = p.outcomes ? ` | Outcome: ${p.outcomes}` : '';
                const pSkills = p.skills_used?.length ? ` | Skills: ${p.skills_used.join(', ')}` : '';
                return `${items}${outcome}${pSkills}`;
            }).join('. ');
            parts.push(`Projects: ${projText}`);
        }

        if (tasks.data?.length) {
            const taskText = tasks.data.map((t: any) => {
                const desc = t.description || '';
                const impact = t.impact ? ` (Impact: ${t.impact})` : '';
                return `${desc}${impact}`;
            }).join('; ');
            parts.push(`Tasks: ${taskText}`);
        }

        if (skills.data?.length) {
            const skillText = skills.data.map((s: any) => {
                const level = s.proficiency ? ` (${s.proficiency})` : '';
                return `${s.name}${level}`;
            }).join(', ');
            parts.push(`Skills: ${skillText}`);
        }

        if (education.data?.length) {
            const eduText = education.data.map((e: any) =>
                `${e.degree || ''} ${e.field_of_study || ''} from ${e.institution || ''}`.trim()
            ).join(', ');
            parts.push(`Education: ${eduText}`);
        }

        if (certifications.data?.length) {
            const certText = certifications.data.map((c: any) => c.name).filter(Boolean).join(', ');
            parts.push(`Certifications: ${certText}`);
        }

        if (publications.data?.length) {
            const pubText = publications.data.map((p: any) => p.title).filter(Boolean).join(', ');
            parts.push(`Publications: ${pubText}`);
        }

        if (profile.total_years_experience) {
            parts.push(`${profile.total_years_experience} years of experience`);
        }

        this.logger.info({ candidateId, sections: parts.length }, 'Built candidate text from smart resume');
        return parts.join('. ').substring(0, MAX_TEXT_LENGTH);
    }

    buildCandidateText(candidate: any, smartResumeText?: string): string {
        if (smartResumeText) {
            return smartResumeText.substring(0, MAX_TEXT_LENGTH);
        }

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

        if (job.company?.name) parts.push(`Company: ${job.company.name}`);
        if (job.company?.industry) parts.push(`Industry: ${job.company.industry}`);

        return parts.join('. ').substring(0, MAX_TEXT_LENGTH);
    }
}
