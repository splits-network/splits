/**
 * Analytics Views V3 Repository
 *
 * Server-side aggregation queries that replace client-side grouping.
 * Each method returns pre-computed summaries — no raw entity lists.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { RecruiterScoreRow, RoleBreakdownRow, PendingReviewRow } from './types.js';

const INTERVIEW_STAGES = ['interview', 'screen'];
const HIRE_STAGES = ['hired'];
const OFFER_STAGES = ['offer'];
const REVIEWABLE_STAGES = ['screen', 'submitted', 'interview', 'offer'];

export class ViewRepository {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Recruiter scorecard: aggregate applications by candidate_recruiter_id.
   * Counts submissions, interviews, placements, conversion rate, avg days to place.
   */
  async getRecruiterScorecard(
    companyId?: string,
    recruiterId?: string,
    limit: number = 20,
  ): Promise<RecruiterScoreRow[]> {
    // Build the base query — fetch applications with recruiter info
    let query = this.supabase
      .from('applications')
      .select('id, stage, candidate_recruiter_id, created_at, updated_at, job_id');

    if (companyId) {
      // Scope to company's jobs
      const { data: jobs } = await this.supabase
        .from('jobs')
        .select('id')
        .eq('company_id', companyId);
      const jobIds = jobs?.map((j) => j.id) || [];
      if (jobIds.length === 0) return [];
      query = query.in('job_id', jobIds);
    }

    if (recruiterId) {
      query = query.eq('candidate_recruiter_id', recruiterId);
    }

    const { data: applications, error } = await query;
    if (error) throw new Error(`Failed to fetch applications: ${error.message}`);
    if (!applications || applications.length === 0) return [];

    // Get recruiter names from recruiter-companies or recruiters table
    const recruiterIds = [
      ...new Set(
        applications
          .map((a) => a.candidate_recruiter_id)
          .filter(Boolean) as string[],
      ),
    ];

    const { data: recruiters } = await this.supabase
      .from('recruiters')
      .select('id, user:users!recruiters_user_id_fkey(name, email)')
      .in('id', recruiterIds);

    const nameMap: Record<string, string> = {};
    for (const r of recruiters || []) {
      const user = r.user as any;
      nameMap[r.id] = user?.name || user?.email || `Recruiter ${r.id.substring(0, 8)}`;
    }

    // Group by candidate_recruiter_id
    const grouped: Record<
      string,
      { submissions: number; interviews: number; placements: number; totalDays: number; placementCount: number }
    > = {};

    for (const app of applications) {
      const rid = app.candidate_recruiter_id;
      if (!rid) continue;
      if (!grouped[rid]) {
        grouped[rid] = { submissions: 0, interviews: 0, placements: 0, totalDays: 0, placementCount: 0 };
      }
      grouped[rid].submissions++;
      const stage = (app.stage || '').toLowerCase();
      if (INTERVIEW_STAGES.includes(stage)) grouped[rid].interviews++;
      if (HIRE_STAGES.includes(stage)) {
        grouped[rid].placements++;
        if (app.created_at && app.updated_at) {
          const days = Math.floor(
            (new Date(app.updated_at).getTime() - new Date(app.created_at).getTime()) / (1000 * 60 * 60 * 24),
          );
          if (days > 0) {
            grouped[rid].totalDays += days;
            grouped[rid].placementCount++;
          }
        }
      }
    }

    const rows: RecruiterScoreRow[] = Object.entries(grouped).map(([id, counts]) => ({
      id,
      name: nameMap[id] || `Recruiter ${id.substring(0, 8)}`,
      submissions: counts.submissions,
      interviews: counts.interviews,
      placements: counts.placements,
      conversion_rate:
        counts.submissions > 0 ? Math.round((counts.placements / counts.submissions) * 100) : 0,
      avg_days_to_place:
        counts.placementCount > 0 ? Math.round(counts.totalDays / counts.placementCount) : 0,
    }));

    rows.sort((a, b) => b.placements - a.placements || b.submissions - a.submissions);
    return rows.slice(0, limit);
  }

  /**
   * Role breakdown: per-job stage counts for active jobs.
   * Returns job metadata + application counts by stage.
   */
  async getRoleBreakdown(
    companyId?: string,
    recruiterId?: string,
    limit: number = 20,
  ): Promise<RoleBreakdownRow[]> {
    let jobQuery = this.supabase
      .from('jobs')
      .select('id, title, location, status, created_at')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (companyId) {
      jobQuery = jobQuery.eq('company_id', companyId);
    }

    const { data: jobs, error: jobError } = await jobQuery;
    if (jobError) throw new Error(`Failed to fetch jobs: ${jobError.message}`);
    if (!jobs || jobs.length === 0) return [];

    const jobIds = jobs.map((j) => j.id);

    // Fetch all applications for these jobs
    let appQuery = this.supabase
      .from('applications')
      .select('id, job_id, stage')
      .in('job_id', jobIds);

    if (recruiterId) {
      appQuery = appQuery.eq('candidate_recruiter_id', recruiterId);
    }

    const { data: applications } = await appQuery;

    // Group by job_id
    const jobCounts: Record<string, { total: number; interview: number; offer: number; hire: number }> = {};
    for (const app of applications || []) {
      const jid = app.job_id;
      if (!jid) continue;
      if (!jobCounts[jid]) jobCounts[jid] = { total: 0, interview: 0, offer: 0, hire: 0 };
      jobCounts[jid].total++;
      const stage = (app.stage || '').toLowerCase();
      if (INTERVIEW_STAGES.includes(stage)) jobCounts[jid].interview++;
      if (OFFER_STAGES.includes(stage)) jobCounts[jid].offer++;
      if (HIRE_STAGES.includes(stage)) jobCounts[jid].hire++;
    }

    const now = Date.now();
    return jobs.map((job) => {
      const counts = jobCounts[job.id] || { total: 0, interview: 0, offer: 0, hire: 0 };
      return {
        id: job.id,
        title: job.title,
        location: job.location || 'Remote',
        status: job.status,
        applications_count: counts.total,
        interview_count: counts.interview,
        offer_count: counts.offer,
        hire_count: counts.hire,
        days_open: Math.floor((now - new Date(job.created_at).getTime()) / (1000 * 60 * 60 * 24)),
      };
    });
  }

  /**
   * Pending reviews: applications in reviewable stages, sorted by staleness.
   * No client-side limit — returns all matching records up to limit.
   */
  async getPendingReviews(
    companyId?: string,
    recruiterId?: string,
    limit: number = 50,
  ): Promise<PendingReviewRow[]> {
    let query = this.supabase
      .from('applications')
      .select('id, stage, updated_at, created_at, candidate_name, job_title')
      .in('stage', REVIEWABLE_STAGES)
      .order('updated_at', { ascending: true })
      .limit(limit);

    if (companyId) {
      const { data: jobs } = await this.supabase
        .from('jobs')
        .select('id')
        .eq('company_id', companyId);
      const jobIds = jobs?.map((j) => j.id) || [];
      if (jobIds.length === 0) return [];
      query = query.in('job_id', jobIds);
    }

    if (recruiterId) {
      query = query.eq('candidate_recruiter_id', recruiterId);
    }

    const { data: applications, error } = await query;
    if (error) throw new Error(`Failed to fetch pending reviews: ${error.message}`);
    if (!applications) return [];

    const now = Date.now();
    return applications.map((app) => {
      const updatedAt = app.updated_at || app.created_at;
      return {
        id: app.id,
        candidate_name: app.candidate_name || 'Unknown Candidate',
        job_title: app.job_title || 'Unknown Role',
        stage: (app.stage || 'submitted').toLowerCase(),
        days_since_update: Math.floor((now - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24)),
      };
    });
  }
}
