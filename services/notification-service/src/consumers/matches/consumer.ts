/**
 * Matches Event Consumer
 * Handles notifications for the "Invite to Apply" feature
 */

import { Logger } from '@splits-network/shared-logging';
import { DomainEvent } from '@splits-network/shared-types';
import { MatchesEmailService } from '../../services/matches/service.js';
import { ContactLookupHelper } from '../../helpers/contact-lookup.js';
import { DataLookupHelper } from '../../helpers/data-lookup.js';

export class MatchesEventConsumer {
    constructor(
        private emailService: MatchesEmailService,
        private logger: Logger,
        private portalUrl: string,
        private candidateWebsiteUrl: string,
        private contactLookup: ContactLookupHelper,
        private dataLookup: DataLookupHelper
    ) { }

    async handleMatchInvited(event: DomainEvent): Promise<void> {
        try {
            const {
                match_id, candidate_id, job_id,
                match_score, recruiter_id,
                candidate_name, job_title, company_name,
            } = event.payload;

            this.logger.info({ match_id, job_id, recruiter_id }, 'Processing match.invited event');

            if (recruiter_id) {
                await this.handleRepresentedInvite(event.payload);
            } else {
                await this.handleDirectInvite(event.payload);
            }
        } catch (error) {
            this.logger.error({ error, event_payload: event.payload }, 'Failed to process match.invited event');
            throw error;
        }
    }

    private async handleRepresentedInvite(payload: any): Promise<void> {
        const { candidate_id, job_id, recruiter_id, match_score, candidate_name, job_title, company_name } = payload;

        // Notify the recruiter (email + in-app)
        const recruiterContact = await this.contactLookup.getRecruiterContact(recruiter_id);
        if (recruiterContact) {
            await this.emailService.sendRecruiterInviteNotification(recruiterContact.email, {
                recruiterName: recruiterContact.name,
                candidateName: candidate_name || 'A candidate',
                jobTitle: job_title || 'a role',
                companyName: company_name || 'A company',
                matchScore: Math.round(match_score),
                matchUrl: `${this.portalUrl}/portal/roles?roleId=${job_id}`,
                userId: recruiterContact.user_id || undefined,
            });

            this.logger.info(
                { recruiter_id, email: recruiterContact.email },
                'Recruiter invite notification sent'
            );
        }

        // Notify the candidate (informational — email + in-app, no CTA)
        const candidateContact = await this.contactLookup.getCandidateContact(candidate_id);
        if (candidateContact) {
            await this.emailService.sendCandidateRepresentedInviteNotification(candidateContact.email, {
                candidateName: candidateContact.name,
                jobTitle: job_title || 'a role',
                companyName: company_name || 'A company',
                recruiterName: recruiterContact?.name || 'your recruiter',
                userId: candidateContact.user_id || undefined,
            });

            this.logger.info(
                { candidate_id, email: candidateContact.email },
                'Candidate (represented) invite notification sent'
            );
        }
    }

    private async handleDirectInvite(payload: any): Promise<void> {
        const { candidate_id, job_id, candidate_name, job_title, company_name } = payload;

        const candidateContact = await this.contactLookup.getCandidateContact(candidate_id);
        if (!candidateContact) {
            this.logger.warn({ candidate_id }, 'Candidate contact not found for direct invite');
            return;
        }

        await this.emailService.sendCandidateDirectInviteNotification(candidateContact.email, {
            candidateName: candidateContact.name,
            jobTitle: job_title || 'a role',
            companyName: company_name || 'A company',
            applyUrl: `${this.candidateWebsiteUrl}/jobs/${job_id}`,
            userId: candidateContact.user_id || undefined,
        });

        this.logger.info(
            { candidate_id, email: candidateContact.email },
            'Candidate direct invite notification sent'
        );
    }

    async handleMatchInviteDenied(event: DomainEvent): Promise<void> {
        try {
            const { invited_by, candidate_name, job_title, company_name } = event.payload;
            if (!invited_by) return;

            this.logger.info({ invited_by }, 'Processing match.invite_denied event');

            // Look up the original inviter's contact info
            const inviterContact = await this.contactLookup.getContactByUserId(invited_by);
            if (!inviterContact) {
                this.logger.warn({ invited_by }, 'Inviter contact not found');
                return;
            }

            await this.emailService.sendInviteDeniedNotification(inviterContact.email, {
                inviterName: inviterContact.name,
                candidateName: candidate_name || 'The candidate',
                jobTitle: job_title || 'the role',
                companyName: company_name || 'the company',
                userId: inviterContact.user_id || undefined,
            });

            this.logger.info(
                { invited_by, email: inviterContact.email },
                'Invite denied notification sent'
            );
        } catch (error) {
            this.logger.error({ error, event_payload: event.payload }, 'Failed to process match.invite_denied event');
            throw error;
        }
    }
}
