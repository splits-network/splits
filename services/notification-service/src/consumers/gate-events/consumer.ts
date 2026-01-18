import { Logger } from '@splits-network/shared-logging';
import { DomainEvent } from '@splits-network/shared-types';
import { GateEventsEmailService } from '../../services/gate-events/service';
import { DataLookupHelper } from '../../helpers/data-lookup';
import { ContactLookupHelper } from '../../helpers/contact-lookup';

export class GateEventsConsumer {
    constructor(
        private emailService: GateEventsEmailService,
        private logger: Logger,
        private dataLookup: DataLookupHelper,
        private contactLookup: ContactLookupHelper
    ) { }

    async handleGateApproved(event: DomainEvent): Promise<void> {
        try {
            const { cra_id, gate, approved_by, notes } = event.payload;

            this.logger.info(
                { cra_id, gate },
                'Processing gate approved notification'
            );

            // Load CRA with enriched data
            const cra = await this.dataLookup.getCandidateRoleAssignment(cra_id);
            if (!cra) {
                this.logger.error({ cra_id }, 'CRA not found');
                throw new Error('CRA not found');
            }

            const job = await this.dataLookup.getJob(cra.job_id);
            const candidate = await this.dataLookup.getCandidate(cra.candidate_id);

            if (!job || !candidate) {
                this.logger.error({ cra_id, hasJob: !!job, hasCandidate: !!candidate }, 'Missing job or candidate');
                throw new Error('Job or candidate not found');
            }

            // Check if candidate has email before sending notification
            if (!candidate.email) {
                this.logger.warn({ candidate_id: candidate.id, cra_id, gate }, 'Candidate has no email, skipping gate approved notification');
                return;
            }

            // Always notify candidate
            await this.emailService.sendGateApprovedToCandidate(candidate.email, {
                candidateName: candidate.full_name,
                jobTitle: job.title,
                companyName: job.company?.name || 'the company',
                gate,
                nextStep: this.getNextStepMessage(gate, cra.gate_sequence),
                notes: notes || undefined,
                userId: candidate.user_id || undefined,
            });

            // Notify recruiter based on gate type
            if (gate === 'candidate_recruiter' && cra.candidate_recruiter_id) {
                const recruiterContact = await this.contactLookup.getRecruiterContact(cra.candidate_recruiter_id);
                if (recruiterContact) {
                    await this.emailService.sendGateApprovedToRecruiter(recruiterContact.email, {
                        recruiterName: recruiterContact.name,
                        candidateName: candidate.full_name,
                        jobTitle: job.title,
                        companyName: job.company?.name || 'the company',
                        gate,
                        notes: notes || undefined,
                        userId: recruiterContact.user_id || undefined,
                    });
                }
            }

            this.logger.info({ cra_id, gate }, 'Gate approved notifications sent');
        } catch (error) {
            this.logger.error({ error, event_payload: event.payload }, 'Failed to send gate approved notification');
            throw error;
        }
    }

    async handleGateDenied(event: DomainEvent): Promise<void> {
        try {
            const { cra_id, gate, denied_by, reason } = event.payload;

            this.logger.info({ cra_id, gate }, 'Processing gate denied notification');

            const cra = await this.dataLookup.getCandidateRoleAssignment(cra_id);
            if (!cra) {
                this.logger.error({ cra_id }, 'CRA not found');
                throw new Error('CRA not found');
            }

            const job = await this.dataLookup.getJob(cra.job_id);
            const candidate = await this.dataLookup.getCandidate(cra.candidate_id);

            if (!job || !candidate) {
                this.logger.error({ cra_id }, 'Missing job or candidate');
                throw new Error('Job or candidate not found');
            }

            // Check if candidate has email before sending notification
            if (!candidate.email) {
                this.logger.warn({ candidate_id: candidate.id, cra_id, gate }, 'Candidate has no email, skipping gate denied notification');
                return;
            }

            // Always notify candidate
            await this.emailService.sendGateDeniedToCandidate(candidate.email, {
                candidateName: candidate.full_name,
                jobTitle: job.title,
                companyName: job.company?.name || 'the company',
                gate,
                reason,
                feedback: this.generateFeedbackMessage(gate),
                userId: candidate.user_id || undefined,
            });

            // Notify recruiter if applicable
            if (gate === 'candidate_recruiter' && cra.candidate_recruiter_id) {
                const recruiterContact = await this.contactLookup.getRecruiterContact(cra.candidate_recruiter_id);
                if (recruiterContact) {
                    await this.emailService.sendGateDeniedToRecruiter(recruiterContact.email, {
                        recruiterName: recruiterContact.name,
                        candidateName: candidate.full_name,
                        jobTitle: job.title,
                        companyName: job.company?.name || 'the company',
                        gate,
                        reason,
                        userId: recruiterContact.user_id || undefined,
                    });
                }
            }

            this.logger.info({ cra_id, gate }, 'Gate denied notifications sent');
        } catch (error) {
            this.logger.error({ error, event_payload: event.payload }, 'Failed to send gate denied notification');
            throw error;
        }
    }

