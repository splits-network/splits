/**
 * AI Review Service - V2
 * Core AI logic for candidate-job fit analysis
 */

import { AIReviewRepository } from './repository.js';
import { AIReviewInput, AIReviewResult, SkillMatch, RequirementMatch } from './types.js';
import { IEventPublisher } from '../shared/events.js';
import { Logger } from '@splits-network/shared-logging';
import type { IAiClient } from '@splits-network/shared-ai-client';

function skillMatchToString(s: SkillMatch): string {
    return typeof s === 'string' ? s : s.name;
}

function requirementMatchToString(r: RequirementMatch): string {
    return typeof r === 'string' ? r : r.text;
}

export class AIReviewServiceV2 {
    constructor(
        private repository: AIReviewRepository,
        private eventPublisher: IEventPublisher | undefined,
        private logger: Logger,
        private aiClient?: IAiClient,
    ) {
        this.logger.info('AI Review Service initialized');
    }

    /**
     * Enrich minimal application data by fetching full details via direct DB queries.
     */
    async enrichApplicationData(input: Partial<AIReviewInput>): Promise<AIReviewInput> {
        return this.enrichInputIfNeeded(input);
    }

    /**
     * Enrich minimal input with full application data if needed.
     * Uses direct Supabase queries instead of HTTP calls to ATS service.
     */
    private async enrichInputIfNeeded(input: Partial<AIReviewInput>): Promise<AIReviewInput> {
        // If all required fields provided, return as-is
        if (
            input.job_title &&
            input.job_description &&
            input.required_skills &&
            Array.isArray(input.required_skills)
        ) {
            return input as AIReviewInput;
        }

        // Fetch application with related data directly from the database
        const application = await this.repository.getApplicationForEnrichment(input.application_id!);

        if (!application) {
            throw new Error(`Application not found: ${input.application_id}`);
        }

        const jobRequirements = application.job_requirements || [];

        // Fetch actual job skills from DB (skill names like "Python", "React")
        const jobId = input.job_id || application.job_id;
        let jobSkills: { name: string; is_required: boolean }[] = [];
        if (jobId) {
            try {
                jobSkills = await this.repository.getJobSkills(jobId);
            } catch (err) {
                this.logger.warn({ err, job_id: jobId }, 'Failed to fetch job skills for AI review');
            }
        }
        const requiredSkillNames = jobSkills.filter(s => s.is_required).map(s => s.name);
        const preferredSkillNames = jobSkills.filter(s => !s.is_required).map(s => s.name);
        // Build resume data with clear priority:
        // 1. application.resume_data (tailored resume from wizard) — source of truth
        // 2. Smart resume (full career profile, richer than document data)
        // 3. Document structured_metadata (legacy V2 fallback)
        let resumeText = input.resume_text || '';
        let resumeData = input.resume_data || undefined;

        // Priority 1: Tailored resume stored on the application
        if (!resumeData && application.resume_data) {
            resumeData = application.resume_data;
        }

        // Priority 2: Smart resume (full career profile)
        const candidateId = input.candidate_id || application.candidate_id;
        if (!resumeData && candidateId) {
            try {
                const smartResumeData = await this.repository.getSmartResumeData(candidateId);
                if (smartResumeData) {
                    resumeData = {
                        summary: smartResumeData.profile.professional_summary,
                        headline: smartResumeData.profile.headline,
                        total_years_experience: smartResumeData.profile.total_years_experience,
                        highest_degree: smartResumeData.profile.highest_degree,
                        experience: smartResumeData.experiences.map((exp: any) => ({
                            title: exp.title,
                            company: exp.company,
                            location: exp.location,
                            duration: [exp.start_date, exp.is_current ? 'Present' : exp.end_date].filter(Boolean).join(' - '),
                            description: exp.description,
                            achievements: exp.achievements || [],
                        })),
                        projects: smartResumeData.projects.map((proj: any) => ({
                            name: proj.name,
                            description: proj.description,
                            outcomes: proj.outcomes,
                            skills_used: proj.skills_used || [],
                        })),
                        tasks: smartResumeData.tasks.map((task: any) => ({
                            description: task.description,
                            impact: task.impact,
                            skills_used: task.skills_used || [],
                        })),
                        skills: smartResumeData.skills.map((s: any) =>
                            `${s.name}${s.proficiency ? ` (${s.proficiency})` : ''}${s.years_used ? ` - ${s.years_used}yr` : ''}`
                        ),
                        education: smartResumeData.education.map((edu: any) => ({
                            degree: edu.degree,
                            field_of_study: edu.field_of_study,
                            institution: edu.institution,
                        })),
                        certifications: smartResumeData.certifications.map((c: any) => c.name),
                        publications: smartResumeData.publications.map((p: any) => p.title),
                    };
                }
            } catch (err) {
                this.logger.warn({ err, candidate_id: candidateId }, 'Failed to fetch smart resume data for AI review');
            }
        }

        // Extract text from supporting documents (cover letters, portfolios) for additional context
        if (application.documents && Array.isArray(application.documents)) {
            const supportingText: string[] = [];
            for (const doc of application.documents) {
                if (doc.metadata?.extracted_text) {
                    supportingText.push(doc.metadata.extracted_text);
                }
            }
            if (supportingText.length > 0 && !resumeText) {
                resumeText = supportingText.join('\n\n=== NEXT DOCUMENT ===\n\n');
            }
        }

        return {
            application_id: input.application_id!,
            candidate_id: candidateId,
            job_id: input.job_id || application.job_id,
            resume_text: resumeText,
            resume_data: resumeData,
            cover_letter: application.cover_letter || undefined,
            documents_count: application.documents?.length || 0,
            job_description: input.job_description || application.job?.recruiter_description || application.job?.description || '',
            job_title: input.job_title || application.job?.title || 'Unknown Position',
            required_skills: input.required_skills || requiredSkillNames,
            preferred_skills: input.preferred_skills || preferredSkillNames,
            required_years: input.required_years,
            candidate_location: input.candidate_location || application.candidate?.location,
            job_location: input.job_location || application.job?.location,
            auto_transition: input.auto_transition,
            job_requirements: jobRequirements.map((req: any) => ({
                requirement_text: req.description || req.requirement_text,
                is_required: req.requirement_type === 'mandatory' || req.is_required,
                category: req.category,
            })),
            pre_screen_answers: application.pre_screen_answers?.map((ans: any) => ({
                question_text: ans.question || '',
                answer_text: typeof ans.answer === 'string' ? ans.answer : JSON.stringify(ans.answer),
            })),
        };
    }

