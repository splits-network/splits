import type { ApplicationStage } from '@splits-network/shared-types';

/**
 * Permission matrix for application actions based on stage and user role.
 *
 * Stage flow:
 * screen → submitted → company_review → interview → offer → hired
 *                   ↘ recruiter_review → recruiter_proposed ↗
 *                   ↘ company_feedback (depends on recruiter assignment) ↗
 *
 * Terminal stages: hired, rejected, withdrawn, expired
 */

export interface ApplicationPermissions {
    canApprove: boolean;
    canReject: boolean;
    canAddNote: boolean;
    canRequestPrescreen: boolean;
    canRequestChanges: boolean;
    approveButtonText: string;
    rejectButtonText: string;
    stageLabel: string;
    waitingMessage: string;
    /** For company_review stage: allow moving directly to offer */
    canMoveToOffer?: boolean;
}

const TERMINAL_STAGES: ApplicationStage[] = ['hired', 'rejected', 'withdrawn', 'expired'];

/**
 * Determines what actions a user can take on an application based on their role and the application's stage.
 */
export function canTakeActionOnApplication(
    stage: ApplicationStage | null | undefined,
    isRecruiter: boolean,
    isCompanyUser: boolean,
    isPlatformAdmin: boolean,
    candidateRecruiterId?: string | null
): ApplicationPermissions {
    // Default no-action response
    const noActions: ApplicationPermissions = {
        canApprove: false,
        canReject: false,
        canAddNote: false,
        canRequestPrescreen: false,
        canRequestChanges: false,
        approveButtonText: '',
        rejectButtonText: '',
        stageLabel: 'Application',
        waitingMessage: 'Application is being processed.',
    };

    if (!stage) return noActions;

    // Terminal stages - no actions for anyone
    if (TERMINAL_STAGES.includes(stage)) {
        return {
            ...noActions,
            stageLabel: getStageLabel(stage),
            waitingMessage: getTerminalMessage(stage),
        };
    }
    // Determine base permissions by stage
    const permissions = getPermissionsByStage(stage, isRecruiter, isCompanyUser, isPlatformAdmin, candidateRecruiterId);

    // Anyone who can approve or reject can also add notes
    permissions.canAddNote = permissions.canApprove || permissions.canReject || isPlatformAdmin;

    return permissions;
}

function getPermissionsByStage(
    stage: ApplicationStage,
    isRecruiter: boolean,
    isCompanyUser: boolean,
    isPlatformAdmin: boolean,
    candidateRecruiterId?: string | null
): ApplicationPermissions {
    const base: ApplicationPermissions = {
        canApprove: false,
        canReject: false,
        canAddNote: false,
        canRequestPrescreen: false,
        canRequestChanges: false,
        approveButtonText: 'Approve',
        rejectButtonText: 'Reject',
        stageLabel: getStageLabel(stage),
        waitingMessage: '',
    };

    switch (stage) {
        case 'screen':
            // Company recruiters and company users can act on screening.
            // Data access layer ensures recruiters only see applications for their jobs.
            return {
                ...base,
                canApprove: isRecruiter || isCompanyUser || isPlatformAdmin,
                canReject: isRecruiter || isCompanyUser || isPlatformAdmin,
                canRequestChanges: isRecruiter || isPlatformAdmin,
                approveButtonText: 'Approve for Company Review',
                rejectButtonText: 'Reject Application',
                waitingMessage: 'Application is being screened.',
            };

        case 'submitted':
            return {
                ...base,
                canApprove: isCompanyUser || isPlatformAdmin,
                canReject: isCompanyUser || isPlatformAdmin,
                canRequestPrescreen: !candidateRecruiterId && (isCompanyUser || isPlatformAdmin),
                approveButtonText: 'Accept for Company Review',
                rejectButtonText: 'Reject Application',
                waitingMessage: 'Application is awaiting company acceptance.',
            };

        case 'company_review':
            return {
                ...base,
                canApprove: isCompanyUser || isPlatformAdmin,
                canReject: isCompanyUser || isPlatformAdmin,
                canMoveToOffer: true, // Special: can skip interview
                approveButtonText: 'Move to Interview',
                rejectButtonText: 'Reject Application',
                waitingMessage: 'Application is under company review.',
            };

        case 'recruiter_review':
            return {
                ...base,
                canApprove: isRecruiter || isPlatformAdmin,
                canReject: isRecruiter || isPlatformAdmin,
                canRequestChanges: isRecruiter || isPlatformAdmin,
                approveButtonText: 'Approve for Company',
                rejectButtonText: 'Decline to Represent',
                waitingMessage: 'Waiting for recruiter to review this application.',
            };

        case 'recruiter_proposed':
            return {
                ...base,
                canApprove: isRecruiter || isPlatformAdmin,
                canReject: isRecruiter || isPlatformAdmin,
                approveButtonText: 'Approve for Company Review',
                rejectButtonText: 'Decline',
                waitingMessage: 'Waiting for recruiter proposal to be reviewed.',
            };

        case 'company_feedback':
            // Permission depends on whether there's a candidate recruiter
            const canAct = candidateRecruiterId
                ? (isRecruiter || isPlatformAdmin)
                : (isCompanyUser || isPlatformAdmin);
            return {
                ...base,
                canApprove: canAct,
                canReject: canAct,
                approveButtonText: 'Approve & Continue',
                rejectButtonText: 'Reject Application',
                waitingMessage: candidateRecruiterId
                    ? 'Waiting for recruiter to review company feedback.'
                    : 'Application is pending further review.',
            };

        case 'interview':
            return {
                ...base,
                canApprove: isCompanyUser || isPlatformAdmin,
                canReject: isCompanyUser || isPlatformAdmin,
                approveButtonText: 'Extend Offer',
                rejectButtonText: 'Reject Application',
                waitingMessage: 'Application is in the interview stage.',
            };

        case 'offer':
            return {
                ...base,
                canApprove: isCompanyUser || isPlatformAdmin,
                canReject: isCompanyUser || isPlatformAdmin,
                approveButtonText: 'Mark as Hired',
                rejectButtonText: 'Reject Application',
                waitingMessage: 'Application is in the offer stage.',
            };

        default:
            return base;
    }
}

