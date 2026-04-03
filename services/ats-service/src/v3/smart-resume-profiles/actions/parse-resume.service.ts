/**
 * Parse Resume Service
 *
 * Two modes:
 * - preview (default): Extract data via GPT, compare against existing entries, return diff
 * - commit: Apply selected entries from a previous preview
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../../v2/shared/events.js';
import type { IAiClient } from '@splits-network/shared-ai-client';

const MAX_TEXT_LENGTH = 30000;

/** Classification for each extracted entry relative to existing data */
type EntryStatus = 'new' | 'updated' | 'unchanged';

interface DiffEntry {
  status: EntryStatus;
  extracted: Record<string, any>;
  existing?: Record<string, any>;
  /** For 'updated' entries: which fields differ */
  changedFields?: string[];
}

interface SectionDiff {
  section: string;
  entries: DiffEntry[];
  counts: { new: number; updated: number; unchanged: number };
}

export interface PreviewResult {
  mode: 'preview';
  profile: { extracted: Record<string, any>; existing?: Record<string, any> };
  sections: SectionDiff[];
}

export interface CommitInput {
  candidate_id: string;
  document_id?: string;
  profile_updates?: Record<string, any>;
  /** Keyed by section name, each entry has status + data to commit */
  selections: {
    section: string;
    entries: Array<{
      status: 'new' | 'updated';
      data: Record<string, any>;
      existing_id?: string; // for updates
    }>;
  }[];
}

export class ParseResumeService {
  constructor(
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher,
    private aiClient?: IAiClient,
  ) {}

  /**
   * Preview mode: extract from document, diff against existing, return comparison.
   * No database writes.
   */
  async preview(input: { candidate_id: string; document_id: string }): Promise<PreviewResult> {
    if (!this.aiClient) throw new Error('AI client not configured');

    // 1. Fetch document text
    const extractedText = await this.getDocumentText(input.document_id);

    // 2. Call GPT for extraction
    const extracted = await this.callGpt(extractedText);

    // 3. Fetch existing data
    const existing = await this.getExistingData(input.candidate_id);

    // 4. Build diffs per section
    const sections: SectionDiff[] = [
      this.diffSection('experiences', extracted.experiences || [], existing.experiences, this.matchExperience),
      this.diffSection('projects', extracted.projects || [], existing.projects, this.matchProject),
      this.diffSection('tasks', extracted.tasks || [], existing.tasks, this.matchTask),
      this.diffSection('education', extracted.education || [], existing.education, this.matchEducation),
      this.diffSection('certifications', extracted.certifications || [], existing.certifications, this.matchCertification),
      this.diffSection('skills', extracted.skills || [], existing.skills, this.matchSkill),
      this.diffSection('publications', extracted.publications || [], existing.publications, this.matchPublication),
    ];

    return {
      mode: 'preview',
      profile: {
        extracted: {
          professional_summary: extracted.professional_summary,
          headline: extracted.headline,
          total_years_experience: extracted.total_years_experience,
          highest_degree: extracted.highest_degree,
        },
        existing: existing.profile ? {
          professional_summary: existing.profile.professional_summary,
          headline: existing.profile.headline,
          total_years_experience: existing.profile.total_years_experience,
          highest_degree: existing.profile.highest_degree,
        } : undefined,
      },
      sections,
    };
  }

