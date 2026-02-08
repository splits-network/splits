import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DomainEventConsumer } from '../../src/domain-consumer';
import { AIReviewServiceV2 } from '../../src/v2/reviews/service';
import { Logger } from '@splits-network/shared-logging';

function createLoggerMock(): Logger {
    return {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
        trace: vi.fn(),
        fatal: vi.fn(),
        child: vi.fn(() => createLoggerMock()),
    } as unknown as Logger;
}

describe('DomainEventConsumer (unit)', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('ignores application.created when stage is not ai_review', async () => {
        const aiReviewService = {
            enrichApplicationData: vi.fn(),
            createReview: vi.fn(),
        } as unknown as AIReviewServiceV2;
        const logger = createLoggerMock();
        const consumer = new DomainEventConsumer('amqp://localhost', aiReviewService, logger);

        const event = {
            event_type: 'application.created',
            payload: {
                application_id: 'app-1',
                stage: 'submitted',
                candidate_id: 'cand-1',
                job_id: 'job-1',
            },
        };

        await (consumer as any).handleEvent(event);

        expect(aiReviewService.enrichApplicationData).not.toHaveBeenCalled();
        expect(aiReviewService.createReview).not.toHaveBeenCalled();
    });

    it('triggers AI review on application.created when stage is ai_review', async () => {
        const aiReviewService = {
            enrichApplicationData: vi.fn().mockResolvedValue({ application_id: 'app-1' }),
            createReview: vi.fn().mockResolvedValue({ id: 'review-1' }),
        } as unknown as AIReviewServiceV2;
        const logger = createLoggerMock();
        const consumer = new DomainEventConsumer('amqp://localhost', aiReviewService, logger);

        const event = {
            event_type: 'application.created',
            payload: {
                application_id: 'app-1',
                stage: 'ai_review',
                candidate_id: 'cand-1',
                job_id: 'job-1',
            },
        };

        await (consumer as any).handleEvent(event);

        expect(aiReviewService.enrichApplicationData).toHaveBeenCalledWith({
            application_id: 'app-1',
            candidate_id: 'cand-1',
            job_id: 'job-1',
        });
        expect(aiReviewService.createReview).toHaveBeenCalled();
    });

    it('ignores application.stage_changed when new_stage is not ai_review', async () => {
        const aiReviewService = {
            enrichApplicationData: vi.fn(),
            createReview: vi.fn(),
        } as unknown as AIReviewServiceV2;
        const logger = createLoggerMock();
        const consumer = new DomainEventConsumer('amqp://localhost', aiReviewService, logger);

        const event = {
            event_type: 'application.stage_changed',
            payload: {
                application_id: 'app-1',
                old_stage: 'submitted',
                new_stage: 'interview',
                candidate_id: 'cand-1',
                job_id: 'job-1',
            },
        };

        await (consumer as any).handleEvent(event);

        expect(aiReviewService.enrichApplicationData).not.toHaveBeenCalled();
        expect(aiReviewService.createReview).not.toHaveBeenCalled();
    });

    it('triggers AI review on application.stage_changed to ai_review', async () => {
        const aiReviewService = {
            enrichApplicationData: vi.fn().mockResolvedValue({ application_id: 'app-2' }),
            createReview: vi.fn().mockResolvedValue({ id: 'review-2' }),
        } as unknown as AIReviewServiceV2;
        const logger = createLoggerMock();
        const consumer = new DomainEventConsumer('amqp://localhost', aiReviewService, logger);

        const event = {
            event_type: 'application.stage_changed',
            payload: {
                application_id: 'app-2',
                previous_stage: 'submitted',
                new_stage: 'ai_review',
                candidate_id: 'cand-2',
                job_id: 'job-2',
            },
        };

        await (consumer as any).handleEvent(event);

        expect(aiReviewService.enrichApplicationData).toHaveBeenCalledWith({
            application_id: 'app-2',
            candidate_id: 'cand-2',
            job_id: 'job-2',
        });
        expect(aiReviewService.createReview).toHaveBeenCalled();
    });
});
