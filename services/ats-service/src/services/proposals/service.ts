import { AtsRepository } from '../../repository';
import {
    UnifiedProposal,
    ProposalFilters,
    ProposalsResponse,
    ProposalType,
    ActionParty,
    ActionType,
    StatusBadge,
    getProposalTypeFromStage,
    getPendingActionParty,
    getActionType
} from '@splits-network/shared-types';

// For backward compatibility during migration
export type UserRole = 'candidate' | 'recruiter' | 'company' | 'admin';

export interface ProposalListFilters extends Omit<ProposalFilters, 'created_after' | 'created_before' | 'sort_by' | 'sort_order'> {
    // Filtering
    job_id?: string;
    company_id?: string;
    created_after?: string;  // String format for DB queries
    created_before?: string; // String format for DB queries
    
    // Pagination
    page?: number;
    limit?: number;
    
    // Sorting (database uses uppercase)
    sort_by?: string;
    sort_order?: 'ASC' | 'DESC';
}

/**
 * Unified Proposal Service
 * 
 * CRITICAL: Role-based filtering happens in DATABASE via SQL JOINs.
 * We pass only clerk_user_id to repository. Repository uses database functions
 * that JOIN to role tables (network.recruiters, identity.memberships, ats.candidates)
 * and apply WHERE clause with role conditions in single query.
 * 
 * Performance: 10-50ms with JOINs (vs 200-500ms with service-to-service calls)
 * 
 * @see docs/migration/DATABASE-JOIN-PATTERN.md
 * @see docs/guidance/unified-proposals-system.md
 */
export class ProposalService {
    constructor(private repository: AtsRepository) {}

    /**
     * Get all proposals for current user based on their role
     * 
     * IMPORTANT: No userRole parameter! Database determines role from records using JOINs.
     * Single query resolves: clerk_user_id → role(s) → filtered proposals.
     * 
     * @param clerkUserId - The Clerk user ID from x-clerk-user-id header
     * @param filters - Filtering, search, sorting, pagination parameters
     * @param correlationId - Optional correlation ID for tracing
     * @param organizationId - Organization ID for context/logging only
     */
    async getProposalsForUser(
        clerkUserId: string,
        filters?: ProposalListFilters,
        correlationId?: string,
        organizationId?: string
    ): Promise<ProposalsResponse> {
        const page = filters?.page || 1;
        const limit = Math.min(filters?.limit || 25, 100);

        // Call repository which uses direct Supabase queries with JOINs
        // Repository signature: findProposalsForUser(clerkUserId, organizationId, filters)
        const { data, total } = await this.repository.findProposalsForUser(
            clerkUserId,
            organizationId || null,
            {
                // Filtering
                type: filters?.type,
                state: filters?.state,
                job_id: filters?.job_id,
                company_id: filters?.company_id,
                created_after: filters?.created_after,
                created_before: filters?.created_before,
                urgent_only: filters?.urgent_only,
                
                // Search
                search: filters?.search,
                
                // Sorting
                sort_by: filters?.sort_by || 'created_at',
                sort_order: filters?.sort_order || 'DESC',
                
                // Pagination
                page,
                limit
            }
        );

        // Transform database results to unified proposal format
        const proposals: UnifiedProposal[] = data.map(app => this.transformApplicationToProposal(app));

        // Calculate summary statistics
        const summary = {
            actionable_count: proposals.filter(p => p.can_current_user_act).length,
            waiting_count: proposals.filter(p => !p.can_current_user_act && !this.isCompleted(p.stage)).length,
            urgent_count: proposals.filter(p => p.is_urgent).length,
            overdue_count: proposals.filter(p => p.is_overdue).length
        };

        return {
            data: proposals,
            pagination: {
                total,
                page,
                limit,
                total_pages: Math.ceil(total / limit)
            },
            summary
        };
    }

