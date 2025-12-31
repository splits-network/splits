/**
 * AI Review Service - V2
 * Orchestrates AI-powered candidate reviews by calling ATS service
 */

import { Logger } from '@splits-network/shared-logging';
import { DomainEvent } from '@splits-network/shared-types';

export class AIReviewService {
    constructor(
        private atsServiceUrl: string,
        private logger: Logger
    ) {}

    /**
     * Trigger AI review for an application
     * Called when application.submitted_for_ai_review event is received
     */
    async triggerReview(event: DomainEvent): Promise<void> {
        const {
            application_id,
            candidate_id,
            job_id,
            document_ids,
            primary_resume_id,
        } = event.payload;

        this.logger.info(
            {
                application_id,
                job_id,
                candidate_id,
                event_id: event.event_id,
            },
            'Triggering AI review for application'
        );

        try {
            // Call ATS service to perform AI review
            // ATS service has all the AI logic (OpenAI integration, scoring, etc)
            const response = await fetch(
                `${this.atsServiceUrl}/applications/${application_id}/ai-review`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        auto_transition: true, // Auto-move to next stage after review
                    }),
                    signal: AbortSignal.timeout(90000), // 90 second timeout (AI reviews can be slow)
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json() as any;
            const fitScore = result?.data?.fit_score;
            const reviewId = result?.data?.id;

            this.logger.info(
                {
                    application_id,
                    review_id: reviewId,
                    fit_score: fitScore,
                    event_id: event.event_id,
                },
                'AI review completed successfully'
            );
        } catch (error: any) {
            this.logger.error(
                {
                    err: error,
                    application_id,
                    event_id: event.event_id,
                    error_message: error.message,
                },
                'Failed to trigger AI review'
            );

            // Don't throw - we don't want to requeue endlessly if AI review keeps failing
            // The application is already in ai_review stage, recruiter can manually trigger if needed
            // The AI review service in ATS will publish ai_review.failed event with details
        }
    }
}
