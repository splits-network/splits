/**
 * Smart Resume Extractor
 *
 * AI-powered resume text structuring. Takes raw extracted text and maps it
 * to structured smart_resume data.
 *
 * Pipeline:
 * 1. Send full resume text as context in every call
 * 2. Make focused extraction calls per section, all with full resume context
 * 3. Parallel execution for speed
 * 4. Strict "no data loss" instructions — transcribe, don't summarize
 *
 * Uses GPT-4o-mini for cost efficiency.
 */

import { createLogger } from '@splits-network/shared-logging';
import type { IAiClient } from '@splits-network/shared-ai-client';

const logger = createLogger('smart-resume-extractor');

const SYSTEM_PROMPT = `You are a resume data extractor. You will receive a complete resume and be asked to extract specific sections from it.

CRITICAL RULES:
- NEVER summarize, paraphrase, shorten, or omit any content. Your job is to TRANSCRIBE and STRUCTURE, not to edit.
- Every bullet point, achievement, and detail must appear in your output exactly as written in the resume.
- If a bullet point is 3 sentences long, your output must include all 3 sentences.
- Return valid JSON only.`;

// ── Output types ────────────────────────────────────────────────

export interface ExtractedExperience {
  company: string;
  title: string;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
  achievements: string[];
}

export interface ExtractedEducation {
  institution: string;
  degree: string | null;
  field_of_study: string | null;
  start_date: string | null;
  end_date: string | null;
  gpa: string | null;
  honors: string | null;
}

export interface ExtractedSkill {
  name: string;
  category: string | null;
}

export interface ExtractedCertification {
  name: string;
  issuer: string | null;
  date_obtained: string | null;
}

export interface SmartResumeExtraction {
  professional_summary: string | null;
  headline: string | null;
  experiences: ExtractedExperience[];
  education: ExtractedEducation[];
  skills: ExtractedSkill[];
  certifications: ExtractedCertification[];
  projects: Array<{ name: string; description: string | null; skills_used: string[] }>;
  publications: Array<{ title: string; description: string | null }>;
}

// ── Main class ──────────────────────────────────────────────────

export class SmartResumeExtractor {

  constructor(private aiClient?: IAiClient) {}

  async extract(textOrBuffer: Buffer | string, _mimeType: string): Promise<SmartResumeExtraction> {
    if (!this.aiClient) {
      throw new Error('AI client not configured');
    }

    const startTime = Date.now();

    const resumeText = typeof textOrBuffer === 'string'
      ? textOrBuffer
      : textOrBuffer.toString('utf-8');

    if (!resumeText || resumeText.trim().length < 50) {
      throw new Error('Insufficient text for resume extraction');
    }

    // All calls get the full resume context and run in parallel
    const [
      profileResult,
      experienceResult,
      educationResult,
      skillsResult,
      otherResult,
    ] = await Promise.all([
      this.extractProfile(resumeText),
      this.extractExperiences(resumeText),
      this.extractEducation(resumeText),
      this.extractSkills(resumeText),
      this.extractOther(resumeText),
    ]);

    const elapsed = Date.now() - startTime;
    logger.info({
      elapsed,
      experiences: experienceResult.length,
      education: educationResult.length,
      skills: skillsResult.length,
      certifications: otherResult.certifications.length,
      projects: otherResult.projects.length,
    }, 'Smart resume AI extraction complete');

    return {
      professional_summary: profileResult.summary,
      headline: profileResult.headline,
      experiences: experienceResult,
      education: educationResult,
      skills: skillsResult,
      certifications: otherResult.certifications,
      projects: otherResult.projects,
      publications: otherResult.publications,
    };
  }

  // ── Profile ───────────────────────────────────────────────────

  private async extractProfile(resumeText: string): Promise<{ summary: string | null; headline: string | null }> {
    const response = await this.callAI(
      `Here is a complete resume. Extract the professional summary and generate a headline.

Return JSON:
{
  "summary": "<the full professional summary/objective/about me text exactly as written in the resume — do NOT rewrite or shorten>",
  "headline": "<a short professional headline based on the resume, e.g. 'Senior Software Engineer | Cloud Architecture | Team Lead'>"
}

If there are multiple summaries (e.g. current and previous), use the most recent one.

RESUME:
---
${resumeText}
---`,
      1000
    );

    try {
      return JSON.parse(response);
    } catch {
      return { summary: null, headline: null };
    }
  }

  // ── Experiences ───────────────────────────────────────────────

  private async extractExperiences(resumeText: string): Promise<ExtractedExperience[]> {
    const response = await this.callAI(
      `Here is a complete resume. Extract ALL work experience entries.

Return a JSON object: { "entries": [...] }

Each entry in the array:
{
  "company": "<company name>",
  "title": "<job title — use the most senior title if multiple titles are listed for the same company>",
  "location": "<city, state/country or null>",
  "start_date": "<YYYY-MM format>",
  "end_date": "<YYYY-MM format or null if current>",
  "is_current": <boolean>,
  "description": "<role description paragraph if one exists separate from bullet points, otherwise null>",
  "achievements": ["<bullet 1 exactly as written>", "<bullet 2 exactly as written>", ...]
}

CRITICAL RULES:
- EVERY bullet point or line item under a role MUST appear in the achievements array. If a role has 15 bullets, return 15 achievements. If it has 25, return 25.
- Preserve the COMPLETE text of each bullet. Do not truncate, summarize, or merge bullets.
- If a role has sub-sections (like "Key Accomplishments — Leadership" and "Key Accomplishments — Technical"), combine ALL bullet points into one achievements array.
- If multiple titles are listed for the same company (progressive promotions), create ONE entry with the most recent/senior title and ALL bullet points combined.
- "Technologies:" lines are NOT achievements — skip them.
- Dates: use YYYY-MM. "current"/"present" → is_current: true, end_date: null. If only year, use YYYY-01.
- Order from most recent to oldest.

RESUME:
---
${resumeText}
---`,
      16000
    );

    return this.parseArrayResponse(response, 'experiences');
  }