    /**
     * Get proposals requiring user's action (role-filtered by database)
     * 
     * @param clerkUserId - The Clerk user ID from x-clerk-user-id header
     * @param correlationId - Optional correlation ID for tracing
     * @param organizationId - Organization ID for context/logging only
     */
    async getActionableProposals(
        clerkUserId: string,
        correlationId?: string,
        organizationId?: string
    ): Promise<UnifiedProposal[]> {
        const { data, total } = await this.repository.findProposalsForUser(
            clerkUserId,
            organizationId || null,
            {
                page: 1,
                limit: 100,
                sort_by: 'created_at',
                sort_order: 'DESC'
            }
        );
        
        // Filter to only actionable proposals
        return data.filter((app: any) => {
            // TODO: Implement proper actionable check based on stage and user role
            return !this.isCompleted(app.stage);
        }).map((app: any) => this.transformApplicationToProposal(app));
    }

    /**
     * Get proposals awaiting others (user initiated, pending response)
     * Role-filtered by database.
     * 
     * @param clerkUserId - The Clerk user ID from x-clerk-user-id header
     * @param correlationId - Optional correlation ID for tracing
     * @param organizationId - Organization ID for context/logging only
     */
    async getPendingProposals(
        clerkUserId: string,
        correlationId?: string,
        organizationId?: string
    ): Promise<UnifiedProposal[]> {
        const { data, total } = await this.repository.findProposalsForUser(
            clerkUserId,
            organizationId || null,
            {
                page: 1,
                limit: 100,
                sort_by: 'created_at',
                sort_order: 'DESC'
            }
        );
        
        // Filter to only pending proposals
        return data.filter((app: any) => {
            // TODO: Implement proper pending check based on stage
            return !this.isCompleted(app.stage);
        }).map((app: any) => this.transformApplicationToProposal(app));
    }

    /**
     * Get summary statistics for proposals visible to the user
     */
    async getSummary(
        clerkUserId: string,
        correlationId?: string,
        organizationId?: string
    ): Promise<ProposalsResponse['summary']> {
        const { data } = await this.repository.findProposalsForUser(
            clerkUserId,
            organizationId || null,
            {
                page: 1,
                limit: 250,
                sort_by: 'created_at',
                sort_order: 'DESC'
            }
        );

        const proposals = data.map(app => this.transformApplicationToProposal(app));
        return {
            actionable_count: proposals.filter(p => p.can_current_user_act).length,
            waiting_count: proposals.filter(p => !p.can_current_user_act && !this.isCompleted(p.stage)).length,
            urgent_count: proposals.filter(p => p.is_urgent).length,
            overdue_count: proposals.filter(p => p.is_overdue).length
        };
    }

    /**
     * Get a single proposal by ID if the user has permission
     */
    async getProposalById(
        proposalId: string,
        clerkUserId: string,
        correlationId?: string,
        organizationId?: string
    ): Promise<UnifiedProposal | null> {
        const proposal = await this.repository.findProposalById(
            proposalId,
            clerkUserId,
            organizationId || null
        );

        if (!proposal) {
            return null;
        }

        return this.transformApplicationToProposal(proposal);
    }

    /**
     * Transform application to unified proposal format
     */
    private transformApplicationToProposal(app: any): UnifiedProposal {
        const proposalType = getProposalTypeFromStage(app.stage, app.recruiter_id);
        const pendingActionBy = this.determineActionParty(app);
        const pendingActionType = getActionType(app.stage);
        const urgencyInfo = this.calculateUrgency(app);
        const statusBadge = this.getStatusBadge(app.stage, proposalType);
        const actionLabel = this.getActionLabel(proposalType, pendingActionType);

        return {
            id: app.id,
            type: proposalType,
            stage: app.stage,
            
            // Parties
            candidate: {
                id: app.candidate_id,
                name: app.candidate?.full_name || 'Unknown',
                email: app.candidate?.email,
                type: 'candidate'
            },
            recruiter: app.recruiter_id ? {
                id: app.recruiter_id,
                name: app.recruiter?.name || 'Recruiter',
                email: app.recruiter?.email,
                type: 'recruiter'
            } : undefined,
            company: {
                id: app.company?.id || app.job?.company_id,
                name: app.company?.name || 'Company',
                type: 'company'
            },
            
            // Job details (top-level, not nested)
            job_id: app.job_id,
            job_title: app.job?.title || 'Position',
            job_description: app.job?.description,
            job_location: app.job?.location,
            
            // Metadata
            subtitle: proposalType === 'job_opportunity' 
                ? `Sent to ${app.candidate?.full_name || 'Candidate'}` 
                : `From ${app.candidate?.full_name || 'Candidate'}`,
            proposal_notes: app.notes,
            created_at: app.created_at,
            updated_at: app.updated_at,
            
            // Action metadata
            pending_action_by: pendingActionBy,
            pending_action_type: pendingActionType,
            can_current_user_act: false,
            action_label: actionLabel,
            
            // Status
            status_badge: statusBadge,
            is_urgent: urgencyInfo.is_urgent,
            is_overdue: urgencyInfo.is_overdue,
            hours_remaining: urgencyInfo.hours_remaining
        };
    }

