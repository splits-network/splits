/**
 * Generate Resume Action Service
 *
 * Fetches a candidate's Smart Resume data and job details, calls GPT to
 * generate a tailored resume emphasizing the most relevant experience,
 * projects, skills, and achievements for the specific role.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { BadRequestError } from '@splits-network/shared-fastify';
import { createLogger } from '@splits-network/shared-logging';
import type { IAiClient } from '@splits-network/shared-ai-client';

interface GenerateResumeInput {
  candidate_id: string;
  job_id: string;
}

interface TailoredResume {
  summary: string;
  experience: {
    company: string;
    title: string;
    location?: string;
    start_date?: string;
    end_date?: string;
    is_current?: boolean;
    description?: string;
    achievements?: string[];
  }[];
  relevant_projects: {
    name: string;
    description?: string;
    outcomes?: string;
    skills_used?: string[];
  }[];
  skills: {
    name: string;
    category?: string;
    proficiency?: string;
    relevance_note?: string;
  }[];
  education: {
    institution: string;
    degree?: string;
    field_of_study?: string;
    start_date?: string;
    end_date?: string;
  }[];
  certifications: {
    name: string;
    issuer?: string;
    date_obtained?: string;
  }[];
}

export class GenerateResumeService {
  private logger = createLogger({ serviceName: 'ai-service', level: 'info' });

  constructor(
    private supabase: SupabaseClient,
    private aiClient?: IAiClient,
  ) {}

  async generate(input: GenerateResumeInput): Promise<TailoredResume> {
    // 1. Fetch smart resume profile
    const { data: profile, error: profileError } = await this.supabase
      .from('smart_resume_profiles')
      .select('*')
      .eq('candidate_id', input.candidate_id)
      .is('deleted_at', null)
      .maybeSingle();

    if (profileError) throw profileError;
    if (!profile) {
      throw new BadRequestError('Candidate has no Smart Resume profile');
    }

    const profileId = profile.id;

    // 2. Parallel fetch all smart resume child tables (visible_to_matching only)
    const [
      experiencesResult,
      projectsResult,
      tasksResult,
      educationResult,
      certificationsResult,
      skillsResult,
      publicationsResult,
    ] = await Promise.all([
      this.supabase
        .from('smart_resume_experiences')
        .select('*')
        .eq('profile_id', profileId)
        .eq('visible_to_matching', true)
        .is('deleted_at', null)
        .order('sort_order', { ascending: true }),
      this.supabase
        .from('smart_resume_projects')
        .select('*')
        .eq('profile_id', profileId)
        .eq('visible_to_matching', true)
        .is('deleted_at', null)
        .order('sort_order', { ascending: true }),
      this.supabase
        .from('smart_resume_tasks')
        .select('*')
        .eq('profile_id', profileId)
        .eq('visible_to_matching', true)
        .is('deleted_at', null)
        .order('sort_order', { ascending: true }),
      this.supabase
        .from('smart_resume_education')
        .select('*')
        .eq('profile_id', profileId)
        .eq('visible_to_matching', true)
        .is('deleted_at', null)
        .order('sort_order', { ascending: true }),
      this.supabase
        .from('smart_resume_certifications')
        .select('*')
        .eq('profile_id', profileId)
        .eq('visible_to_matching', true)
        .is('deleted_at', null)
        .order('sort_order', { ascending: true }),
      this.supabase
        .from('smart_resume_skills')
        .select('*')
        .eq('profile_id', profileId)
        .eq('visible_to_matching', true)
        .is('deleted_at', null)
        .order('sort_order', { ascending: true }),
      this.supabase
        .from('smart_resume_publications')
        .select('*')
        .eq('profile_id', profileId)
        .eq('visible_to_matching', true)
        .is('deleted_at', null)
        .order('sort_order', { ascending: true }),
    ]);

    const experiences = experiencesResult.data || [];
    const projects = projectsResult.data || [];
    const tasks = tasksResult.data || [];
    const education = educationResult.data || [];
    const certifications = certificationsResult.data || [];
    const skills = skillsResult.data || [];
    const publications = publicationsResult.data || [];

    // 3. Fetch job details
    const { data: job, error: jobError } = await this.supabase
      .from('jobs')
      .select('title, description, recruiter_description, candidate_description, location, employment_type, job_level, salary_min, salary_max')
      .eq('id', input.job_id)
      .maybeSingle();

    if (jobError) throw jobError;
    if (!job) {
      throw new BadRequestError('Job not found');
    }

    // 4. Fetch job requirements and skills in parallel
    const [requirementsResult, jobSkillsResult] = await Promise.all([
      this.supabase
        .from('job_requirements')
        .select('*')
        .eq('job_id', input.job_id),
      this.supabase
        .from('job_skills')
        .select('is_required, skill:skills(name)')
        .eq('job_id', input.job_id),
    ]);

    const jobRequirements = requirementsResult.data || [];
    const jobSkills = (jobSkillsResult.data || []).map((row: any) => ({
      name: row.skill?.name || '',
      is_required: row.is_required,
    })).filter((s: any) => s.name);

    // 5. Build prompt and call GPT
    const prompt = this.buildPrompt(
      profile, experiences, projects, tasks, education,
      certifications, skills, publications, job, jobRequirements, jobSkills,
    );

    return this.callOpenAI(prompt);
  }

  private buildPrompt(
    profile: any,
    experiences: any[],
    projects: any[],
    tasks: any[],
    education: any[],
    certifications: any[],
    skills: any[],
    publications: any[],
    job: any,
    jobRequirements: any[],
    jobSkills: { name: string; is_required: boolean }[],
  ): string {
    const experienceText = experiences.map(e =>
      `- ${e.title} at ${e.company}${e.location ? ` (${e.location})` : ''}, ${e.start_date || '?'} - ${e.is_current ? 'Present' : e.end_date || '?'}${e.description ? `\n  ${e.description}` : ''}${e.achievements?.length ? `\n  Achievements: ${e.achievements.join('; ')}` : ''}`
    ).join('\n');

    const taskText = tasks.map(t =>
      `- ${t.description}${t.impact ? ` (Impact: ${t.impact})` : ''}${t.skills_used?.length ? ` [Skills: ${t.skills_used.join(', ')}]` : ''}`
    ).join('\n');

    const projectText = projects.map(p =>
      `- ${p.name}${p.description ? `: ${p.description}` : ''}${p.outcomes ? `\n  Outcomes: ${p.outcomes}` : ''}${p.skills_used?.length ? `\n  Skills: ${p.skills_used.join(', ')}` : ''}`
    ).join('\n');

    const educationText = education.map(e =>
      `- ${e.degree || ''} ${e.field_of_study || ''} from ${e.institution}, ${e.start_date || '?'} - ${e.end_date || '?'}${e.honors ? ` (${e.honors})` : ''}`
    ).join('\n');

    const certText = certifications.map(c =>
      `- ${c.name}${c.issuer ? ` by ${c.issuer}` : ''}${c.date_obtained ? ` (${c.date_obtained})` : ''}`
    ).join('\n');

    const skillText = skills.map(s =>
      `- ${s.name}${s.category ? ` [${s.category}]` : ''} — ${s.proficiency || 'unspecified'}${s.years_used ? `, ${s.years_used}yr` : ''}`
    ).join('\n');

    const pubText = publications.map(p =>
      `- ${p.title}${p.publication_type ? ` (${p.publication_type})` : ''}${p.publisher ? ` — ${p.publisher}` : ''}${p.published_date ? `, ${p.published_date}` : ''}`
    ).join('\n');

    const requiredSkillNames = jobSkills.filter(s => s.is_required).map(s => s.name);
    const preferredSkillNames = jobSkills.filter(s => !s.is_required).map(s => s.name);

    const reqText = jobRequirements.map(r =>
      `- [${r.requirement_type === 'mandatory' || r.is_required ? 'Required' : 'Preferred'}] ${r.description || r.requirement_text}${r.category ? ` (${r.category})` : ''}`
    ).join('\n');

    return `Given this candidate's complete career profile and this job posting, generate a tailored resume that emphasizes the most relevant experience, projects, skills, and achievements for this specific role.

=== JOB DETAILS ===
Title: ${job.title}
Description: ${job.description || 'N/A'}
Recruiter Description: ${job.recruiter_description || 'N/A'}
Candidate Description: ${job.candidate_description || 'N/A'}
Location: ${job.location || 'N/A'}
Employment Type: ${job.employment_type || 'N/A'}
Level: ${job.job_level || 'N/A'}
Salary Range: ${job.salary_min ? `$${job.salary_min}` : '?'} - ${job.salary_max ? `$${job.salary_max}` : '?'}

Required Skills: ${requiredSkillNames.length ? requiredSkillNames.join(', ') : 'None specified'}
Preferred Skills: ${preferredSkillNames.length ? preferredSkillNames.join(', ') : 'None specified'}

Job Requirements:
${reqText || 'None specified'}

=== CANDIDATE PROFILE ===
${profile.professional_summary ? `Summary: ${profile.professional_summary}` : ''}

Work Experience:
${experienceText || 'None'}

Key Tasks & Accomplishments:
${taskText || 'None'}

Projects:
${projectText || 'None'}

Education:
${educationText || 'None'}

Certifications:
${certText || 'None'}

Skills:
${skillText || 'None'}

Publications:
${pubText || 'None'}

=== INSTRUCTIONS ===
Generate a tailored resume as JSON with this exact structure:
{
  "summary": "<a compelling 2-4 sentence professional summary tailored to this role>",
  "experience": [
    {
      "company": "<company name>",
      "title": "<job title>",
      "location": "<location if available>",
      "start_date": "<start date>",
      "end_date": "<end date or null if current>",
      "is_current": <boolean>,
      "description": "<role description rewritten to emphasize relevance to target job>",
      "achievements": ["<achievement rewritten for relevance>", ...]
    }
  ],
  "relevant_projects": [
    {
      "name": "<project name>",
      "description": "<description emphasizing relevance>",
      "outcomes": "<measurable outcomes>",
      "skills_used": ["<skill>", ...]
    }
  ],
  "skills": [
    {
      "name": "<skill name>",
      "category": "<category>",
      "proficiency": "<proficiency level>",
      "relevance_note": "<brief note on why this skill matters for this role>"
    }
  ],
  "education": [
    {
      "institution": "<school>",
      "degree": "<degree>",
      "field_of_study": "<field>",
      "start_date": "<start>",
      "end_date": "<end>"
    }
  ],
  "certifications": [
    {
      "name": "<cert name>",
      "issuer": "<issuer>",
      "date_obtained": "<date>"
    }
  ]
}

Rules:
- Order experience, projects, and skills by RELEVANCE to this specific job, most relevant first
- Only include experiences, projects, and skills that are relevant — omit irrelevant entries
- Rewrite descriptions and achievements to highlight aspects relevant to the target role
- Do not fabricate experience or skills the candidate does not have
- Keep the summary concise but compelling, connecting the candidate's background to this role
- For skills, prioritize those matching the job's required and preferred skills`;
  }

  private async callOpenAI(prompt: string): Promise<TailoredResume> {
    if (!this.aiClient) {
      throw new BadRequestError('AI client is not configured');
    }

    const messages = [
      {
        role: 'system' as const,
        content: 'You are an expert resume writer. You generate tailored, truthful resumes in valid JSON format. Never fabricate experience or qualifications.',
      },
      {
        role: 'user' as const,
        content: prompt,
      },
    ];

    const response = await this.aiClient.chatCompletion('resume_generation', messages, {
      jsonMode: true,
    });

    const result = JSON.parse(response.content) as TailoredResume;
    this.validateResult(result);
    return result;
  }

  private validateResult(result: TailoredResume): void {
    if (!result.summary || typeof result.summary !== 'string') {
      throw new Error('Invalid resume result: missing summary');
    }
    if (!Array.isArray(result.experience)) {
      throw new Error('Invalid resume result: experience must be an array');
    }
    if (!Array.isArray(result.relevant_projects)) {
      throw new Error('Invalid resume result: relevant_projects must be an array');
    }
    if (!Array.isArray(result.skills)) {
      throw new Error('Invalid resume result: skills must be an array');
    }
    if (!Array.isArray(result.education)) {
      throw new Error('Invalid resume result: education must be an array');
    }
    if (!Array.isArray(result.certifications)) {
      throw new Error('Invalid resume result: certifications must be an array');
    }
  }
}