  // ── Education ─────────────────────────────────────────────────

  private async extractEducation(resumeText: string): Promise<ExtractedEducation[]> {
    const response = await this.callAI(
      `Here is a complete resume. Extract ALL education entries.

Return a JSON object: { "entries": [...] }

Each entry:
{
  "institution": "<school/university name>",
  "degree": "<degree type, e.g. Bachelor of Science>",
  "field_of_study": "<major/field>",
  "start_date": "<YYYY-MM or null>",
  "end_date": "<YYYY-MM or null>",
  "gpa": "<GPA or null>",
  "honors": "<honors, cum laude, etc. or null>"
}

Only include actual education entries (schools/universities/programs). Do NOT include:
- Technology inventories or skill lists
- Coursework as separate entries (include as field_of_study or honors on the school entry)
- Industry lists
- Metrics or achievements

RESUME:
---
${resumeText}
---`,
      1000
    );

    return this.parseArrayResponse(response, 'education');
  }

  // ── Skills ────────────────────────────────────────────────────

  private async extractSkills(resumeText: string): Promise<ExtractedSkill[]> {
    const response = await this.callAI(
      `Here is a complete resume. Extract ALL skills mentioned anywhere in the resume — from the skills/competencies section AND from the experience descriptions, technologies used, and any other sections.

Return a JSON object: { "entries": [...] }

Each entry:
{
  "name": "<specific skill name>",
  "category": "<one of: programming_language, framework, database, devops, cloud, design, soft_skill, domain_knowledge, tool, security, other>"
}

RULES:
- Extract INDIVIDUAL skills, not category headings. "Executive & Leadership" is a category heading — skip it. "Technology Strategy" IS a skill.
- Include skills from ALL sections — competencies, experience bullets, technologies lines, education coursework.
- Deduplicate — if "Terraform" appears in both the skills section and an experience entry, include it once.
- Do NOT include section headings, formatting artifacts, or markdown syntax as skills.
- Be thorough — scan the entire resume for skills mentioned in any context.

RESUME:
---
${resumeText}
---`,
      8000
    );

    return this.parseArrayResponse(response, 'skills');
  }

  // ── Certifications, Projects, Publications ────────────────────

  private async extractOther(resumeText: string): Promise<{
    certifications: ExtractedCertification[];
    projects: Array<{ name: string; description: string | null; skills_used: string[] }>;
    publications: Array<{ title: string; description: string | null }>;
  }> {
    const response = await this.callAI(
      `Here is a complete resume. Extract any certifications, projects, and publications mentioned anywhere.

Return JSON:
{
  "certifications": [{ "name": "<name>", "issuer": "<issuer or null>", "date_obtained": "<YYYY-MM or null>" }],
  "projects": [{ "name": "<name>", "description": "<description or null>", "skills_used": ["<skill>", ...] }],
  "publications": [{ "title": "<title>", "description": "<description or null>" }]
}

Use empty arrays if none found. Only include items explicitly listed as certifications, projects, or publications — not every technology mentioned.

RESUME:
---
${resumeText}
---`,
      2000
    );

    try {
      const parsed = JSON.parse(response);
      return {
        certifications: Array.isArray(parsed.certifications) ? parsed.certifications : [],
        projects: Array.isArray(parsed.projects) ? parsed.projects : [],
        publications: Array.isArray(parsed.publications) ? parsed.publications : [],
      };
    } catch {
      return { certifications: [], projects: [], publications: [] };
    }
  }

  // ── Helpers ───────────────────────────────────────────────────

  private parseArrayResponse(response: string, label: string): any[] {
    try {
      const parsed = JSON.parse(response);

      // Handle direct array
      if (Array.isArray(parsed)) return parsed;

      // Handle object wrapper — find the first array value
      for (const val of Object.values(parsed)) {
        if (Array.isArray(val) && (val as any[]).length > 0) {
          return val as any[];
        }
      }

      logger.warn({ label, keys: Object.keys(parsed) }, 'Parsed response had no array values');
      return [];
    } catch (err) {
      logger.error({ err, label, responsePreview: response?.substring(0, 300) }, 'Failed to parse AI response');
      return [];
    }
  }

  private async callAI(userPrompt: string, maxTokens: number): Promise<string> {
    const messages = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      { role: 'user' as const, content: userPrompt },
    ];

    const result = await this.aiClient!.chatCompletion('resume_parsing', messages, {
      jsonMode: true,
      maxTokens,
    });

    return result.content;
  }
}
