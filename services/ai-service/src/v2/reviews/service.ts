/**
 * AI Review Service - V2
 * Core AI logic for candidate-job fit analysis
 */

import { AIReviewRepository } from './repository';
import { AIReviewInput, AIReviewResult } from './types';
import { IEventPublisher } from '../shared/events';
import { Logger } from '@splits-network/shared-logging';

export class AIReviewServiceV2 {
    private openaiApiKey: string;
    private modelVersion: string;

    constructor(
        private repository: AIReviewRepository,
        private eventPublisher: IEventPublisher | undefined,
        private logger: Logger
    ) {
        this.openaiApiKey = process.env.OPENAI_API_KEY || '';
        this.modelVersion = process.env.OPENAI_MODEL || 'gpt-4o-mini';

        if (!this.openaiApiKey) {
            this.logger.warn('OPENAI_API_KEY not set. AI review service will not function.');
        }
        this.logger.info(`AI Review Service initialized with model: ${this.modelVersion}`);
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
        // Extract data from ALL application documents
        let resumeText = input.resume_text || '';
        let resumeData = input.resume_data || undefined;
        if (application.documents && Array.isArray(application.documents)) {
            const documentsWithText: string[] = [];
            const documentsWithoutText: any[] = [];

            for (const doc of application.documents) {
                // Raw text from metadata.extracted_text
                if (doc.metadata?.extracted_text) {
                    documentsWithText.push(doc.metadata.extracted_text);
                }

                // Structured data from structured_metadata (source of truth over application.resume_data)
                if (!resumeData && doc.document_type === 'resume' && doc.structured_metadata) {
                    const sm = doc.structured_metadata;
                    resumeData = {
                        summary: sm.professional_summary,
                        experience: sm.experience,
                        education: sm.education,
                        skills: sm.skills,
                        certifications: sm.certifications,
                        total_years_experience: sm.total_years_experience,
                        highest_degree: sm.highest_degree,
                    };
                }

                if (!doc.metadata?.extracted_text) {
                    documentsWithoutText.push({
                        id: doc.id,
                        filename: doc.filename,
                        document_type: doc.document_type,
                        processing_status: doc.processing_status,
                    });
                }
            }

            if (documentsWithText.length > 0 && !resumeText) {
                resumeText = documentsWithText.join('\n\n=== NEXT DOCUMENT ===\n\n');
            }

            if (documentsWithoutText.length > 0) {
                this.logger.warn({
                    application_id: input.application_id,
                    documents_without_text: documentsWithoutText.length,
                    details: documentsWithoutText
                }, 'Documents found without extracted text');
            }
        }

        // Fall back to application.resume_data if no document structured_metadata found
        if (!resumeData && application.resume_data) {
            resumeData = application.resume_data;
        }

        return {
            application_id: input.application_id!,
            candidate_id: input.candidate_id || application.candidate_id,
            job_id: input.job_id || application.job_id,
            resume_text: resumeText,
            resume_data: application.resume_data || undefined,
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
                matched_skills: result.matched_skills,
                missing_skills: result.missing_skills,
                skills_match_percentage: result.skills_match_percentage,
                matched_requirements: result.matched_requirements,
                missing_requirements: result.missing_requirements,
                required_years: result.required_years,
                candidate_years: result.candidate_years,
                meets_experience_requirement: result.meets_experience_requirement,
                location_compatibility: result.location_compatibility,
                model_version: this.modelVersion,
                processing_time_ms: processingTimeMs,
            });

            // Publish ai_review.completed event
            // ATS service will listen to this and decide whether to auto-transition stage
            // Wrapped in try/catch so event publish failures don't crash a successful review
            if (this.eventPublisher) {
                try {
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
                } catch (eventErr) {
                    this.logger.error(
                        { err: eventErr, application_id: input.application_id, ai_review_id: review.id },
                        'Failed to publish ai_review.completed event (review was saved successfully)'
                    );
                }
            }

            this.logger.info(
                { application_id: input.application_id, fit_score: review.fit_score, review_id: review.id },
                'AI review completed'
            );

