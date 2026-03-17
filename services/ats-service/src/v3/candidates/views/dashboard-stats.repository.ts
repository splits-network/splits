/**
 * Candidate Dashboard Stats View Repository
 *
 * Aggregates application, interview, offer, and relationship counts
 * for a single candidate's dashboard.
 */

import { SupabaseClient } from '@supabase/supabase-js';

export class CandidateDashboardStatsRepository {
  constructor(private supabase: SupabaseClient) {}

  async getDashboardStats(candidateId: string) {
    const interviewStages = ['phone_screen', 'technical_interview', 'onsite_interview', 'final_interview'];
    const offerStages = ['offer_extended'];

    const [apps, interviews, offers, relationships] = await Promise.all([
      this.supabase.from('applications').select('id', { count: 'exact', head: true }).eq('candidate_id', candidateId),
      this.supabase.from('applications').select('id', { count: 'exact', head: true }).eq('candidate_id', candidateId).in('stage', interviewStages),
      this.supabase.from('applications').select('id', { count: 'exact', head: true }).eq('candidate_id', candidateId).in('stage', offerStages),
      this.supabase.from('recruiter_candidates').select('id', { count: 'exact', head: true }).eq('candidate_id', candidateId).eq('status', 'active'),
    ]);

    if (apps.error) throw apps.error;
    if (interviews.error) throw interviews.error;
    if (offers.error) throw offers.error;
    if (relationships.error) throw relationships.error;

    return {
      applications: apps.count || 0,
      interviews: interviews.count || 0,
      offers: offers.count || 0,
      active_relationships: relationships.count || 0,
    };
  }
}
