/**
 * Smart Resume Populator
 *
 * Takes AI-extracted resume data and writes it to the smart_resume_* tables.
 * Also updates the candidate profile with contact info and current role.
 * Publishes smart_resume.updated event when done.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { Logger } from '@splits-network/shared-logging';
import { IEventPublisher } from '../../v2/shared/events.js';
import type { SmartResumeExtraction } from './extractor.js';

export class SmartResumePopulator {
  constructor(
    private supabase: SupabaseClient,
    private logger: Logger,
    private eventPublisher?: IEventPublisher,
  ) {}

  async populate(
    candidateId: string,
    documentId: string,
    extraction: SmartResumeExtraction,
  ): Promise<string> {
    const sb = this.supabase as any;

    // Get or create profile
    let { data: profile } = await sb
      .from('smart_resume_profiles')
      .select('id')
      .eq('candidate_id', candidateId)
      .is('deleted_at', null)
      .maybeSingle();

    if (!profile) {
      const { data: created, error } = await sb
        .from('smart_resume_profiles')
        .insert({
          candidate_id: candidateId,
          professional_summary: extraction.professional_summary,
          headline: extraction.headline,
          source_document_id: documentId,
        })
        .select('id')
        .single();
      if (error) throw error;
      profile = created;
    } else {
      await sb
        .from('smart_resume_profiles')
        .update({
          professional_summary: extraction.professional_summary || undefined,
          headline: extraction.headline || undefined,
          source_document_id: documentId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);
    }

    const profileId = profile!.id;

    // Clear existing entries before writing new ones (soft delete)
    const childTables = [
      'smart_resume_experiences', 'smart_resume_projects', 'smart_resume_tasks',
      'smart_resume_education', 'smart_resume_certifications',
      'smart_resume_skills', 'smart_resume_publications',
    ];
    for (const table of childTables) {
      await sb.from(table)
        .update({ deleted_at: new Date().toISOString() })
        .eq('profile_id', profileId)
        .is('deleted_at', null);
    }

    // Write experiences
    if (extraction.experiences.length > 0) {
      const rows = extraction.experiences.map((exp, i) => ({
        profile_id: profileId,
        company: exp.company,
        title: exp.title,
        location: exp.location,
        start_date: exp.start_date,
        end_date: exp.end_date,
        is_current: exp.is_current,
        description: exp.description,
        achievements: exp.achievements,
        sort_order: i,
      }));
      const { error } = await sb.from('smart_resume_experiences').insert(rows);
      if (error) this.logger.warn({ err: error, count: rows.length }, 'Failed to insert experiences');
    }

    // Write education
    if (extraction.education.length > 0) {
      const rows = extraction.education.map((edu, i) => ({
        profile_id: profileId,
        institution: edu.institution,
        degree: edu.degree,
        field_of_study: edu.field_of_study,
        start_date: edu.start_date,
        end_date: edu.end_date,
        gpa: edu.gpa,
        honors: edu.honors,
        sort_order: i,
      }));
      const { error } = await sb.from('smart_resume_education').insert(rows);
      if (error) this.logger.warn({ err: error, count: rows.length }, 'Failed to insert education');
    }

    // Write skills (deduplicate by name to avoid unique constraint violation)
    if (extraction.skills.length > 0) {
      const seen = new Set<string>();
      const deduped = extraction.skills.filter(skill => {
        const key = skill.name.toLowerCase().trim();
        if (seen.has(key) || !key) return false;
        seen.add(key);
        return true;
      });
      const rows = deduped.map((skill, i) => ({
        profile_id: profileId,
        name: skill.name,
        category: skill.category,
        sort_order: i,
      }));
      const { error } = await sb.from('smart_resume_skills').insert(rows);
      if (error) this.logger.warn({ err: error, count: rows.length }, 'Failed to insert skills');
    }

    // Write certifications
    if (extraction.certifications.length > 0) {
      const rows = extraction.certifications.map((cert, i) => ({
        profile_id: profileId,
        name: cert.name,
        issuer: cert.issuer,
        date_obtained: cert.date_obtained,
        sort_order: i,
      }));
      const { error } = await sb.from('smart_resume_certifications').insert(rows);
      if (error) this.logger.warn({ err: error, count: rows.length }, 'Failed to insert certifications');
    }

    // Write projects
    if (extraction.projects.length > 0) {
      const rows = extraction.projects.map((proj, i) => ({
        profile_id: profileId,
        name: proj.name,
        description: proj.description,
        skills_used: proj.skills_used,
        sort_order: i,
      }));
      const { error } = await sb.from('smart_resume_projects').insert(rows);
      if (error) this.logger.warn({ err: error, count: rows.length }, 'Failed to insert projects');
    }

    // Write publications
    if (extraction.publications.length > 0) {
      const rows = extraction.publications.map((pub, i) => ({
        profile_id: profileId,
        title: pub.title,
        description: pub.description,
        sort_order: i,
      }));
      const { error } = await sb.from('smart_resume_publications').insert(rows);
      if (error) this.logger.warn({ err: error, count: rows.length }, 'Failed to insert publications');
    }

    // Update candidate profile with contact info and current role
    await this.updateCandidateProfile(candidateId, extraction);

    // Publish event for matching service
    if (this.eventPublisher) {
      try {
        await this.eventPublisher.publish('smart_resume.updated', {
          profileId,
          candidateId,
          source: 'document-extraction',
        }, 'ai-service');
      } catch {
        // Non-fatal
      }
    }

    return profileId;
  }

  private async updateCandidateProfile(
    candidateId: string,
    extraction: SmartResumeExtraction,
  ): Promise<void> {
    try {
      const updates: Record<string, any> = {};

      if (extraction.contact) {
        if (extraction.contact.phone) updates.phone = extraction.contact.phone;
        if (extraction.contact.location) updates.location = extraction.contact.location;
        if (extraction.contact.linkedin_url) updates.linkedin_url = extraction.contact.linkedin_url;
        if (extraction.contact.github_url) updates.github_url = extraction.contact.github_url;
        if (extraction.contact.portfolio_url) updates.portfolio_url = extraction.contact.portfolio_url;
      }

      const currentRole = extraction.experiences.find(e => e.is_current) || extraction.experiences[0];
      if (currentRole) {
        updates.current_title = currentRole.title;
        updates.current_company = currentRole.company;
      }

      if (Object.keys(updates).length > 0) {
        const { error } = await this.supabase
          .from('candidates')
          .update(updates)
          .eq('id', candidateId);
        if (error) {
          this.logger.warn({ err: error }, 'Failed to update candidate profile from resume');
        } else {
          this.logger.info({ candidateId, fields: Object.keys(updates) }, 'Candidate profile updated from resume');
        }
      }
    } catch (err) {
      this.logger.warn({ err }, 'Failed to update candidate profile (non-fatal)');
    }
  }
}