    /**
     * Create a new AI review for an application
     */
    async createReview(input: AIReviewInput): Promise<any> {
        const startTime = Date.now();

        try {
            // Publish start event (non-critical — don't let it block the review)
            if (this.eventPublisher) {
                try {
                    await this.eventPublisher.publish('ai_review.started', {
                        application_id: input.application_id,
                        candidate_id: input.candidate_id,
                        job_id: input.job_id,
                        timestamp: new Date().toISOString(),
                    });
                } catch {
                    // Event publish failure is non-critical
                }
            }

            // Call OpenAI to analyze fit
            const result = await this.analyzeCandidateJobFit(input);

            const processingTimeMs = Date.now() - startTime;

            // Save review to database (creates new record for history tracking)
            const review = await this.repository.create({
                application_id: input.application_id,
                fit_score: result.fit_score,
                recommendation: result.recommendation,
                overall_summary: result.overall_summary,
                confidence_level: result.confidence_level,
                strengths: result.strengths,
                concerns: result.concerns,
                matched_skills: result.matched_skills.map(skillMatchToString),
                missing_skills: result.missing_skills.map(skillMatchToString),
                skills_match_percentage: result.skills_match_percentage,
                matched_requirements: result.matched_requirements.map(requirementMatchToString),
                missing_requirements: result.missing_requirements.map(requirementMatchToString),
                required_years: result.required_years,
                candidate_years: result.candidate_years,
                meets_experience_requirement: result.meets_experience_requirement,
                location_compatibility: result.location_compatibility,
                model_version: result.model_version,
                processing_time_ms: processingTimeMs,
            });

            // Publish ai_review.completed event
            // ATS service listens to this and transitions the application to ai_reviewed.
            // The review is already saved — if publish fails, we throw so the caller
            // (domain consumer) nacks the message and RabbitMQ redelivers it.
            if (this.eventPublisher) {
                await this.eventPublisher.publish('ai_review.completed', {
                    application_id: input.application_id,
                    candidate_id: input.candidate_id,
                    job_id: input.job_id,
                    ai_review_id: review.id,
                    fit_score: review.fit_score,
                    recommendation: review.recommendation,
                    confidence_level: review.confidence_level,
                    auto_transition: input.auto_transition,
                    processing_time_ms: processingTimeMs,
                    timestamp: new Date().toISOString(),
                });

                this.logger.info(
                    {
                        application_id: input.application_id,
                        ai_review_id: review.id,
                        fit_score: review.fit_score,
                        recommendation: review.recommendation,
                        auto_transition: input.auto_transition,
                    },
                    'Published ai_review.completed event'
                );
            }

            this.logger.info(
                { application_id: input.application_id, fit_score: review.fit_score, review_id: review.id },
                'AI review completed'
            );

            return review;
        } catch (error) {
            // Publish failed event so ATS can transition to ai_failed.
            // If this also fails, both errors will propagate — the original review
            // error is more important, so we log the publish failure but rethrow original.
            if (this.eventPublisher) {
                try {
                    await this.eventPublisher.publish('ai_review.failed', {
                        application_id: input.application_id,
                        candidate_id: input.candidate_id,
                        job_id: input.job_id,
                        error: error instanceof Error ? error.message : 'Unknown error',
                        timestamp: new Date().toISOString(),
                    });
                } catch (publishErr) {
                    this.logger.error(
                        { err: publishErr, application_id: input.application_id },
                        'Failed to publish ai_review.failed event'
                    );
                }
            }

            this.logger.error({ err: error, application_id: input.application_id }, 'AI review failed');
            throw error;
        }
    }

