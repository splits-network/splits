/**
 * V3 Match Data Fetcher
 *
 * Encapsulates all database queries needed by the matching orchestrator.
 * Fetches candidates, jobs, requirements, and skills.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { Logger } from '@splits-network/shared-logging';
import { EmbeddingService } from '../../v2/embeddings/service.js';
import { EmbeddingRepository } from '../../v2/embeddings/repository.js';
import { SmartResumeFetcher } from './smart-resume-fetcher.js';
import type { SmartResumeMatchingData } from './smart-resume-types.js';

export class MatchDataFetcher {
  private smartResumeFetcher: SmartResumeFetcher;

  constructor(
    private supabase: SupabaseClient,
    private embeddingService: EmbeddingService,
    private embeddingRepository: EmbeddingRepository,
    private logger: Logger,
  ) {
    this.smartResumeFetcher = new SmartResumeFetcher(supabase, logger);
  }

  async fetchCandidate(id: string) {
    const { data } = await this.supabase.from('candidates').select('*').eq('id', id).maybeSingle();
    return data;
  }

  async fetchJob(id: string) {
    const { data } = await this.supabase.from('jobs').select('*').eq('id', id).maybeSingle();
    return data;
  }

  async fetchJobRequirements(jobId: string) {
    const { data } = await this.supabase
      .from('job_requirements')
      .select('description, requirement_type')
      .eq('job_id', jobId);
    return data || [];
  }

  async fetchJobSkills(jobId: string) {
    const { data } = await this.supabase
      .from('job_skills')
      .select('is_required, skill:skills(id, name, slug)')
      .eq('job_id', jobId);
    if (!data) return [];
    return data
      .filter((row: any) => row.skill)
      .map((row: any) => ({ skill: row.skill, is_required: row.is_required }));
  }

  async fetchCandidateSkills(candidateId: string) {
    const { data } = await this.supabase
      .from('candidate_skills')
      .select('skill:skills(id, name, slug)')
      .eq('candidate_id', candidateId);
    if (!data) return [];
    return data
      .filter((row: any) => row.skill)
      .map((row: any) => row.skill);
  }

  async fetchSmartResumeData(candidateId: string): Promise<SmartResumeMatchingData | null> {
    return this.smartResumeFetcher.fetch(candidateId);
  }

  clearSmartResumeCache(): void {
    this.smartResumeFetcher.clearCache();
  }

  async fetchActiveJobIds(limit: number = 500): Promise<string[]> {
    const { data } = await this.supabase
      .from('jobs')
      .select('id')
      .eq('status', 'active')
      .limit(limit);
    return (data || []).map((j: any) => j.id);
  }

  async fetchPublicCandidateIds(limit: number = 500): Promise<string[]> {
    const { data } = await this.supabase
      .from('candidates')
      .select('id')
      .eq('marketplace_visibility', 'public')
      .limit(limit);
    return (data || []).map((c: any) => c.id);
  }

  async isPartnerJob(job: any): Promise<boolean> {
    if (!job.job_owner_recruiter_id) return false;

    const { data } = await this.supabase
      .from('subscriptions')
      .select('plans!inner(tier)')
      .eq('recruiter_id', job.job_owner_recruiter_id)
      .eq('status', 'active')
      .maybeSingle();

    return (data as any)?.plans?.tier === 'partner';
  }

  async updateCandidateEmbedding(candidate: any): Promise<void> {
    try {
      const smartText = await this.embeddingService.buildCandidateTextFromSmartResume(candidate.id);
      const text = this.embeddingService.buildCandidateText(candidate, smartText ?? undefined);
      if (!text) return;
      const embedding = await this.embeddingService.generateEmbedding(text);
      await this.embeddingRepository.upsertEmbedding('candidate', candidate.id, embedding);
    } catch (error) {
      this.logger.warn({ candidateId: candidate.id, error }, 'Failed to update candidate embedding');
    }
  }

  async updateJobEmbedding(job: any): Promise<void> {
    try {
      const requirements = await this.fetchJobRequirements(job.id);
      const text = this.embeddingService.buildJobText(job, requirements);
      if (!text) return;
      const embedding = await this.embeddingService.generateEmbedding(text);
      await this.embeddingRepository.upsertEmbedding('job', job.id, embedding);
    } catch (error) {
      this.logger.warn({ jobId: job.id, error }, 'Failed to update job embedding');
    }
  }

  async getCosineSimilarity(
    candidateId: string, jobId: string,
  ): Promise<number | null> {
    return this.embeddingRepository.getCosineSimilarity(
      'candidate', candidateId, 'job', jobId,
    );
  }
}