  /**
   * Commit mode: apply user-selected entries from a preview.
   */
  async commit(input: CommitInput): Promise<any> {
    // Get or create profile
    let { data: profile } = await this.supabase
      .from('smart_resume_profiles')
      .select('id')
      .eq('candidate_id', input.candidate_id)
      .is('deleted_at', null)
      .maybeSingle();

    if (!profile) {
      const { data: created, error } = await this.supabase
        .from('smart_resume_profiles')
        .insert({ candidate_id: input.candidate_id, source_document_id: input.document_id })
        .select('id')
        .single();
      if (error) throw error;
      profile = created;
    }

    const profileId = profile!.id;

    // Update profile fields if provided
    if (input.profile_updates && Object.keys(input.profile_updates).length > 0) {
      await this.supabase
        .from('smart_resume_profiles')
        .update({
          ...input.profile_updates,
          source_document_id: input.document_id || undefined,
          last_ai_parse_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', profileId);
    }

    // Process each section's selections
    const tableMap: Record<string, string> = {
      experiences: 'smart_resume_experiences',
      projects: 'smart_resume_projects',
      tasks: 'smart_resume_tasks',
      education: 'smart_resume_education',
      certifications: 'smart_resume_certifications',
      skills: 'smart_resume_skills',
      publications: 'smart_resume_publications',
    };

    for (const selection of input.selections) {
      const table = tableMap[selection.section];
      if (!table) continue;

      for (const entry of selection.entries) {
        if (entry.status === 'new') {
          // Insert new entry — strip GPT artifacts
          const { experience_index, ...cleanData } = entry.data as any;
          const row = { ...cleanData, profile_id: profileId };
          await this.supabase.from(table).insert(row);
        } else if (entry.status === 'updated' && entry.existing_id) {
          // Update existing entry — strip non-updatable fields
          const { id, profile_id, created_at, deleted_at, experience_index, ...rest } = entry.data as any;
          const updates = { ...rest, updated_at: new Date().toISOString() };
          await this.supabase.from(table).update(updates).eq('id', entry.existing_id);
        }
      }
    }

    // Publish event
    await this.eventPublisher?.publish('smart_resume.updated', {
      profileId,
      candidateId: input.candidate_id,
      source: 'import-commit',
    }, 'ats-service');

    // Return updated full profile
    return this.getFullProfile(profileId);
  }

  // ── Diff Logic ──────────────────────────────────────────────────

  private diffSection(
    section: string,
    extractedEntries: any[],
    existingEntries: any[],
    matchFn: (extracted: any, existing: any) => boolean,
  ): SectionDiff {
    const entries: DiffEntry[] = [];
    const matchedExistingIds = new Set<string>();

    for (const ext of extractedEntries) {
      const match = existingEntries.find(
        ex => !matchedExistingIds.has(ex.id) && matchFn(ext, ex)
      );

      if (match) {
        matchedExistingIds.add(match.id);
        const changedFields = this.getChangedFields(ext, match, section);

        if (changedFields.length > 0) {
          entries.push({ status: 'updated', extracted: ext, existing: match, changedFields });
        } else {
          entries.push({ status: 'unchanged', extracted: ext, existing: match });
        }
      } else {
        entries.push({ status: 'new', extracted: ext });
      }
    }

    const counts = {
      new: entries.filter(e => e.status === 'new').length,
      updated: entries.filter(e => e.status === 'updated').length,
      unchanged: entries.filter(e => e.status === 'unchanged').length,
    };

    return { section, entries, counts };
  }

  private getChangedFields(extracted: any, existing: any, section: string): string[] {
    const fieldsToCompare: Record<string, string[]> = {
      experiences: ['company', 'title', 'location', 'start_date', 'end_date', 'is_current', 'description'],
      projects: ['name', 'description', 'outcomes'],
      tasks: ['description', 'impact'],
      education: ['institution', 'degree', 'field_of_study', 'start_date', 'end_date', 'gpa', 'honors'],
      certifications: ['name', 'issuer', 'date_obtained', 'expiry_date', 'credential_url'],
      skills: ['name', 'category', 'proficiency', 'years_used'],
      publications: ['title', 'publication_type', 'publisher', 'published_date', 'description'],
    };

    const fields = fieldsToCompare[section] || [];
    return fields.filter(field => {
      const extVal = extracted[field] ?? null;
      const exVal = existing[field] ?? null;
      return String(extVal) !== String(exVal);
    });
  }

  // ── Match Functions ─────────────────────────────────────────────
  // Each returns true if the extracted entry likely refers to the same thing as the existing entry

  private matchExperience(ext: any, ex: any): boolean {
    return norm(ext.company) === norm(ex.company) && norm(ext.title) === norm(ex.title);
  }

  private matchProject(ext: any, ex: any): boolean {
    return norm(ext.name) === norm(ex.name);
  }

  private matchTask(ext: any, ex: any): boolean {
    // Tasks are hard to match — use fuzzy description start
    return norm(ext.description).substring(0, 50) === norm(ex.description).substring(0, 50);
  }

  private matchEducation(ext: any, ex: any): boolean {
    return norm(ext.institution) === norm(ex.institution) && norm(ext.degree) === norm(ex.degree);
  }

  private matchCertification(ext: any, ex: any): boolean {
    return norm(ext.name) === norm(ex.name);
  }

  private matchSkill(ext: any, ex: any): boolean {
    return norm(ext.name) === norm(ex.name);
  }

  private matchPublication(ext: any, ex: any): boolean {
    return norm(ext.title) === norm(ex.title);
  }

  // ── Helpers ─────────────────────────────────────────────────────

  private async getDocumentText(documentId: string): Promise<string> {
    const { data: doc, error } = await this.supabase
      .from('documents')
      .select('id, metadata, structured_metadata')
      .eq('id', documentId)
      .single();

    if (error || !doc) throw new Error(`Document not found: ${documentId}`);

    const text = doc.structured_metadata?.extracted_text || doc.metadata?.extracted_text || '';
    if (!text) throw new Error('Document has no extracted text. Ensure it has been processed first.');
    return text;
  }

  private async getExistingData(candidateId: string): Promise<any> {
    const { data: profile } = await this.supabase
      .from('smart_resume_profiles')
      .select('*')
      .eq('candidate_id', candidateId)
      .is('deleted_at', null)
      .maybeSingle();

    if (!profile) {
      return { profile: null, experiences: [], projects: [], tasks: [], education: [], certifications: [], skills: [], publications: [] };
    }

    const pid = profile.id;
    const q = (table: string) => this.supabase.from(table).select('*').eq('profile_id', pid).is('deleted_at', null).order('sort_order');

    const [experiences, projects, tasks, education, certifications, skills, publications] = await Promise.all([
      q('smart_resume_experiences'), q('smart_resume_projects'), q('smart_resume_tasks'),
      q('smart_resume_education'), q('smart_resume_certifications'), q('smart_resume_skills'),
      q('smart_resume_publications'),
    ]);

    return {
      profile,
      experiences: experiences.data || [],
      projects: projects.data || [],
      tasks: tasks.data || [],
      education: education.data || [],
      certifications: certifications.data || [],
      skills: skills.data || [],
      publications: publications.data || [],
    };
  }

  private async getFullProfile(profileId: string): Promise<any> {
    const [profileData, experiences, projects, tasks, education, certifications, skills, publications] = await Promise.all([
      this.supabase.from('smart_resume_profiles').select('*').eq('id', profileId).single(),
      this.supabase.from('smart_resume_experiences').select('*').eq('profile_id', profileId).is('deleted_at', null).order('sort_order'),
      this.supabase.from('smart_resume_projects').select('*').eq('profile_id', profileId).is('deleted_at', null).order('sort_order'),
      this.supabase.from('smart_resume_tasks').select('*').eq('profile_id', profileId).is('deleted_at', null).order('sort_order'),
      this.supabase.from('smart_resume_education').select('*').eq('profile_id', profileId).is('deleted_at', null).order('sort_order'),
      this.supabase.from('smart_resume_certifications').select('*').eq('profile_id', profileId).is('deleted_at', null).order('sort_order'),
      this.supabase.from('smart_resume_skills').select('*').eq('profile_id', profileId).is('deleted_at', null).order('sort_order'),
      this.supabase.from('smart_resume_publications').select('*').eq('profile_id', profileId).is('deleted_at', null).order('sort_order'),
    ]);

    return {
      profile: profileData.data,
      experiences: experiences.data || [],
      projects: projects.data || [],
      tasks: tasks.data || [],
      education: education.data || [],
      certifications: certifications.data || [],
      skills: skills.data || [],
      publications: publications.data || [],
    };
  }

  // ── GPT ─────────────────────────────────────────────────────────

  private async callGpt(text: string): Promise<any> {
    const truncated = text.substring(0, MAX_TEXT_LENGTH);

    const messages = [
      {
        role: 'system' as const,
        content: 'You are an expert resume parser. Extract structured professional data from resume text. Return valid JSON only. Never include personal contact information (name, email, phone, address) in the output.',
      },
      { role: 'user' as const, content: this.buildPrompt(truncated) },
    ];

    const result = await this.aiClient!.chatCompletion('resume_parsing', messages, { jsonMode: true });
    return JSON.parse(result.content);
  }

  private buildPrompt(text: string): string {
    return `Extract structured professional data from the following resume text.

IMPORTANT: Do NOT include any personal contact information (name, email, phone number, mailing address) in the output. Only extract professional/career data.

Resume text:
---
${text}
---

Return a JSON object with this exact structure:

{
  "professional_summary": "<2-3 sentence professional summary>",
  "headline": "<short headline, e.g. 'Senior Software Engineer | Cloud Architecture | Team Lead'>",
  "total_years_experience": <number>,
  "highest_degree": "<doctorate|masters|bachelors|associates|none>",
  "experiences": [
    {
      "company": "<company name>",
      "title": "<job title>",
      "location": "<city, state/country or Remote>",
      "start_date": "<YYYY-MM>",
      "end_date": "<YYYY-MM or null if current>",
      "is_current": <boolean>,
      "description": "<full role description — preserve all detail from the resume, do NOT summarize>",
      "achievements": ["<every bullet point, responsibility, and accomplishment listed for this role — include ALL of them, do not truncate or summarize>"]
    }
  ],
  "projects": [
    {
      "name": "<project name>",
      "description": "<what the project was>",
      "outcomes": "<measurable results or impact>",
      "skills_used": ["<skill1>", "<skill2>"],
      "experience_index": <index into experiences array, or null if standalone>
    }
  ],
  "tasks": [
    {
      "description": "<specific responsibility or task>",
      "impact": "<measurable impact or result>",
      "skills_used": ["<skill1>", "<skill2>"],
      "experience_index": <index into experiences array, or null>
    }
  ],
  "education": [
    {
      "institution": "<school/university>",
      "degree": "<degree type>",
      "field_of_study": "<major/field>",
      "start_date": "<YYYY-MM or null>",
      "end_date": "<YYYY-MM or null>",
      "gpa": "<GPA or null>",
      "honors": "<honors or null>"
    }
  ],
  "certifications": [
    {
      "name": "<certification name>",
      "issuer": "<issuing organization>",
      "date_obtained": "<YYYY-MM or null>",
      "expiry_date": "<YYYY-MM or null>",
      "credential_url": "<URL or null>"
    }
  ],
  "skills": [
    {
      "name": "<skill name>",
      "category": "<programming_language|framework|database|devops|cloud|design|soft_skill|domain_knowledge|tool|other>",
      "proficiency": "<expert|advanced|intermediate|beginner>",
      "years_used": <number or null>
    }
  ],
  "publications": [
    {
      "title": "<title>",
      "publication_type": "<paper|article|talk|patent|book|other>",
      "publisher": "<publisher or venue>",
      "published_date": "<YYYY-MM or null>",
      "description": "<brief description>"
    }
  ]
}

CRITICAL GUIDELINES:
- PRESERVE ALL DETAIL. Do NOT summarize, condense, or paraphrase. The goal is a COMPREHENSIVE career profile, not a summary.
- Every bullet point in the resume should appear as either an achievement on the experience OR as a separate task entry. Do not drop any.
- The description field should capture the full role description, not a one-line summary.
- The achievements array should contain EVERY bullet point listed under that role, verbatim or near-verbatim. If there are 15 bullets, return 15 achievements.
- Order experience entries from most recent to oldest
- Extract specific projects mentioned within job descriptions as separate project entries with their own skills_used
- Extract key responsibilities as task entries — each bullet point that describes a responsibility or accomplishment should be a task
- For dates, use YYYY-MM format. If only a year is known, use YYYY-01
- Set is_current=true and end_date=null for current positions
- Infer skill proficiency from context (years used, role seniority, emphasis)
- Only mark "expert" if clearly demonstrated through years of use or senior roles
- If publications/patents/talks are mentioned, extract them
- If a section has no data, return an empty array`;
  }

  validateProficiency(value: string | undefined): string | null {
    const valid = ['expert', 'advanced', 'intermediate', 'beginner'];
    return value && valid.includes(value) ? value : null;
  }

  validatePublicationType(value: string | undefined): string | null {
    const valid = ['paper', 'article', 'talk', 'patent', 'book', 'other'];
    return value && valid.includes(value) ? value : null;
  }
}

/** Normalize a string for comparison (lowercase, trimmed) */
function norm(s: any): string {
  return String(s || '').toLowerCase().trim();
}
