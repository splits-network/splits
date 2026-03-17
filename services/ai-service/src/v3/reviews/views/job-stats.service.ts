/**
 * Job Stats View Service
 * Aggregates AI review statistics for a given job.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { JobStatsRepository } from './job-stats.repository';

export class JobStatsService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: JobStatsRepository,
    supabase: SupabaseClient,
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getStats(jobId: string, clerkUserId: string) {
    await this.accessResolver.resolve(clerkUserId);

    const reviews = await this.repository.findReviewsByJobId(jobId);

    if (reviews.length === 0) {
      return {
        total_reviews: 0,
        average_fit_score: 0,
        recommendation_breakdown: {
          strong_fit: 0,
          good_fit: 0,
          fair_fit: 0,
          poor_fit: 0,
        },
        most_matched_skills: [],
        most_missing_skills: [],
      };
    }

    const avgFitScore = reviews.reduce((sum, r) => sum + r.fit_score, 0) / reviews.length;

    const recommendationBreakdown = reviews.reduce(
      (acc, r) => {
        acc[r.recommendation] = (acc[r.recommendation] || 0) + 1;
        return acc;
      },
      { strong_fit: 0, good_fit: 0, fair_fit: 0, poor_fit: 0 } as Record<string, number>,
    );

    const matchedSkillCounts: Record<string, number> = {};
    const missingSkillCounts: Record<string, number> = {};

    for (const r of reviews) {
      for (const skill of r.matched_skills ?? []) {
        matchedSkillCounts[skill] = (matchedSkillCounts[skill] || 0) + 1;
      }
      for (const skill of r.missing_skills ?? []) {
        missingSkillCounts[skill] = (missingSkillCounts[skill] || 0) + 1;
      }
    }

    const mostMatchedSkills = Object.entries(matchedSkillCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([skill]) => skill);

    const mostMissingSkills = Object.entries(missingSkillCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([skill]) => skill);

    return {
      total_reviews: reviews.length,
      average_fit_score: Math.round(avgFitScore),
      recommendation_breakdown: recommendationBreakdown,
      most_matched_skills: mostMatchedSkills,
      most_missing_skills: mostMissingSkills,
    };
  }
}
