/**
 * Badge style utilities for consistent UI across the portal
 * 
 * These functions provide standardized DaisyUI badge classes for various statuses
 * throughout the application to ensure visual consistency.
 */

/**
 * Get badge color for application stages
 */
export function getApplicationStageBadge(stage: string): string {
    const colors: Record<string, string> = {
        draft: 'badge-neutral',
        recruiter_proposed: 'badge-primary',
        recruiter_request: 'badge-info',
        ai_review: 'badge-warning',
        screen: 'badge-info',
        submitted: 'badge-primary',
        interview: 'badge-warning',
        offer: 'badge-success',
        hired: 'badge-success',
        rejected: 'badge-error',
    };
    return colors[stage] || 'badge-ghost';
}

/**
 * Get human-readable label for application stages
 */
export function getApplicationStageLabel(stage: string): string {
    const labels: Record<string, string> = {
        draft: 'Draft',
        recruiter_proposed: 'Proposed by Recruiter',
        recruiter_request: 'Recruiter Request',
        ai_review: 'AI Review',
        screen: 'Screening',
        submitted: 'Submitted',
        interview: 'Interview',
        offer: 'Offer',
        hired: 'Hired',
        rejected: 'Rejected',
    };
    return labels[stage] || stage;
}

/**
 * Get badge color for job/role status
 */
export function getJobStatusBadge(status: string): string {
    const styles: Record<string, string> = {
        active: 'badge-success',
        paused: 'badge-warning',
        filled: 'badge-info',
        closed: 'badge-neutral',
        open: 'badge-success',
    };
    return styles[status] || 'badge-neutral';
}

/**
 * Get badge color for recruiter-candidate relationship status
 */
export function getRelationshipStatusBadge(status: string): string {
    const styles: Record<string, string> = {
        active: 'badge-success',
        expired: 'badge-warning',
        terminated: 'badge-error',
    };
    return styles[status] || 'badge-ghost';
}

/**
 * Get badge color for verification status
 */
export function getVerificationStatusBadge(status: string): string {
    const styles: Record<string, string> = {
        verified: 'badge-success',
        pending: 'badge-warning',
        unverified: 'badge-neutral',
        rejected: 'badge-error',
    };
    return styles[status] || 'badge-ghost';
}

/**
 * Get badge color for placement status
 */
export function getPlacementStatusBadge(status: string): string {
    const styles: Record<string, string> = {
        hired: 'badge-info',
        active: 'badge-primary',
        completed: 'badge-success',
        failed: 'badge-error',
    };
    return styles[status] || 'badge-ghost';
}

/**
 * Get badge color for notification priority
 */
export function getPriorityBadge(priority: string): string {
    const styles: Record<string, string> = {
        urgent: 'badge-error',
        high: 'badge-warning',
        normal: 'badge-info',
        low: 'badge-ghost',
    };
    return styles[priority] || 'badge-ghost';
}

/**
 * Get badge color for integration sync status
 */
export function getSyncStatusBadge(status: string): string {
    const styles: Record<string, string> = {
        success: 'badge-success',
        error: 'badge-error',
        pending: 'badge-warning',
        skipped: 'badge-ghost',
    };
    return styles[status] || 'badge-neutral';
}

/**
 * Get badge for team role
 */
export function getRoleBadge(role: string): { class: string; label: string } {
    const badges: Record<string, { class: string; label: string }> = {
        owner: { class: 'badge-primary', label: 'Owner' },
        admin: { class: 'badge-secondary', label: 'Admin' },
        member: { class: '', label: 'Member' },
        collaborator: { class: 'badge-outline', label: 'Collaborator' },
    };
    return badges[role] || { class: '', label: role };
}

/**
 * Get alert class for alert severity
 */
export function getAlertClass(severity: string): string {
    const classes: Record<string, string> = {
        critical: 'alert-error',
        warning: 'alert-warning',
        info: 'alert-info',
    };
    return classes[severity] || 'alert-info';
}

/**
 * Get badge color for ATS platform
 */
export function getPlatformBadge(platform: string): string {
    const colors: Record<string, string> = {
        greenhouse: 'badge-success',
        lever: 'badge-primary',
        workable: 'badge-info',
        ashby: 'badge-warning',
        generic: 'badge-neutral',
    };
    return colors[platform] || 'badge-neutral';
}