    async handleGateInfoRequested(event: DomainEvent): Promise<void> {
        try {
            const { cra_id, gate, requested_by, questions } = event.payload;

            this.logger.info({ cra_id, gate }, 'Processing gate info requested notification');

            const cra = await this.dataLookup.getCandidateRoleAssignment(cra_id);
            if (!cra) {
                this.logger.error({ cra_id }, 'CRA not found');
                throw new Error('CRA not found');
            }

            const job = await this.dataLookup.getJob(cra.job_id);
            const candidate = await this.dataLookup.getCandidate(cra.candidate_id);

            if (!job || !candidate) {
                this.logger.error({ cra_id }, 'Missing job or candidate');
                throw new Error('Job or candidate not found');
            }

            // Determine who needs to provide the information
            const targetRole = this.getInfoProvider(gate);

            // Notify the person who needs to provide info
            if (targetRole === 'candidate') {
                // Check if candidate has email before sending notification
                if (!candidate.email) {
                    this.logger.warn({ candidate_id: candidate.id, cra_id, gate }, 'Candidate has no email, skipping gate info requested notification');
                    return;
                }

                await this.emailService.sendGateInfoRequestedToCandidate(candidate.email, {
                    candidateName: candidate.full_name,
                    jobTitle: job.title,
                    companyName: job.company?.name || 'the company',
                    gate,
                    questions,
                    actionUrl: `${process.env.PORTAL_URL}/portal/applications/${cra_id}`,
                    userId: candidate.user_id || undefined,
                });
            } else if (targetRole === 'recruiter' && cra.candidate_recruiter_id) {
                const recruiterContact = await this.contactLookup.getRecruiterContact(cra.candidate_recruiter_id);
                if (recruiterContact) {
                    await this.emailService.sendGateInfoRequestedToRecruiter(recruiterContact.email, {
                        recruiterName: recruiterContact.name,
                        candidateName: candidate.full_name,
                        jobTitle: job.title,
                        companyName: job.company?.name || 'the company',
                        gate,
                        questions,
                        actionUrl: `${process.env.PORTAL_URL}/portal/applications/${cra_id}`,
                        userId: recruiterContact.user_id || undefined,
                    });
                }
            }

            this.logger.info({ cra_id, gate }, 'Gate info requested notification sent');
        } catch (error) {
            this.logger.error({ error, event_payload: event.payload }, 'Failed to send gate info requested notification');
            throw error;
        }
    }

    async handleGateInfoProvided(event: DomainEvent): Promise<void> {
        try {
            const { cra_id, gate, provided_by, answers } = event.payload;

            this.logger.info({ cra_id, gate }, 'Processing gate info provided notification');

            const cra = await this.dataLookup.getCandidateRoleAssignment(cra_id);
            if (!cra) {
                this.logger.error({ cra_id }, 'CRA not found');
                throw new Error('CRA not found');
            }

            const job = await this.dataLookup.getJob(cra.job_id);
            const candidate = await this.dataLookup.getCandidate(cra.candidate_id);

            if (!job || !candidate) {
                this.logger.error({ cra_id }, 'Missing job or candidate');
                throw new Error('Job or candidate not found');
            }

            // Notify the reviewer who requested the info
            const reviewerRole = this.getReviewer(gate);

            // Get provider name (who submitted the info)
            const providerUser = await this.dataLookup.getUser(provided_by);
            const providerName = providerUser ? `${providerUser.first_name || ''} ${providerUser.last_name || ''}`.trim() || candidate.full_name : candidate.full_name;

            if (reviewerRole === 'candidate_recruiter' && cra.candidate_recruiter_id) {
                const recruiterContact = await this.contactLookup.getRecruiterContact(cra.candidate_recruiter_id);
                if (recruiterContact) {
                    await this.emailService.sendGateInfoProvidedToReviewer(recruiterContact.email, {
                        reviewerName: recruiterContact.name,
                        candidateName: candidate.full_name,
                        jobTitle: job.title,
                        companyName: job.company?.name || 'the company',
                        gate,
                        providerName,
                        answers: answers || 'No answers provided',
                        actionUrl: `${process.env.PORTAL_URL}/portal/gate-reviews`,
                        userId: recruiterContact.user_id || undefined,
                    });
                }
            } else if (reviewerRole === 'company_recruiter' && cra.company_recruiter_id) {
                const recruiterContact = await this.contactLookup.getRecruiterContact(cra.company_recruiter_id);
                if (recruiterContact) {
                    await this.emailService.sendGateInfoProvidedToReviewer(recruiterContact.email, {
                        reviewerName: recruiterContact.name,
                        candidateName: candidate.full_name,
                        jobTitle: job.title,
                        companyName: job.company?.name || 'the company',
                        gate,
                        providerName,
                        answers: answers || 'No answers provided',
                        actionUrl: `${process.env.PORTAL_URL}/portal/gate-reviews`,
                        userId: recruiterContact.user_id || undefined,
                    });
                }
            }

            this.logger.info({ cra_id, gate }, 'Gate info provided notification sent');
        } catch (error) {
            this.logger.error({ error, event_payload: event.payload }, 'Failed to send gate info provided notification');
            throw error;
        }
    }