    /**
     * Enrich application with proposal metadata
     */
    async enrichApplicationAsProposal(
        application: any,  // Enriched application with candidate, job, company, recruiter
        currentUserId: string,
        currentUserRole: UserRole
    ): Promise<UnifiedProposal> {
        const proposalType = getProposalTypeFromStage(application.stage, application.recruiter_id);
        const pendingActionBy = this.determineActionParty(application);
        const pendingActionType = getActionType(application.stage);
        const canCurrentUserAct = this.canUserAct(application, currentUserId, currentUserRole, pendingActionBy);

        // Calculate urgency
        const urgencyInfo = this.calculateUrgency(application);

        // Generate status badge
        const statusBadge = this.getStatusBadge(application.stage, proposalType);

        // Generate action label
        const actionLabel = this.getActionLabel(proposalType, pendingActionType);

        // Generate subtitle
        const subtitle = this.getSubtitle(proposalType, application, currentUserRole);

        return {
            id: application.id,
            type: proposalType,
            stage: application.stage,

            // Parties
            candidate: {
                id: application.candidate_id || application.candidate?.id,
                name: application.candidate?.full_name || application.candidate_name || 'Unknown',
                email: application.candidate?.email || application.candidate_email,
                type: 'candidate'
            },
            recruiter: application.recruiter_id ? {
                id: application.recruiter_id,
                name: application.recruiter?.name || 'Recruiter',
                email: application.recruiter?.email,
                type: 'recruiter'
            } : undefined,
            company: {
                id: application.company_id || application.company?.id,
                name: application.company?.name || 'Company',
                type: 'company'
            },

            // Job details
            job_id: application.job_id || application.job?.id,
            job_title: application.job?.title || application.job_title || 'Position',
            job_description: application.job?.description,
            job_location: application.job?.location,

            // Action tracking
            pending_action_by: pendingActionBy,
            pending_action_type: pendingActionType,
            can_current_user_act: canCurrentUserAct,

            // Deadlines and urgency
            action_due_date: application.action_due_date,
            expires_at: application.expires_at,
            is_urgent: urgencyInfo.is_urgent,
            is_overdue: urgencyInfo.is_overdue,
            hours_remaining: urgencyInfo.hours_remaining,

            // Context
            proposal_notes: application.recruiter_notes || application.metadata?.recruiter_pitch,
            response_notes: application.response_notes,
            ai_analysis: application.ai_analysis,
            metadata: application.metadata,

            // Timestamps
            created_at: application.created_at,
            updated_at: application.updated_at,
            responded_at: application.responded_at,

            // Display helpers
            status_badge: statusBadge,
            action_label: actionLabel,
            subtitle: subtitle
        };
    }

    /**
     * Determine who can act on a proposal
     */
    private determineActionParty(application: any): ActionParty {
        return getPendingActionParty(application.stage, application.recruiter_id);
    }

    /**
     * Check if current user can act on proposal
     */
    private canUserAct(
        application: any,
        userId: string,
        userRole: UserRole,
        pendingActionBy: ActionParty
    ): boolean {
        // Match role to action party
        if (userRole === 'admin') return true;  // Admins can always act

        if (pendingActionBy === 'candidate') {
            return userRole === 'candidate' && application.candidate_id === userId;
        } else if (pendingActionBy === 'recruiter') {
            return userRole === 'recruiter' && application.recruiter_id === userId;
        } else if (pendingActionBy === 'company') {
            return userRole === 'company' && application.company_id === userId;
        }

        return false;
    }

