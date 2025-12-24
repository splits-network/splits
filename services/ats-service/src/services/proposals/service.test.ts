import { ProposalService } from '../service';
import { ProposalType, ActionParty } from '@splits-network/shared-types';

/**
 * Unit tests for ProposalService
 * 
 * @see docs/guidance/unified-proposals-system.md
 */

describe('ProposalService', () => {
    let service: ProposalService;
    let mockRepository: any;

    beforeEach(() => {
        mockRepository = {
            findApplicationsPaginated: jest.fn(),
            findApplicationById: jest.fn()
        };
        service = new ProposalService(mockRepository);
    });

    describe('enrichApplicationAsProposal', () => {
        it('should identify job_opportunity type for recruiter_proposed stage', async () => {
            const application = {
                id: 'app-1',
                stage: 'recruiter_proposed',
                recruiter_id: 'rec-1',
                candidate_id: 'cand-1',
                company_id: 'comp-1',
                job_id: 'job-1',
                candidate: { id: 'cand-1', full_name: 'John Doe', email: 'john@example.com' },
                recruiter: { id: 'rec-1', name: 'Jane Smith', email: 'jane@example.com' },
                company: { id: 'comp-1', name: 'Acme Corp' },
                job: { id: 'job-1', title: 'Software Engineer', location: 'Remote' },
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const proposal = await service.enrichApplicationAsProposal(
                application,
                'cand-1',
                'candidate'
            );

            expect(proposal.type).toBe('job_opportunity');
            expect(proposal.pending_action_by).toBe('candidate');
            expect(proposal.can_current_user_act).toBe(true);
            expect(proposal.status_badge.text).toBe('Pending Response');
        });

        it('should identify application_review type for submitted stage', async () => {
            const application = {
                id: 'app-2',
                stage: 'submitted',
                recruiter_id: 'rec-1',
                candidate_id: 'cand-1',
                company_id: 'comp-1',
                job_id: 'job-1',
                candidate: { id: 'cand-1', full_name: 'John Doe' },
                recruiter: { id: 'rec-1', name: 'Jane Smith' },
                company: { id: 'comp-1', name: 'Acme Corp' },
                job: { id: 'job-1', title: 'Software Engineer' },
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const proposal = await service.enrichApplicationAsProposal(
                application,
                'comp-1',
                'company'
            );

            expect(proposal.type).toBe('application_review');
            expect(proposal.pending_action_by).toBe('company');
            expect(proposal.can_current_user_act).toBe(true);
        });

        it('should calculate urgency correctly for due dates', async () => {
            const tomorrow = new Date();
            tomorrow.setHours(tomorrow.getHours() + 12);

            const application = {
                id: 'app-3',
                stage: 'recruiter_proposed',
                action_due_date: tomorrow.toISOString(),
                recruiter_id: 'rec-1',
                candidate_id: 'cand-1',
                company_id: 'comp-1',
                job_id: 'job-1',
                candidate: { id: 'cand-1', full_name: 'John Doe' },
                recruiter: { id: 'rec-1', name: 'Jane Smith' },
                company: { id: 'comp-1', name: 'Acme Corp' },
                job: { id: 'job-1', title: 'Software Engineer' },
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const proposal = await service.enrichApplicationAsProposal(
                application,
                'cand-1',
                'candidate'
            );

            expect(proposal.is_urgent).toBe(true);
            expect(proposal.is_overdue).toBe(false);
            expect(proposal.hours_remaining).toBeGreaterThan(0);
            expect(proposal.hours_remaining).toBeLessThan(24);
        });

        it('should identify overdue proposals', async () => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            const application = {
                id: 'app-4',
                stage: 'recruiter_proposed',
                action_due_date: yesterday.toISOString(),
                recruiter_id: 'rec-1',
                candidate_id: 'cand-1',
                company_id: 'comp-1',
                job_id: 'job-1',
                candidate: { id: 'cand-1', full_name: 'John Doe' },
                recruiter: { id: 'rec-1', name: 'Jane Smith' },
                company: { id: 'comp-1', name: 'Acme Corp' },
                job: { id: 'job-1', title: 'Software Engineer' },
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const proposal = await service.enrichApplicationAsProposal(
                application,
                'cand-1',
                'candidate'
            );

            expect(proposal.is_overdue).toBe(true);
            expect(proposal.is_urgent).toBe(false);
        });

        it('should deny action permission for wrong user', async () => {
            const application = {
                id: 'app-5',
                stage: 'recruiter_proposed',
                recruiter_id: 'rec-1',
                candidate_id: 'cand-1',
                company_id: 'comp-1',
                job_id: 'job-1',
                candidate: { id: 'cand-1', full_name: 'John Doe' },
                recruiter: { id: 'rec-1', name: 'Jane Smith' },
                company: { id: 'comp-1', name: 'Acme Corp' },
                job: { id: 'job-1', title: 'Software Engineer' },
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const proposal = await service.enrichApplicationAsProposal(
                application,
                'other-user',  // Wrong user
                'candidate'
            );

            expect(proposal.can_current_user_act).toBe(false);
        });

        it('should always grant action permission to admin', async () => {
            const application = {
                id: 'app-6',
                stage: 'recruiter_proposed',
                recruiter_id: 'rec-1',
                candidate_id: 'cand-1',
                company_id: 'comp-1',
                job_id: 'job-1',
                candidate: { id: 'cand-1', full_name: 'John Doe' },
                recruiter: { id: 'rec-1', name: 'Jane Smith' },
                company: { id: 'comp-1', name: 'Acme Corp' },
                job: { id: 'job-1', title: 'Software Engineer' },
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const proposal = await service.enrichApplicationAsProposal(
                application,
                'admin-1',
                'admin'
            );

            expect(proposal.can_current_user_act).toBe(true);
        });
    });

    describe('getProposalsForUser', () => {
        it('should filter by recruiter for recruiter role', async () => {
            const mockApplications = [{
                id: 'app-1',
                stage: 'recruiter_proposed',
                recruiter_id: 'rec-1',
                candidate_id: 'cand-1',
                company_id: 'comp-1',
                job_id: 'job-1',
                candidate: { id: 'cand-1', full_name: 'John Doe' },
                recruiter: { id: 'rec-1', name: 'Jane Smith' },
                company: { id: 'comp-1', name: 'Acme Corp' },
                job: { id: 'job-1', title: 'Software Engineer' },
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }];

            mockRepository.findApplicationsPaginated.mockResolvedValue({
                data: mockApplications,
                total: 1,
                page: 1,
                limit: 25,
                total_pages: 1
            });

            const result = await service.getProposalsForUser('rec-1', 'recruiter');

            expect(mockRepository.findApplicationsPaginated).toHaveBeenCalledWith(
                expect.objectContaining({
                    recruiter_id: 'rec-1'
                })
            );
            expect(result.data).toHaveLength(1);
        });

        it('should return summary statistics', async () => {
            const tomorrow = new Date();
            tomorrow.setHours(tomorrow.getHours() + 12);

            const mockApplications = [
                {
                    id: 'app-1',
                    stage: 'recruiter_proposed',
                    action_due_date: tomorrow.toISOString(),
                    recruiter_id: 'rec-1',
                    candidate_id: 'cand-1',
                    company_id: 'comp-1',
                    job_id: 'job-1',
                    candidate: { id: 'cand-1', full_name: 'John Doe' },
                    recruiter: { id: 'rec-1', name: 'Jane Smith' },
                    company: { id: 'comp-1', name: 'Acme Corp' },
                    job: { id: 'job-1', title: 'Software Engineer' },
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                },
                {
                    id: 'app-2',
                    stage: 'submitted',
                    recruiter_id: 'rec-1',
                    candidate_id: 'cand-2',
                    company_id: 'comp-1',
                    job_id: 'job-1',
                    candidate: { id: 'cand-2', full_name: 'Jane Doe' },
                    recruiter: { id: 'rec-1', name: 'Jane Smith' },
                    company: { id: 'comp-1', name: 'Acme Corp' },
                    job: { id: 'job-1', title: 'Software Engineer' },
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }
            ];

            mockRepository.findApplicationsPaginated.mockResolvedValue({
                data: mockApplications,
                total: 2,
                page: 1,
                limit: 25,
                total_pages: 1
            });

            const result = await service.getProposalsForUser('rec-1', 'recruiter');

            expect(result.summary.actionable_count).toBeGreaterThan(0);
            expect(result.summary.urgent_count).toBe(1);
        });
    });

    describe('getActionableProposals', () => {
        it('should return only proposals requiring user action', async () => {
            const mockApplications = [
                {
                    id: 'app-1',
                    stage: 'recruiter_proposed',
                    recruiter_id: 'rec-1',
                    candidate_id: 'cand-1',
                    company_id: 'comp-1',
                    job_id: 'job-1',
                    candidate: { id: 'cand-1', full_name: 'John Doe' },
                    recruiter: { id: 'rec-1', name: 'Jane Smith' },
                    company: { id: 'comp-1', name: 'Acme Corp' },
                    job: { id: 'job-1', title: 'Software Engineer' },
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }
            ];

            mockRepository.findApplicationsPaginated.mockResolvedValue({
                data: mockApplications,
                total: 1,
                page: 1,
                limit: 25,
                total_pages: 1
            });

            const proposals = await service.getActionableProposals('cand-1', 'candidate');

            expect(proposals.every(p => p.can_current_user_act)).toBe(true);
        });
    });
});