    async getReview(id: string): Promise<any> {
        return await this.repository.findById(id);
    }

    async getReviewByApplicationId(applicationId: string): Promise<any> {
        return await this.repository.findByApplicationId(applicationId);
    }

    async getReviews(filters: any): Promise<{ data: any[]; total: number }> {
        return await this.repository.findReviews(filters);
    }

    async getReviewStats(jobId: string): Promise<any> {
        return await this.repository.getStatsByJobId(jobId);
    }

    /**
     * Analyze candidate-job fit via the shared AI client (provider-agnostic).
     */
    private async analyzeCandidateJobFit(input: AIReviewInput): Promise<AIReviewResult & { model_version: string }> {
        if (!this.aiClient) {
            throw new Error('AI client is not configured');
        }

        const prompt = this.buildPrompt(input);
        const messages = [
            {
                role: 'system' as const,
                content: 'You are an expert recruiter assistant analyzing candidate-job fit. Provide detailed, honest assessments in valid JSON format.',
            },
            {
                role: 'user' as const,
                content: prompt,
            },
        ];

        const response = await this.aiClient.chatCompletion('fit_review', messages, {
            jsonMode: true,
        });

        const result = JSON.parse(response.content) as AIReviewResult;
        this.validateResult(result);

        return { ...result, model_version: `${response.provider}/${response.model}` };
    }

