/**
 * Matching Orchestrator
 *
 * Coordinates L1 (rule) + L2 (skills) + L3 (AI) scoring.
 * Triggered by domain events or batch refresh.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { Logger } from '@splits-network/shared-logging';
import type { IAiClient } from '@splits-network/shared-ai-client';
import { IEventPublisher } from '../shared/events.js';
import { MatchRepository } from './repository.js';
import { MatchUpsert, MatchFactors } from './types.js';
import { computeRuleScore, RuleScoringInput } from './rule-scorer.js';
import { computeSkillsScore } from './skills-scorer.js';
import { computeAiScore } from './ai-scorer.js';
import { EmbeddingService } from '../embeddings/service.js';
import { EmbeddingRepository } from '../embeddings/repository.js';

export class MatchingOrchestrator {
    constructor(
        private repository: MatchRepository,
        private embeddingService: EmbeddingService,
        private embeddingRepository: EmbeddingRepository,
        private supabase: SupabaseClient,
        private eventPublisher?: IEventPublisher,
        private logger?: Logger,
        private aiClient?: IAiClient,
    ) {}

    async triggerForCandidate(candidateId: string): Promise<void> {
        const candidate = await this.fetchCandidate(candidateId);
        if (!candidate || candidate.marketplace_visibility !== 'public') return;

        await this.updateCandidateEmbedding(candidate);

        const { data: jobs } = await this.supabase
            .from('jobs')
            .select('id')
            .eq('status', 'active')
            .limit(500);

        if (!jobs?.length) return;

        for (const job of jobs) {
            try {
                await this.generateMatchForPair(candidateId, job.id);
            } catch (error) {
                this.logger?.warn({ candidateId, jobId: job.id, error }, 'Failed to generate match');
            }
        }
    }

    async triggerForJob(jobId: string): Promise<void> {
        const job = await this.fetchJob(jobId);
        if (!job || job.status !== 'active') return;

        await this.updateJobEmbedding(job);

        const { data: candidates } = await this.supabase
            .from('candidates')
            .select('id')
            .eq('marketplace_visibility', 'public')
            .limit(500);

        if (!candidates?.length) return;

        for (const candidate of candidates) {
            try {
                await this.generateMatchForPair(candidate.id, jobId);
            } catch (error) {
                this.logger?.warn({ candidateId: candidate.id, jobId, error }, 'Failed to generate match');
            }
        }
    }

    async runBatchCatchup(limit: number = 200): Promise<number> {
        const { data: jobs } = await this.supabase
            .from('jobs')
            .select('id')
            .eq('status', 'active')
            .limit(limit);

        let count = 0;
        for (const job of jobs || []) {
            try {
                await this.triggerForJob(job.id);
                count++;
            } catch (error) {
                this.logger?.warn({ jobId: job.id, error }, 'Batch catch-up failed for job');
            }
        }
        return count;
    }

    private async generateMatchForPair(candidateId: string, jobId: string): Promise<void> {
        const [candidate, job, requirements, structuredJobSkills, structuredCandidateSkills] = await Promise.all([
            this.fetchCandidate(candidateId),
            this.fetchJob(jobId),
            this.fetchJobRequirements(jobId),
            this.fetchJobSkills(jobId),
            this.fetchCandidateSkills(candidateId),
        ]);

        if (!candidate || !job) return;
        if (candidate.marketplace_visibility !== 'public' || job.status !== 'active') return;

        // Layer 1: Rule-based scoring
        const ruleInput: RuleScoringInput = {
            candidate: {
                desired_salary_min: candidate.desired_salary_min,
                desired_salary_max: candidate.desired_salary_max,
                desired_job_type: candidate.desired_job_type,
                open_to_remote: candidate.open_to_remote,
                open_to_relocation: candidate.open_to_relocation,
                location: candidate.location,
                availability: candidate.availability,
            },
            job: {
                salary_min: job.salary_min,
                salary_max: job.salary_max,
                employment_type: job.employment_type,
                commute_types: job.commute_types,
                job_level: job.job_level,
                location: job.location,
                open_to_relocation: job.open_to_relocation,
            },
            candidate_years_experience: candidate.resume_metadata?.total_years_experience,
        };
        const ruleResult = computeRuleScore(ruleInput);

        // Layer 2: Skills scoring (structured when available, legacy fallback)
        const candidateSkills = candidate.resume_metadata?.skills || [];
        const skillsResult = computeSkillsScore({
            candidate_skills: candidateSkills,
            job_requirements: requirements,
            structured_candidate_skills: structuredCandidateSkills,
            structured_job_skills: structuredJobSkills,
        });

        // Layer 3: AI scoring (only for partner jobs — "True Match" tier)
        let aiScore: number | null = null;
        let aiSummary: string | undefined;
        let cosineSimilarity: number | undefined;
        const isPartner = await this.isPartnerJob(job);

        if (isPartner) {
            const similarity = await this.embeddingRepository.getCosineSimilarity(
                'candidate', candidateId,
                'job', jobId,
            );
            cosineSimilarity = similarity ?? undefined;

            if (similarity !== null) {
                const aiResult = await computeAiScore(
                    { candidate, job, requirements, cosine_similarity: similarity },
                    this.logger!,
                    this.aiClient,
                );
                aiScore = aiResult.score;
                aiSummary = aiResult.summary;
                cosineSimilarity = aiResult.cosine_similarity;
            }
        }

        // Composite score
        const matchTier = aiScore != null ? 'true' as const : 'standard' as const;
        const matchScore = aiScore != null
            ? (ruleResult.score * 0.4) + (skillsResult.score * 0.4) + (aiScore * 0.2)
            : (ruleResult.score * 0.5) + (skillsResult.score * 0.5);

        const matchFactors: MatchFactors = {
            ...ruleResult.factors,
            skills_matched: skillsResult.matched_skills,
            skills_missing: [...skillsResult.missing_mandatory, ...skillsResult.missing_preferred],
            skills_match_pct: skillsResult.match_pct,
            skills_source: skillsResult.skills_source,
            ...(aiSummary && { ai_summary: aiSummary }),
            ...(cosineSimilarity !== undefined && { cosine_similarity: cosineSimilarity }),
        };

        const upsert: MatchUpsert = {
            candidate_id: candidateId,
            job_id: jobId,
            match_score: Math.round(matchScore * 100) / 100,
            rule_score: ruleResult.score,
            skills_score: skillsResult.score,
            ai_score: aiScore,
            match_factors: matchFactors,
            match_tier: matchTier,
        };

        const match = await this.repository.upsertMatch(upsert);

        if (this.eventPublisher) {
            await this.eventPublisher.publish('match.generated', {
                match_id: match.id,
                candidate_id: candidateId,
                job_id: jobId,
                match_score: match.match_score,
                match_tier: matchTier,
                rule_score: ruleResult.score,
                skills_score: skillsResult.score,
            });
        }
    }

    private async isPartnerJob(job: any): Promise<boolean> {
        if (!job.job_owner_recruiter_id) return false;

        const { data } = await this.supabase
            .from('subscriptions')
            .select('plans!inner(tier)')
            .eq('recruiter_id', job.job_owner_recruiter_id)
            .eq('status', 'active')
            .maybeSingle();

        return (data as any)?.plans?.tier === 'partner';
    }

    private async updateCandidateEmbedding(candidate: any): Promise<void> {
        try {
            const text = this.embeddingService.buildCandidateText(candidate);
            if (!text) return;
            const embedding = await this.embeddingService.generateEmbedding(text);
            await this.embeddingRepository.upsertEmbedding('candidate', candidate.id, embedding);
        } catch (error) {
            this.logger?.warn({ candidateId: candidate.id, error }, 'Failed to update candidate embedding');
        }
    }

    private async updateJobEmbedding(job: any): Promise<void> {
        try {
            const requirements = await this.fetchJobRequirements(job.id);
            const text = this.embeddingService.buildJobText(job, requirements);
            if (!text) return;
            const embedding = await this.embeddingService.generateEmbedding(text);
            await this.embeddingRepository.upsertEmbedding('job', job.id, embedding);
        } catch (error) {
            this.logger?.warn({ jobId: job.id, error }, 'Failed to update job embedding');
        }
    }

    private async fetchCandidate(id: string) {
        const { data } = await this.supabase.from('candidates').select('*').eq('id', id).maybeSingle();
        return data;
    }

    private async fetchJob(id: string) {
        const { data } = await this.supabase.from('jobs').select('*').eq('id', id).maybeSingle();
        return data;
    }

    private async fetchJobRequirements(jobId: string) {
        const { data } = await this.supabase
            .from('job_requirements')
            .select('description, requirement_type')
            .eq('job_id', jobId);
        return data || [];
    }

    private async fetchJobSkills(jobId: string) {
        const { data } = await this.supabase
            .from('job_skills')
            .select('is_required, skill:skills(id, name, slug)')
            .eq('job_id', jobId);
        if (!data) return [];
        return data
            .filter((row: any) => row.skill)
            .map((row: any) => ({ skill: row.skill, is_required: row.is_required }));
    }

    private async fetchCandidateSkills(candidateId: string) {
        const { data } = await this.supabase
            .from('candidate_skills')
            .select('skill:skills(id, name, slug)')
            .eq('candidate_id', candidateId);
        if (!data) return [];
        return data
            .filter((row: any) => row.skill)
            .map((row: any) => row.skill);
    }
}