    async handleGateEntered(event: DomainEvent): Promise<void> {
        try {
            const { cra_id, gate } = event.payload;

            this.logger.info({ cra_id, gate }, 'Processing gate entered notification');

            const cra = await this.dataLookup.getCandidateRoleAssignment(cra_id);
            if (!cra) {
                this.logger.error({ cra_id }, 'CRA not found');
                throw new Error('CRA not found');
            }

            const job = await this.dataLookup.getJob(cra.job_id);
            const candidate = await this.dataLookup.getCandidate(cra.candidate_id);

            if (!job || !candidate) {
                this.logger.error({ cra_id }, 'Missing job or candidate');
                throw new Error('Job or candidate not found');
            }

            // Format timestamp for display
            const enteredAt = new Date(event.timestamp).toLocaleString();

            // Notify the reviewer responsible for this gate
            if (gate === 'candidate_recruiter' && cra.candidate_recruiter_id) {
                const recruiterContact = await this.contactLookup.getRecruiterContact(cra.candidate_recruiter_id);
                if (recruiterContact) {
                    await this.emailService.sendGateEnteredToReviewer(recruiterContact.email, {
                        reviewerName: recruiterContact.name,
                        candidateName: candidate.full_name,
                        jobTitle: job.title,
                        companyName: job.company?.name || 'the company',
                        gate,
                        enteredAt,
                        actionUrl: `${process.env.PORTAL_URL}/portal/gate-reviews`,
                        userId: recruiterContact.user_id || undefined,
                    });
                }
            } else if (gate === 'company_recruiter' && cra.company_recruiter_id) {
                const recruiterContact = await this.contactLookup.getRecruiterContact(cra.company_recruiter_id);
                if (recruiterContact) {
                    await this.emailService.sendGateEnteredToReviewer(recruiterContact.email, {
                        reviewerName: recruiterContact.name,
                        candidateName: candidate.full_name,
                        jobTitle: job.title,
                        companyName: job.company?.name || 'the company',
                        gate,
                        enteredAt,
                        actionUrl: `${process.env.PORTAL_URL}/portal/gate-reviews`,
                        userId: recruiterContact.user_id || undefined,
                    });
                }
            } else if (gate === 'company') {
                // Notify company hiring manager/admin
                // TODO: Implement company user notification lookup
                this.logger.info({ cra_id, gate }, 'Company gate notification - implement company user lookup');
            }

            this.logger.info({ cra_id, gate }, 'Gate entered notification sent');
        } catch (error) {
            this.logger.error({ error, event_payload: event.payload }, 'Failed to send gate entered notification');
            throw error;
        }
    }

    // Helper methods
    private getNextStepMessage(currentGate: string, gateSequence: string[]): string {
        const currentIndex = gateSequence.indexOf(currentGate);
        const nextGate = gateSequence[currentIndex + 1];

        if (!nextGate) {
            return 'Your application is now being reviewed by the company.';
        }

        switch (nextGate) {
            case 'company_recruiter':
                return 'Next, the company recruiter will review your application.';
            case 'company':
                return 'Next, the hiring manager will review your application.';
            default:
                return 'Your application is moving forward in the process.';
        }
    }

    private generateFeedbackMessage(gate: string): string {
        switch (gate) {
            case 'candidate_recruiter':
                return 'Your recruiter can provide more specific feedback on how to improve your application for future opportunities.';
            case 'company_recruiter':
                return 'The company recruiter has determined that this position is not the right fit at this time.';
            case 'company':
                return 'The hiring team has decided to move forward with other candidates at this time.';
            default:
                return 'The reviewer has decided not to move forward with this application.';
        }
    }

    private getInfoProvider(gate: string): 'candidate' | 'recruiter' {
        // For candidate_recruiter gate, candidate provides info
        // For company_recruiter and company gates, recruiter provides info
        return gate === 'candidate_recruiter' ? 'candidate' : 'recruiter';
    }

    private getReviewer(gate: string): 'candidate_recruiter' | 'company_recruiter' | 'company' {
        return gate as 'candidate_recruiter' | 'company_recruiter' | 'company';
    }
}