    private buildPrompt(input: AIReviewInput): string {
        // Build job requirements section
        let requirementsSection = '';
        if (input.job_requirements && input.job_requirements.length > 0) {
            const required = input.job_requirements.filter(r => r.is_required);
            const preferred = input.job_requirements.filter(r => !r.is_required);
            
            if (required.length > 0) {
                requirementsSection += '\n**Required Qualifications:**\n';
                required.forEach((req, i) => {
                    requirementsSection += `${i + 1}. ${req.requirement_text}${req.category ? ` (${req.category})` : ''}\n`;
                });
            }
            
            if (preferred.length > 0) {
                requirementsSection += '\n**Preferred Qualifications:**\n';
                preferred.forEach((req, i) => {
                    requirementsSection += `${i + 1}. ${req.requirement_text}${req.category ? ` (${req.category})` : ''}\n`;
                });
            }
        }
        
        // Build pre-screen answers section
        let preScreenSection = '';
        if (input.pre_screen_answers && input.pre_screen_answers.length > 0) {
            preScreenSection = '\n**Candidate Pre-Screen Responses:**\n';
            input.pre_screen_answers.forEach((answer, i) => {
                preScreenSection += `Q${i + 1}: ${answer.question_text}\nA: ${answer.answer_text}\n\n`;
            });
        }
        
        // Build resume section — prefer structured data, fall back to raw text
        let resumeSection = '';
        if (input.resume_data) {
            const rd = input.resume_data;
            resumeSection = '- Resume (Structured):\n';
            if (rd.summary) resumeSection += `  Summary: ${rd.summary}\n`;
            if (rd.skills?.length) {
                const skillNames = rd.skills.map((s: any) =>
                    typeof s === 'string' ? s : (s.name || String(s))
                );
                resumeSection += `  Skills: ${skillNames.join(', ')}\n`;
            }
            if (rd.experience?.length) {
                resumeSection += '  Experience:\n';
                rd.experience.slice(0, 10).forEach((exp: any) => {
                    const dates = exp.duration || exp.dates
                        || [exp.start_date, exp.is_current ? 'Present' : exp.end_date].filter(Boolean).join(' - ')
                        || '';
                    resumeSection += `    - ${exp.title || exp.role || ''} at ${exp.company || ''} (${dates})\n`;
                    if (exp.description) resumeSection += `      ${exp.description}\n`;
                    if (exp.achievements?.length) {
                        exp.achievements.forEach((a: string) => {
                            resumeSection += `      • ${a}\n`;
                        });
                    }
                });
            }
            if (rd.education?.length) {
                resumeSection += '  Education:\n';
                rd.education.slice(0, 5).forEach((edu: any) => {
                    resumeSection += `    - ${edu.degree || ''} ${edu.field_of_study || edu.field || ''} from ${edu.institution || edu.school || ''}\n`;
                });
            }
            const projects = rd.projects || [];
            if (projects.length) {
                resumeSection += '  Key Projects:\n';
                projects.slice(0, 8).forEach((proj: any) => {
                    resumeSection += `    - ${proj.name || 'Project'}: ${proj.description || ''}`;
                    if (proj.outcomes) resumeSection += ` | Outcomes: ${proj.outcomes}`;
                    if (proj.skills_used?.length) resumeSection += ` | Skills: ${proj.skills_used.join(', ')}`;
                    resumeSection += '\n';
                });
            }
            if (rd.tasks?.length) {
                resumeSection += '  Key Responsibilities:\n';
                rd.tasks.slice(0, 10).forEach((task: any) => {
                    resumeSection += `    - ${task.description || ''}`;
                    if (task.impact) resumeSection += ` → ${task.impact}`;
                    resumeSection += '\n';
                });
            }
            if (rd.certifications?.length) {
                const certNames = rd.certifications.map((c: any) => typeof c === 'string' ? c : (c.name || String(c)));
                resumeSection += `  Certifications: ${certNames.join(', ')}\n`;
            }
            if (rd.publications?.length) {
                const pubNames = rd.publications.map((p: any) => typeof p === 'string' ? p : (p.title || String(p)));
                resumeSection += `  Publications: ${pubNames.join(', ')}\n`;
            }
            if (rd.total_years_experience) resumeSection += `  Total Years Experience: ${rd.total_years_experience}\n`;
            if (rd.highest_degree) resumeSection += `  Highest Degree: ${rd.highest_degree}\n`;
        }
        if (input.resume_text && typeof input.resume_text === 'string') {
            // Truncate to 4000 chars to stay within token limits
            resumeSection += `- Resume (Full Text): ${input.resume_text.substring(0, 4000)}`;
        }
        if (!resumeSection) {
            if (input.documents_count && input.documents_count > 0) {
                resumeSection = `- Resume: ${input.documents_count} document(s) attached but text extraction is pending. Analysis is limited to pre-screen answers and basic profile information.`;
            } else {
                resumeSection = '- Resume: Not provided';
            }
        }

        // Build cover letter section
        let coverLetterSection = '';
        if (input.cover_letter) {
            coverLetterSection = `\n- Cover Letter: ${input.cover_letter.substring(0, 2000)}`;
        }

        return `Analyze the following candidate-job match and provide a detailed assessment.

**Job Information:**
- Title: ${input.job_title}
- Description: ${input.job_description}
- Required Skills: ${input.required_skills?.length ? input.required_skills.join(', ') : 'None specified'}
- Preferred Skills: ${input.preferred_skills?.length ? input.preferred_skills.join(', ') : 'None specified'}
- Required Experience: ${input.required_years ? `${input.required_years} years` : 'Not specified'}
- Location: ${input.job_location || 'Not specified'}${requirementsSection}

**Candidate Information:**
${resumeSection}${coverLetterSection}
- Location: ${input.candidate_location || 'Not specified'}${preScreenSection}

**Instructions:**
Analyze this candidate's fit for the role and provide your assessment in the following JSON format:

{
  "fit_score": <number 0-100>,
  "recommendation": "<strong_fit|good_fit|fair_fit|poor_fit>",
  "overall_summary": "<2-3 sentences summarizing the overall fit>",
  "confidence_level": <number 0-100, how confident you are in this analysis>,
  "strengths": ["<strength 1>", "<strength 2>", ...],
  "concerns": ["<concern 1>", "<concern 2>", ...],
  "matched_skills": [{"name": "<skill>", "is_required": <boolean>}, ...],
  "missing_skills": [{"name": "<skill>", "is_required": <boolean>}, ...],
  "skills_match_percentage": <number 0-100>,
  "matched_requirements": [{"text": "<requirement>", "is_required": <boolean>}, ...],
  "missing_requirements": [{"text": "<requirement>", "is_required": <boolean>}, ...],
  "required_years": ${input.required_years || null},
  "candidate_years": <estimated years of relevant experience>,
  "meets_experience_requirement": <boolean>,
  "location_compatibility": "<perfect|good|challenging|mismatch>"
}

**Scoring Guidelines:**
- fit_score: 90-100 = strong_fit, 70-89 = good_fit, 50-69 = fair_fit, 0-49 = poor_fit
- List 3-5 strengths (specific matching qualifications)
- List 0-5 concerns (specific gaps or mismatches)
- matched_skills: ONLY technology skills from the "Required Skills" and "Preferred Skills" lists (e.g. React, Node.js, GCP). Do NOT include qualifications, soft skills, or requirements here. Set is_required=true if the skill is in the Required Skills list, false if in Preferred Skills.
- missing_skills: ONLY technology skills from the "Required Skills" and "Preferred Skills" lists that the candidate lacks. Same is_required logic.
- matched_requirements: ONLY qualifications from the "Required Qualifications" and "Preferred Qualifications" sections (e.g. "5+ years experience", "Bachelor's degree"). Do NOT include technology skills here. Set is_required=true if the qualification is from Required Qualifications, false if from Preferred.
- missing_requirements: ONLY qualifications from the Required/Preferred Qualifications that the candidate does not meet. Same is_required logic.
- IMPORTANT: Skills and requirements are SEPARATE concepts. Skills are specific technologies/tools (React, Python, AWS). Requirements are broader qualifications (years of experience, degrees, domain expertise, communication skills). Do not mix them.
- location_compatibility: perfect (same location/remote), good (nearby/willing to relocate), challenging (different location but possible), mismatch (incompatible)

Be honest and specific in your assessment. Focus on concrete qualifications and experience.`;
    }

    private validateResult(result: AIReviewResult): void {
        if (result.fit_score < 0 || result.fit_score > 100) {
            throw new Error('Invalid fit_score: must be 0-100');
        }
        if (!['strong_fit', 'good_fit', 'fair_fit', 'poor_fit'].includes(result.recommendation)) {
            throw new Error('Invalid recommendation value');
        }
        if (result.confidence_level < 0 || result.confidence_level > 100) {
            throw new Error('Invalid confidence_level: must be 0-100');
        }
        if (result.skills_match_percentage < 0 || result.skills_match_percentage > 100) {
            throw new Error('Invalid skills_match_percentage: must be 0-100');
        }
        if (!['perfect', 'good', 'challenging', 'mismatch'].includes(result.location_compatibility)) {
            throw new Error('Invalid location_compatibility value');
        }
    }
}
