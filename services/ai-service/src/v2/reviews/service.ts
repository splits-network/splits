/**
 * AI Review Service - V2
 * Core AI logic for candidate-job fit analysis
 */

import { AIReviewRepository } from './repository';
import { AIReviewInput, AIReviewResult } from './types';
import { EventPublisher } from '../shared/events';
import { Logger } from '@splits-network/shared-logging';

export class AIReviewServiceV2 {
    private openaiApiKey: string;
    private modelVersion: string;
    private atsServiceUrl: string;

    constructor(
        private repository: AIReviewRepository,
        private eventPublisher: EventPublisher | undefined,
        private logger: Logger
    ) {
        this.openaiApiKey = process.env.OPENAI_API_KEY || '';
        this.modelVersion = process.env.OPENAI_MODEL || 'gpt-4-turbo-2024-04-09';
        this.atsServiceUrl = process.env.ATS_SERVICE_URL || 'http://ats-service:3003';

        if (!this.openaiApiKey) {
            this.logger.warn('⚠️ OPENAI_API_KEY not set. AI review service will not function.');
        }
        this.logger.info(`🤖 AI Review Service initialized with model: ${this.modelVersion}`);
    }

    /**
     * Enrich minimal application data by fetching full details from ATS service
     */
    async enrichApplicationData(input: Partial<AIReviewInput>): Promise<AIReviewInput> {
        return this.enrichInputIfNeeded(input);
    }

