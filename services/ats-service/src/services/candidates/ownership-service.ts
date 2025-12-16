import { AtsRepository } from '../../repository';
import { EventPublisher } from '../../events';
import {
    CandidateSourcer,
    CandidateOutreach,
    SourcerType,
} from '@splits-network/shared-types';

/**
 * Phase 2: Candidate Ownership and Sourcing Service
 * 
 * Manages candidate sourcing, ownership attribution, and protection windows.
 * Ownership is established when a recruiter first sources a candidate.
 */
export class CandidateOwnershipService {
    constructor(
        private repository: AtsRepository,
        private eventPublisher: EventPublisher
    ) {}

    /**
     * Establish ownership of a candidate by sourcing them.
     * First sourcer wins. Protection window starts immediately.
     */
    async sourceCandidate(
        candidateId: string,
        sourcerUserId: string,
        sourcerType: SourcerType = 'recruiter',
        protectionWindowDays: number = 365,
        notes?: string
    ): Promise<CandidateSourcer> {
        // Check if candidate already has a sourcer
        const existingSourcer = await this.repository.findCandidateSourcer(candidateId);
        if (existingSourcer) {
            // Check if protection is still active
            if (existingSourcer.protection_expires_at > new Date()) {
                throw new Error(`Candidate is already sourced by user ${existingSourcer.sourcer_user_id} until ${existingSourcer.protection_expires_at}`);
            }
        }

        const sourcedAt = new Date();
        const protectionExpiresAt = new Date(sourcedAt);
        protectionExpiresAt.setDate(protectionExpiresAt.getDate() + protectionWindowDays);

        const sourcer = await this.repository.createCandidateSourcer({
            candidate_id: candidateId,
            sourcer_user_id: sourcerUserId,
            sourcer_type: sourcerType,
            sourced_at: sourcedAt,
            protection_window_days: protectionWindowDays,
            protection_expires_at: protectionExpiresAt,
            notes,
        });

        // Publish event
        await this.eventPublisher.publish(
            'candidate.sourced',
            {
                candidate_id: candidateId,
                sourcer_user_id: sourcerUserId,
                sourcer_type: sourcerType,
                protection_expires_at: protectionExpiresAt.toISOString(),
            },
            'ats-service'
        );

        return sourcer;
    }

    /**
     * Check if a candidate is protected and who the sourcer is.
     */
    async getCandidateSourcer(candidateId: string): Promise<CandidateSourcer | null> {
        return await this.repository.findCandidateSourcer(candidateId);
    }

    /**
     * Check if a specific user can work with a candidate.
     * Returns true if:
     * - No sourcer exists
     * - Protection expired
     * - This user is the sourcer
     */
    async canUserWorkWithCandidate(candidateId: string, userId: string): Promise<boolean> {
        const sourcer = await this.repository.findCandidateSourcer(candidateId);
        
        if (!sourcer) {
            return true; // No sourcer, anyone can work with candidate
        }

        if (sourcer.protection_expires_at < new Date()) {
            return true; // Protection expired
        }

        if (sourcer.sourcer_user_id === userId) {
            return true; // This user is the sourcer
        }

        return false; // Protected by another user
    }

    /**
     * Record outreach to a candidate. First outreach establishes sourcing if not already sourced.
     */
    async recordOutreach(
        candidateId: string,
        recruiterUserId: string,
        emailSubject: string,
        emailBody: string,
        jobId?: string
    ): Promise<CandidateOutreach> {
        // Check if this is first contact - if so, establish sourcing
        const existingSourcer = await this.repository.findCandidateSourcer(candidateId);
        if (!existingSourcer) {
            await this.sourceCandidate(candidateId, recruiterUserId, 'recruiter', 365, 'First outreach');
        }

        const outreach = await this.repository.createCandidateOutreach({
            candidate_id: candidateId,
            recruiter_user_id: recruiterUserId,
            job_id: jobId,
            sent_at: new Date(),
            email_subject: emailSubject,
            email_body: emailBody,
            bounced: false,
        });

        // Publish event
        await this.eventPublisher.publish(
            'candidate.outreach_sent',
            {
                outreach_id: outreach.id,
                candidate_id: candidateId,
                recruiter_user_id: recruiterUserId,
                job_id: jobId,
            },
            'ats-service'
        );

        return outreach;
    }

    /**
     * Track outreach engagement (opened, clicked, replied, etc.)
     */
    async updateOutreachEngagement(
        outreachId: string,
        updates: {
            opened_at?: Date;
            clicked_at?: Date;
            replied_at?: Date;
            unsubscribed_at?: Date;
            bounced?: boolean;
        }
    ): Promise<CandidateOutreach> {
        return await this.repository.updateCandidateOutreach(outreachId, updates);
    }

    /**
     * Get all outreach for a candidate
     */
    async getCandidateOutreach(candidateId: string): Promise<CandidateOutreach[]> {
        return await this.repository.findCandidateOutreach({ candidate_id: candidateId });
    }

    /**
     * Get all outreach by a recruiter
     */
    async getRecruiterOutreach(recruiterUserId: string): Promise<CandidateOutreach[]> {
        return await this.repository.findCandidateOutreach({ recruiter_user_id: recruiterUserId });
    }

    /**
     * Get all candidate sourcers (admin function)
     */
    async getAllSourcers(status?: string): Promise<CandidateSourcer[]> {
        const allSourcers = await this.repository.findAllCandidateSourcers();
        
        if (!status || status === 'all') {
            return allSourcers;
        }

        const now = new Date();
        if (status === 'active') {
            return allSourcers.filter(s => s.protection_expires_at > now);
        } else if (status === 'expired') {
            return allSourcers.filter(s => s.protection_expires_at <= now);
        }

        return allSourcers;
    }
}