function getStageLabel(stage: ApplicationStage): string {
    const labels: Record<ApplicationStage, string> = {
        draft: 'Draft',
        ai_review: 'AI Review',
        ai_reviewed: 'AI Reviewed',
        recruiter_request: 'Recruiter Request',
        recruiter_proposed: 'Recruiter Proposal',
        recruiter_review: 'Recruiter Review',
        screen: 'Initial Screening',
        submitted: 'Submitted',
        company_review: 'Company Review',
        company_feedback: 'Company Feedback',
        interview: 'Interview Stage',
        offer: 'Offer Stage',
        hired: 'Hired',
        rejected: 'Rejected',
        withdrawn: 'Withdrawn',
        expired: 'Expired',
    };
    return labels[stage] || stage;
}

function getTerminalMessage(stage: ApplicationStage): string {
    switch (stage) {
        case 'hired':
            return 'Candidate has been hired. No further actions available.';
        case 'rejected':
            return 'Application has been rejected. No further actions available.';
        case 'withdrawn':
            return 'Application has been withdrawn. No further actions available.';
        case 'expired':
            return 'Application has expired. No further actions available.';
        default:
            return 'No further actions available.';
    }
}

/**
 * Gets the target stage when approving an application from the current stage.
 */
export function getNextStageOnApprove(
    currentStage: ApplicationStage,
    candidateRecruiterId?: string | null,
    moveToOffer: boolean = false
): ApplicationStage {
    switch (currentStage) {
        case 'screen':
            return 'company_review';
        case 'submitted':
            return 'company_review';
        case 'company_review':
            return moveToOffer ? 'offer' : 'interview';
        case 'recruiter_review':
            return 'submitted';
        case 'recruiter_proposed':
            return 'company_review';
        case 'company_feedback':
            return candidateRecruiterId ? 'recruiter_review' : 'interview';
        case 'interview':
            return 'offer';
        case 'offer':
            return 'hired';
        default:
            return 'company_review';
    }
}

/**
 * Categorizes documents into candidate docs and company docs.
 */
export function categorizeDocuments(documents: any[]) {
    const candidateTypes = ['resume', 'cover_letter', 'portfolio'];
    const companyTypes = [
        'offer_letter',
        'employment_contract',
        'benefits_summary',
        'company_handbook',
        'nda',
        'company_document',
    ];

    return {
        candidateDocuments: documents.filter(
            (doc) =>
                candidateTypes.includes(doc.document_type) ||
                !companyTypes.includes(doc.document_type)
        ),
        companyDocuments: documents.filter((doc) =>
            companyTypes.includes(doc.document_type)
        ),
    };
}