    /**
     * Fetch application data for stage transition logic
     * Returns: { recruiter_id, candidate_id, job_id, company_id }
     */
    /**
     * Enrich minimal input with full application data if needed
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

        // Fetch full application with job requirements, documents, AND pre-screen answers
        const response = await fetch(
            `${this.atsServiceUrl}/api/v2/applications/${input.application_id}?include=job,candidate,job_requirements,documents,pre_screen_answers`,
            {
                headers: {
                    'x-internal-service-key': process.env.INTERNAL_SERVICE_KEY || '',
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch application data: HTTP ${response.status}`);
        }

        const { data: application } = (await response.json()) as { data: any };

        // Build required_skills and preferred_skills from job_requirements
        const mandatoryRequirements =
            application.job_requirements
                ?.filter((req: any) => req.requirement_type === 'mandatory')
                .map((req: any) => req.description) || [];

        const preferredRequirements =
            application.job_requirements
                ?.filter((req: any) => req.requirement_type === 'preferred')
                .map((req: any) => req.description) || [];
// Extract resume text from ALL documents (combine them)
        let resumeText = input.resume_text || '';
        if (!resumeText && application.documents && Array.isArray(application.documents)) {
            const documentsWithText: string[] = [];
            const documentsWithoutText: any[] = [];
            
            // Process ALL documents, not just one
            for (const doc of application.documents) {
                // CRITICAL: Resume text is stored in metadata.extracted_text (JSONB field)
                if (doc.metadata?.extracted_text) {
                    documentsWithText.push(doc.metadata.extracted_text);
                    this.logger.info({ 
                        application_id: input.application_id, 
                        document_id: doc.id,
                        filename: doc.filename,
                        text_length: doc.metadata.extracted_text.length
                    }, '✅ Found extracted text in document');
                } else {
                    documentsWithoutText.push({
                        id: doc.id,
                        filename: doc.filename,
                        processing_status: doc.processing_status,
                        has_metadata: !!doc.metadata,
                        metadata_keys: doc.metadata ? Object.keys(doc.metadata) : []
                    });
                }
            }
            
            // Combine all document text
            if (documentsWithText.length > 0) {
                resumeText = documentsWithText.join('\n\n=== NEXT DOCUMENT ===\n\n');
                this.logger.info({ 
                    application_id: input.application_id, 
                    documents_processed: documentsWithText.length,
                    total_text_length: resumeText.length
                }, '✅ Combined text from multiple documents');
            }
            
            // Log warning for documents without text
            if (documentsWithoutText.length > 0) {
                this.logger.error({ 
                    application_id: input.application_id, 
                    documents_without_text: documentsWithoutText.length,
                    total_documents: application.documents.length,
                    details: documentsWithoutText
                }, '❌ CRITICAL: Documents found but NO extracted_text in metadata - document text extraction is not running!');
            }
            
            // Log overall status
            if (!resumeText) {
                this.logger.error({ 
                    application_id: input.application_id,
                    total_documents: application.documents.length
                }, '❌ CRITICAL: NO resume text available for AI review - all documents have processing_status=pending');
            }
        }

        return {
            application_id: input.application_id!,
            candidate_id: input.candidate_id || application.candidate_id,
            job_id: input.job_id || application.job_id,
            resume_text: resumeText,
            documents_count: application.documents?.length || 0,
            job_description: input.job_description || application.job?.recruiter_description || application.job?.description || '',
            job_title: input.job_title || application.job?.title || 'Unknown Position',
            required_skills: input.required_skills || mandatoryRequirements,
            preferred_skills: input.preferred_skills || preferredRequirements,
            required_years: input.required_years,
            candidate_location: input.candidate_location || application.candidate?.location,
            job_location: input.job_location || application.job?.location,
            auto_transition: input.auto_transition,
            job_requirements: application.job_requirements?.map((req: any) => ({
                requirement_text: req.description || req.requirement_text,
                is_required: req.requirement_type === 'mandatory' || req.is_required,
                category: req.category,
            })),
            pre_screen_answers: application.pre_screen_answers?.map((ans: any) => ({
                question_text: ans.question?.question_text || ans.question_text || '',
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
            // Publish start event
            if (this.eventPublisher) {
                await this.eventPublisher.publish('ai_review.started', {
                    application_id: input.application_id,
                    candidate_id: input.candidate_id,
                    job_id: input.job_id,
                    timestamp: new Date().toISOString(),
                });
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
                required_years: result.required_years,
                candidate_years: result.candidate_years,
                meets_experience_requirement: result.meets_experience_requirement,
                location_compatibility: result.location_compatibility,
                model_version: this.modelVersion,
                processing_time_ms: processingTimeMs,
            });

            // Publish ai_review.completed event
            // ATS service will listen to this and decide whether to auto-transition stage
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
            // Publish failed event
            if (this.eventPublisher) {
                await this.eventPublisher.publish('ai_review.failed', {
                    application_id: input.application_id,
                    candidate_id: input.candidate_id,
                    job_id: input.job_id,
                    error: error instanceof Error ? error.message : 'Unknown error',
                    timestamp: new Date().toISOString(),
                });
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

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.openaiApiKey}`,
            },
            body: JSON.stringify({
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
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`OpenAI API error: ${response.status} ${error}`);
        }

        const data = (await response.json()) as any;
        const content = data.choices[0].message.content;
        const result = JSON.parse(content) as AIReviewResult;

        this.validateResult(result);

        return result;
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
        
        // Build resume text section with better context
        let resumeSection = '';
        if (input.resume_text) {
            // Truncate to 4000 chars to stay within token limits
            resumeSection = `- Resume/Profile: ${input.resume_text.substring(0, 4000)}`;
        } else if (input.documents_count && input.documents_count > 0) {
            // Documents exist but text extraction failed/pending
            resumeSection = `- Resume: ${input.documents_count} document(s) attached but text extraction is pending. Analysis is limited to pre-screen answers and basic profile information.`;
        } else {
            // No documents uploaded
            resumeSection = '- Resume: Not provided';
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
${resumeSection}
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
  "required_years": ${input.required_years || null},
  "candidate_years": <estimated years of relevant experience>,
  "meets_experience_requirement": <boolean>,
  "location_compatibility": "<perfect|good|challenging|mismatch>"
}

**Scoring Guidelines:**
- fit_score: 90-100 = strong_fit, 70-89 = good_fit, 50-69 = fair_fit, 0-49 = poor_fit
- List 3-5 strengths (specific matching qualifications)
- List 0-3 concerns (specific gaps or mismatches)
- matched_skills: Skills from required/preferred list that candidate has
- missing_skills: Skills from required/preferred list that candidate lacks
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
