/**
 * Smart Resume Data Fetcher
 *
 * Direct DB queries against smart_resume_* tables.
 * Returns only entries with visible_to_matching = true.
 * Returns null when no smart resume profile exists (triggers fallback).
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { Logger } from '@splits-network/shared-logging';
import type { SmartResumeMatchingData } from './smart-resume-types.js';

export class SmartResumeFetcher {
  private cache = new Map<string, SmartResumeMatchingData | null>();

  constructor(
    private supabase: SupabaseClient,
    private logger: Logger,
  ) {}

  clearCache(): void {
    this.cache.clear();
  }

  async fetch(candidateId: string): Promise<SmartResumeMatchingData | null> {
    if (this.cache.has(candidateId)) {
      return this.cache.get(candidateId)!;
    }

    const result = await this.fetchFromDb(candidateId);
    this.cache.set(candidateId, result);
    return result;
  }

  private async fetchFromDb(candidateId: string): Promise<SmartResumeMatchingData | null> {
    const { data: profile, error } = await this.supabase
      .from('smart_resume_profiles')
      .select('*')
      .eq('candidate_id', candidateId)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) {
      this.logger.warn({ candidateId, error }, 'Failed to fetch smart resume profile');
      return null;
    }

    if (!profile) return null;

    const visible = (q: any) =>
      q.eq('visible_to_matching', true).is('deleted_at', null).order('sort_order');

    const [experiences, projects, tasks, skills, education, certifications, publications] =
      await Promise.all([
        visible(this.supabase.from('smart_resume_experiences').select('*').eq('profile_id', profile.id)),
        visible(this.supabase.from('smart_resume_projects').select('*').eq('profile_id', profile.id)),
        visible(this.supabase.from('smart_resume_tasks').select('*').eq('profile_id', profile.id)),
        visible(this.supabase.from('smart_resume_skills').select('*').eq('profile_id', profile.id)),
        visible(this.supabase.from('smart_resume_education').select('*').eq('profile_id', profile.id)),
        visible(this.supabase.from('smart_resume_certifications').select('*').eq('profile_id', profile.id)),
        visible(this.supabase.from('smart_resume_publications').select('*').eq('profile_id', profile.id)),
      ]);

    this.logger.debug({ candidateId, profileId: profile.id }, 'Fetched smart resume matching data');

    return {
      profile,
      experiences: experiences.data || [],
      skills: skills.data || [],
      education: education.data || [],
      certifications: certifications.data || [],
      projects: projects.data || [],
      tasks: tasks.data || [],
      publications: publications.data || [],
    };
  }
}
