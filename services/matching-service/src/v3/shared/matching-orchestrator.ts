/**
 * V3 Matching Orchestrator
 *
 * Coordinates L1 (rule) + L2 (skills) + L3 (AI) scoring pipeline.
 * Triggered by domain events or batch refresh.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { Logger } from '@splits-network/shared-logging';
import type { IAiClient } from '@splits-network/shared-ai-client';
import { IEventPublisher } from '../../v2/shared/events.js';
import { MatchRepository } from '../matches/repository.js';
import { MatchUpsert, MatchFactors } from '../matches/types.js';
import { computeRuleScore, RuleScoringInput } from '../../v2/matches/rule-scorer.js';
import { computeSkillsScore } from '../../v2/matches/skills-scorer.js';
import { computeAiScore } from '../../v2/matches/ai-scorer.js';
import { EmbeddingService } from '../../v2/embeddings/service.js';
import { EmbeddingRepository } from '../../v2/embeddings/repository.js';
import { MatchDataFetcher } from './match-data-fetcher.js';
import type { SmartResumeMatchingData } from './smart-resume-types.js';
import type { AiScoringSmartResume } from '../../v2/matches/ai-scorer.js';

export interface MatchingOrchestratorConfig {
  repository: MatchRepository;
  embeddingService: EmbeddingService;
  embeddingRepository: EmbeddingRepository;
  supabase: SupabaseClient;
  eventPublisher?: IEventPublisher;
  logger: Logger;
  aiClient?: IAiClient;
}

export class MatchingOrchestrator {
  private repository: MatchRepository;
  private fetcher: MatchDataFetcher;
  private eventPublisher?: IEventPublisher;
  private logger: Logger;
  private aiClient?: IAiClient;

  constructor(config: MatchingOrchestratorConfig) {
    this.repository = config.repository;
    this.eventPublisher = config.eventPublisher;
    this.logger = config.logger;
    this.aiClient = config.aiClient;
    this.fetcher = new MatchDataFetcher(
      config.supabase, config.embeddingService,
      config.embeddingRepository, config.logger,
    );
  }

  async scoreCandidate(candidateId: string): Promise<void> {
    this.fetcher.clearSmartResumeCache();

    const candidate = await this.fetcher.fetchCandidate(candidateId);
    if (!candidate || candidate.marketplace_visibility !== 'public') return;

    await this.fetcher.updateCandidateEmbedding(candidate);

    const jobIds = await this.fetcher.fetchActiveJobIds();
    for (const jobId of jobIds) {
      try {
        await this.generateMatchForPair(candidateId, jobId);
      } catch (error) {
        this.logger.warn({ candidateId, jobId, error }, 'Failed to generate match');
      }
    }
  }

  async scoreJob(jobId: string): Promise<void> {
    const job = await this.fetcher.fetchJob(jobId);
    if (!job || job.status !== 'active') return;

    await this.fetcher.updateJobEmbedding(job);

    const candidateIds = await this.fetcher.fetchPublicCandidateIds();
    for (const candidateId of candidateIds) {
      try {
        await this.generateMatchForPair(candidateId, jobId);
      } catch (error) {
        this.logger.warn({ candidateId, jobId, error }, 'Failed to generate match');
      }
    }
  }

  async handleJobStatusChanged(jobId: string, status: string): Promise<void> {
    if (status === 'active') {
      await this.scoreJob(jobId);
    }
    // For closed/paused/filled jobs, matches stay but no new ones are generated
  }

  async rescoreWithResumeData(candidateId: string): Promise<void> {
    await this.scoreCandidate(candidateId);
  }

  async rescoreWithSmartResume(candidateId: string): Promise<void> {
    this.logger.info({ candidateId }, 'Rescoring candidate with smart resume data');
    await this.scoreCandidate(candidateId);
  }

  async runBatchCatchup(limit: number = 200): Promise<number> {
    const jobIds = await this.fetcher.fetchActiveJobIds(limit);
    let count = 0;
    for (const jobId of jobIds) {
      try {
        await this.scoreJob(jobId);
        count++;
      } catch (error) {
        this.logger.warn({ jobId, error }, 'Batch catch-up failed for job');
      }
    }
    return count;
  }

  private async generateMatchForPair(candidateId: string, jobId: string): Promise<void> {
    const [candidate, job, requirements, jobSkills, candidateSkills, smartResumeData] =
      await Promise.all([
        this.fetcher.fetchCandidate(candidateId),
        this.fetcher.fetchJob(jobId),
        this.fetcher.fetchJobRequirements(jobId),
        this.fetcher.fetchJobSkills(jobId),
        this.fetcher.fetchCandidateSkills(candidateId),
        this.fetcher.fetchSmartResumeData(candidateId),
      ]);

    if (!candidate || !job) return;
    if (candidate.marketplace_visibility !== 'public' || job.status !== 'active') return;

    const ruleResult = this.computeRuleScore(candidate, job, smartResumeData);
    const skillsResult = this.computeSkillsScore(candidate, requirements, jobSkills, candidateSkills, smartResumeData);
    const { aiScore, aiSummary, cosineSimilarity } = await this.computeAiLayer(
      candidate, job, requirements, candidateId, jobId, smartResumeData,
    );

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
      data_source: smartResumeData ? 'smart_resume' : 'resume_metadata',
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
    await this.publishMatchGenerated(match, candidateId, jobId, matchTier, ruleResult, skillsResult);
  }

  private computeRuleScore(
    candidate: any, job: any,
    smartResume: SmartResumeMatchingData | null,
  ) {
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
      candidate_years_experience:
        smartResume?.profile?.total_years_experience
        ?? candidate.resume_metadata?.total_years_experience,
    };
    return computeRuleScore(ruleInput);
  }

  private computeSkillsScore(
    candidate: any, requirements: any[],
    jobSkills: any[], candidateSkills: any[],
    smartResume: SmartResumeMatchingData | null,
  ) {
    const smartSkills = smartResume?.skills;
    const candidateSkillsInput = smartSkills?.length
      ? smartSkills.map(s => ({
          name: s.name,
          category: s.category,
          proficiency: s.proficiency,
          years_used: s.years_used,
        }))
      : (candidate.resume_metadata?.skills || []);

    return computeSkillsScore({
      candidate_skills: candidateSkillsInput,
      job_requirements: requirements,
      structured_candidate_skills: candidateSkills,
      structured_job_skills: jobSkills,
    });
  }

  private async computeAiLayer(
    candidate: any, job: any, requirements: any[],
    candidateId: string, jobId: string,
    smartResume: SmartResumeMatchingData | null,
  ) {
    let aiScore: number | null = null;
    let aiSummary: string | undefined;
    let cosineSimilarity: number | undefined;

    const isPartner = await this.fetcher.isPartnerJob(job);
    if (!isPartner) return { aiScore, aiSummary, cosineSimilarity };

    const similarity = await this.fetcher.getCosineSimilarity(candidateId, jobId);
    cosineSimilarity = similarity ?? undefined;

    if (similarity !== null) {
      const aiSmartResume = smartResume ? buildAiSmartResume(smartResume) : undefined;
      const aiResult = await computeAiScore(
        { candidate, job, requirements, cosine_similarity: similarity, smart_resume: aiSmartResume },
        this.logger,
        this.aiClient,
      );
      aiScore = aiResult.score;
      aiSummary = aiResult.summary;
      cosineSimilarity = aiResult.cosine_similarity;
    }

    return { aiScore, aiSummary, cosineSimilarity };
  }

  private async publishMatchGenerated(
    match: any, candidateId: string, jobId: string,
    matchTier: string, ruleResult: any, skillsResult: any,
  ): Promise<void> {
    if (!this.eventPublisher) return;
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

function buildAiSmartResume(sr: SmartResumeMatchingData): AiScoringSmartResume {
  return {
    professional_summary: sr.profile.professional_summary,
    experiences: sr.experiences.map(e => ({
      title: e.title || '',
      company: e.company || '',
      achievements: e.achievements,
    })),
    projects: sr.projects.map(p => ({
      name: p.name || '',
      outcomes: p.outcomes,
      skills_used: p.skills_used,
    })),
    skills: sr.skills.map(s => ({
      name: s.name,
      proficiency: s.proficiency,
      years_used: s.years_used,
    })),
  };
}
