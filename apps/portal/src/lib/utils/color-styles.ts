/**
 * Color style utilities for consistent UI backgrounds and borders
 * 
 * These functions provide standardized color classes for various UI elements.
 */

/**
 * Get border color class for job/role status (used in cards)
 */
export function getJobStatusBorderColor(status: string): string {
    const colors: Record<string, string> = {
        active: 'border-green-500',
        paused: 'border-yellow-500',
        filled: 'border-blue-500',
        closed: 'border-gray-500',
    };
    return colors[status] || 'border-gray-300';
}

/**
 * Get border color class for application stage (used in cards)
 */
export function getApplicationStageBorderColor(stage: string): string {
    const borders: Record<string, string> = {
        draft: 'border-neutral',
        recruiter_proposed: 'border-coral',
        recruiter_request: 'border-info',
        ai_review: 'border-warning',
        screen: 'border-coral',
        submitted: 'border-info',
        interview: 'border-warning',
        offer: 'border-success',
        hired: 'border-success',
        rejected: 'border-error',
    };
    return borders[stage] || 'border-base-200';
}

export function getApplicationStageBgColor(stage: string): string {
    const borders: Record<string, string> = {
        draft: 'border-neutral',
        recruiter_proposed: 'border-coral',
        recruiter_request: 'border-info',
        ai_review: 'border-warning',
        screen: 'border-coral',
        submitted: 'border-info',
        interview: 'border-warning',
        offer: 'border-success',
        hired: 'border-success',
        rejected: 'border-error',
    };
    return borders[stage] || 'border-base-200';
}

/**
 * Get background color class for placement status
 */
export function getPlacementStatusBgColor(status: string): string {
    const colors: Record<string, string> = {
        hired: 'bg-info/10 border-info/20',
        active: 'bg-primary/10 border-coral/20',
        completed: 'bg-success/10 border-success/20',
        failed: 'bg-error/10 border-error/20',
    };
    return colors[status] || 'bg-base-200';
}

/**
 * Get text color for health scores and metrics
 */
export function getHealthScoreColor(score: number): string {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-error';
}

/**
 * Get health score color and label for display
 */
export function getHealthScore(score: number): { color: string; label: string } {
    if (score >= 80) return { color: 'text-success', label: 'Excellent' };
    if (score >= 60) return { color: 'text-info', label: 'Good' };
    if (score >= 40) return { color: 'text-warning', label: 'Fair' };
    return { color: 'text-error', label: 'Needs Attention' };
}

/**
 * Get service status color (for status pages)
 */
export function getServiceStatusColor(status: 'healthy' | 'unhealthy' | 'checking'): string {
    const colors = {
        healthy: 'bg-success',
        unhealthy: 'bg-error',
        checking: 'bg-warning',
    };
    return colors[status];
}

/* ─── Role → DaisyUI semantic color mapping (Basel) ──────────────────────── */

export interface RoleStyle {
    bg: string;
    text: string;
    badgeBg: string;
}

const ROLE_STYLES: Record<string, RoleStyle> = {
    Administrator: { bg: 'bg-error', text: 'text-error-content', badgeBg: 'bg-error/10 text-error' },
    Recruiter: { bg: 'bg-primary', text: 'text-primary-content', badgeBg: 'bg-primary/10 text-primary' },
    'Recruiter & Company': { bg: 'bg-primary', text: 'text-primary-content', badgeBg: 'bg-primary/10 text-primary' },
    'Company User': { bg: 'bg-secondary', text: 'text-secondary-content', badgeBg: 'bg-secondary/10 text-secondary' },
    Candidate: { bg: 'bg-accent', text: 'text-accent-content', badgeBg: 'bg-accent/10 text-accent' },
    User: { bg: 'bg-neutral', text: 'text-neutral-content', badgeBg: 'bg-neutral/10 text-neutral' },
};

/**
 * Get DaisyUI semantic color styles for a user role.
 * Used by Basel components for role-colored avatars and badges.
 */
export function getRoleStyle(roleDisplay: string): RoleStyle {
    return ROLE_STYLES[roleDisplay] || ROLE_STYLES.User;
}
