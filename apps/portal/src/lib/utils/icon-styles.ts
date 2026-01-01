/**
 * Icon utilities for consistent FontAwesome icon usage across the portal
 * 
 * These functions provide standardized icon class names for various statuses
 * and entities throughout the application.
 */

/**
 * Get FontAwesome icon for application stages
 */
export function getApplicationStageIcon(stage: string): string {
    const icons: Record<string, string> = {
        draft: 'fa-file',
        ai_review: 'fa-robot',
        screen: 'fa-eye',
        submitted: 'fa-paper-plane',
        interview: 'fa-comments',
        offer: 'fa-file-contract',
        hired: 'fa-check-circle',
        rejected: 'fa-times-circle',
    };
    return icons[stage] || 'fa-circle';
}

/**
 * Get FontAwesome icon for placement status
 */
export function getPlacementStatusIcon(status: string): string {
    const icons: Record<string, string> = {
        hired: 'fa-user-check',
        active: 'fa-briefcase',
        completed: 'fa-circle-check',
        failed: 'fa-triangle-exclamation',
    };
    return icons[status] || 'fa-circle';
}

/**
 * Get FontAwesome icon for verification status
 */
export function getVerificationStatusIcon(status: string): string {
    const icons: Record<string, string> = {
        verified: 'fa-circle-check',
        pending: 'fa-clock',
        unverified: 'fa-circle-question',
        rejected: 'fa-circle-xmark',
    };
    return icons[status] || 'fa-circle';
}

/**
 * Get FontAwesome icon for notification category
 */
export function getNotificationIcon(category?: string): string {
    const icons: Record<string, string> = {
        application: 'fa-file-alt',
        placement: 'fa-handshake',
        proposal: 'fa-lightbulb',
        candidate: 'fa-user',
        collaboration: 'fa-users',
        invitation: 'fa-envelope',
        system: 'fa-cog',
    };
    return icons[category || ''] || 'fa-bell';
}

/**
 * Get FontAwesome icon for activity types
 */
export function getActivityIcon(type: string): string {
    const icons: Record<string, string> = {
        // General activity icons
        application_received: 'fa-inbox',
        interview_scheduled: 'fa-calendar-check',
        offer_extended: 'fa-file-contract',
        placement_completed: 'fa-check-circle',
        role_created: 'fa-plus-circle',
        // Recruiter dashboard activity icons
        application_submitted: 'fa-user-plus',
        stage_changed: 'fa-arrow-right',
        // Admin platform activity icons
        placement_created: 'fa-trophy',
        company_joined: 'fa-building',
        recruiter_joined: 'fa-user-plus',
        payout_processed: 'fa-money-bill-transfer',
        alert: 'fa-triangle-exclamation',
    };
    return icons[type] || 'fa-circle-info';
}

/**
 * Get FontAwesome icon for service health status
 */
export function getServiceHealthIcon(status: 'healthy' | 'unhealthy' | 'checking'): string {
    const icons = {
        healthy: 'fa-circle-check',
        unhealthy: 'fa-circle-xmark',
        checking: 'fa-spinner',
    };
    return icons[status];
}

/**
 * Get FontAwesome icon for ATS platform
 */
export function getPlatformIcon(platform: string): string {
    const icons: Record<string, string> = {
        greenhouse: 'fa-leaf',
        lever: 'fa-sliders',
        workable: 'fa-briefcase',
        ashby: 'fa-building',
        generic: 'fa-plug',
    };
    return icons[platform] || 'fa-plug';
}