    /**
     * Calculate urgency based on deadlines
     */
    private calculateUrgency(application: any): {
        is_urgent: boolean;
        is_overdue: boolean;
        hours_remaining?: number;
    } {
        const dueDate = application.action_due_date || application.expires_at;
        if (!dueDate) {
            return { is_urgent: false, is_overdue: false };
        }

        const now = new Date();
        const due = new Date(dueDate);
        const diffMs = due.getTime() - now.getTime();
        const hours_remaining = diffMs / (1000 * 60 * 60);

        const is_overdue = hours_remaining < 0;
        const is_urgent = hours_remaining < 24 && hours_remaining >= 0;

        return {
            is_urgent,
            is_overdue,
            hours_remaining: Math.max(0, hours_remaining)
        };
    }

    /**
     * Get status badge configuration
     */
    private getStatusBadge(stage: string, type: ProposalType): StatusBadge {
        // Stage-specific badges
        if (stage === 'recruiter_proposed') {
            return { text: 'Pending Response', color: 'warning', icon: 'clock' };
        } else if (stage === 'draft') {
            return { text: 'In Progress', color: 'info', icon: 'pencil' };
        } else if (stage === 'ai_review') {
            return { text: 'AI Reviewing', color: 'info', icon: 'robot' };
        } else if (stage === 'screen') {
            return { text: 'Screening', color: 'info', icon: 'phone' };
        } else if (stage === 'submitted') {
            return { text: 'Under Review', color: 'info', icon: 'eye' };
        } else if (stage === 'interview') {
            return { text: 'Interview Stage', color: 'info', icon: 'calendar' };
        } else if (stage === 'offer') {
            return { text: 'Offer Extended', color: 'success', icon: 'handshake' };
        } else if (stage === 'hired') {
            return { text: 'Hired', color: 'success', icon: 'check-circle' };
        } else if (stage === 'rejected') {
            return { text: 'Declined', color: 'error', icon: 'times-circle' };
        } else if (stage === 'withdrawn') {
            return { text: 'Withdrawn', color: 'neutral', icon: 'ban' };
        }

        return { text: stage, color: 'neutral', icon: 'circle' };
    }

    /**
     * Get action label for proposal
     */
    private getActionLabel(type: ProposalType, actionType: ActionType): string {
        if (type === 'job_opportunity') {
            return 'Review Opportunity';
        } else if (type === 'application_screen') {
            return 'Conduct Screen';
        } else if (type === 'application_review') {
            return 'Review Application';
        } else if (type === 'collaboration') {
            return 'Review Proposal';
        } else if (type === 'interview_invitation') {
            return 'Schedule Interview';
        } else if (type === 'job_offer') {
            return 'Review Offer';
        }

        return 'Take Action';
    }

    /**
     * Get subtitle for proposal card
     */
    private getSubtitle(type: ProposalType, application: any, userRole: UserRole): string {
        if (type === 'job_opportunity') {
            return `From ${application.recruiter?.name || 'Recruiter'}`;
        } else if (type === 'direct_application') {
            return `Applied by ${application.candidate?.full_name || 'Candidate'}`;
        } else if (type === 'application_screen') {
            return `Screen: ${application.candidate?.full_name || 'Candidate'}`;
        } else if (type === 'application_review') {
            if (userRole === 'recruiter') {
                return `Submitted to ${application.company?.name || 'Company'}`;
            }
            return `From ${application.recruiter?.name || application.candidate?.full_name || 'Candidate'}`;
        }

        return '';
    }

    /**
     * Get application stages for a proposal type
     */
    private getStagesForProposalType(type: ProposalType): string | string[] {
        switch (type) {
            case 'job_opportunity':
                return 'recruiter_proposed';
            case 'direct_application':
                return ['draft', 'submitted'];
            case 'application_screen':
                return ['screen', 'ai_review'];
            case 'application_review':
                return ['submitted', 'interview'];
            case 'job_offer':
                return 'offer';
            default:
                return [];
        }
    }

    /**
     * Check if stage represents a completed proposal
     */
    private isCompleted(stage: string): boolean {
        return ['hired', 'rejected', 'withdrawn'].includes(stage);
    }
}
