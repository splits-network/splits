import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JobPreScreenAnswerService } from '../../src/v2/job-pre-screen-answers/service';

describe('JobPreScreenAnswerService (unit)', () => {
    let repository: any;
    let appRepository: any;
    let service: JobPreScreenAnswerService;

    beforeEach(() => {
        vi.restoreAllMocks();
        repository = {
            list: vi.fn().mockResolvedValue([]),
            getById: vi.fn().mockResolvedValue(null),
            upsertAnswers: vi.fn().mockResolvedValue([]),
            updateAnswer: vi.fn().mockResolvedValue({ id: 'ans-1' }),
            deleteAnswer: vi.fn().mockResolvedValue(undefined),
        };
        appRepository = {
            findApplicationById: vi.fn(),
            findCandidateByClerkUserId: vi.fn(),
        };
        service = new JobPreScreenAnswerService(repository, appRepository);
    });

    it('returns empty array when upserting empty payload', async () => {
        const result = await service.upsertAnswers('clerk-1', []);
        expect(result).toEqual([]);
    });

    it('rejects update when candidate access fails', async () => {
        appRepository.findApplicationById.mockResolvedValue({ id: 'app-1', candidate_id: 'cand-1' });
        appRepository.findCandidateByClerkUserId.mockResolvedValue({ id: 'cand-2' });

        await expect(
            service.updateAnswer('clerk-1', 'ans-1', { application_id: 'app-1', answer: 'yes' })
        ).rejects.toThrow('Not authorized to update answers for this application');
    });
});