            return review;
        } catch (error) {
            // Publish failed event — guarded so a RabbitMQ failure doesn't mask the real error
            if (this.eventPublisher) {
                try {
                    await this.eventPublisher.publish('ai_review.failed', {
                        application_id: input.application_id,
                        candidate_id: input.candidate_id,
                        job_id: input.job_id,
                        error: error instanceof Error ? error.message : 'Unknown error',
                        timestamp: new Date().toISOString(),
                    });
                } catch {
                    // Can't publish failure event either — just log
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
     * Call OpenAI API to analyze candidate-job fit
     */
    private async analyzeCandidateJobFit(input: AIReviewInput): Promise<AIReviewResult> {
        if (!this.openaiApiKey) {
            throw new Error('OPENAI_API_KEY is not configured');
        }

        const prompt = this.buildPrompt(input);
        const body = JSON.stringify({
            model: this.modelVersion,
            messages: [
                {
                    role: 'system',
                    content:
                        'You are an expert recruiter assistant analyzing candidate-job fit. Provide detailed, honest assessments in valid JSON format.',
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.3,
            max_tokens: 2000,
        });

        // Retry with exponential backoff for transient failures (429, 5xx)
        const MAX_RETRIES = 2;
        let lastError: Error | null = null;

        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
            if (attempt > 0) {
                const delayMs = Math.min(1000 * Math.pow(2, attempt - 1), 8000);
                await new Promise(resolve => setTimeout(resolve, delayMs));
                this.logger.info({ attempt, application_id: input.application_id }, 'Retrying OpenAI request');
            }

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.openaiApiKey}`,
                },
                body,
                signal: AbortSignal.timeout(60_000),
            });

            if (!response.ok) {
                const errorText = await response.text().catch(() => '');
                lastError = new Error(`OpenAI API error: ${response.status} ${errorText}`);

                // Retry on 429 (rate limit) or 5xx (server error)
                if (response.status === 429 || response.status >= 500) {
                    continue;
                }
                // Non-retryable error (400, 401, 403, etc.)
                throw lastError;
            }

            // Safe JSON parsing of OpenAI response
            let data: any;
            try {
                data = await response.json();
            } catch {
                lastError = new Error('OpenAI returned invalid JSON response');
                continue;
            }

            const content = data?.choices?.[0]?.message?.content;
            if (!content) {
                lastError = new Error('OpenAI response missing choices[0].message.content');
                continue;
            }

            let result: AIReviewResult;
            try {
                result = JSON.parse(content) as AIReviewResult;
            } catch {
                lastError = new Error('OpenAI returned non-JSON content in message');
                continue;
            }

            this.validateResult(result);
            return result;
        }

        throw lastError || new Error('OpenAI request failed after retries');
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
            if (rd.skills?.length) resumeSection += `  Skills: ${rd.skills.join(', ')}\n`;
            if (rd.experience?.length) {
                resumeSection += '  Experience:\n';
                rd.experience.slice(0, 10).forEach((exp: any) => {
                    resumeSection += `    - ${exp.title || exp.role || ''} at ${exp.company || ''} (${exp.duration || exp.dates || ''})\n`;
                });
            }
            if (rd.education?.length) {
                resumeSection += '  Education:\n';
                rd.education.slice(0, 5).forEach((edu: any) => {
                    resumeSection += `    - ${edu.degree || ''} ${edu.field || ''} from ${edu.institution || edu.school || ''}\n`;
                });
            }
            if (rd.certifications?.length) resumeSection += `  Certifications: ${rd.certifications.join(', ')}\n`;
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
  "matched_skills": ["<skill 1>", "<skill 2>", ...],
  "missing_skills": ["<skill 1>", "<skill 2>", ...],
  "skills_match_percentage": <number 0-100>,
  "matched_requirements": ["<requirement that candidate meets>", ...],
  "missing_requirements": ["<requirement that candidate does not meet>", ...],
  "required_years": ${input.required_years || null},
  "candidate_years": <estimated years of relevant experience>,
  "meets_experience_requirement": <boolean>,
  "location_compatibility": "<perfect|good|challenging|mismatch>"
}

**Scoring Guidelines:**
- fit_score: 90-100 = strong_fit, 70-89 = good_fit, 50-69 = fair_fit, 0-49 = poor_fit
- List 3-5 strengths (specific matching qualifications)
- List 0-5 concerns (specific gaps or mismatches)
- matched_skills: Skills from required/preferred list that candidate has
- missing_skills: Skills from required/preferred list that candidate lacks
- matched_requirements: Requirements from the required/preferred qualifications list that the candidate demonstrably meets based on their resume, cover letter, or pre-screen answers
- missing_requirements: Requirements from the required/preferred qualifications list that the candidate does not meet or has no evidence for
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
