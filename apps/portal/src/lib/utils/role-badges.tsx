/**
 * Role badge utilities for displaying popularity and freshness indicators
 * 
 * These functions provide visual indicators for role attractiveness:
 * - NEW badge for recently posted roles
 * - HOT badge for popular roles with high application counts
 */

import { daysSince } from './date-formatting';

export interface RoleBadge {
    icon: string;
    text?: string;
    class: string;
    animated?: boolean;
    tooltip?: string;
}

export interface RoleWithApplicationCount {
    id: string;
    created_at: string | Date;
    application_count?: number;
}

/**
 * Calculate if a role should show the "HOT" badge
 * Based on top quartile of application counts among active roles
 */
export function isHotRole(
    applicationCount: number,
    allApplicationCounts: number[]
): boolean {
    if (!applicationCount || applicationCount === 0) return false;
    if (allApplicationCounts.length === 0) return false;

    // Calculate top quartile threshold
    const sorted = [...allApplicationCounts].sort((a, b) => b - a);
    const topQuartileIndex = Math.floor(sorted.length * 0.25);
    const threshold = sorted[topQuartileIndex] || 0;

    return applicationCount >= threshold && applicationCount >= 5; // Minimum 5 applications to be "hot"
}

/**
 * Get all badges for a role
 */
export function getRoleBadges(
    role: RoleWithApplicationCount,
    allRoles?: RoleWithApplicationCount[]
): RoleBadge[] {
    const badges: RoleBadge[] = [];

    // NEW badge (posted within last 7 days)
    const daysSincePosted = daysSince(role.created_at);
    if (daysSincePosted <= 7) {
        badges.push({
            icon: 'fa-sparkles',
            text: 'NEW',
            class: 'badge-info',
            tooltip: `Posted ${daysSincePosted} day${daysSincePosted !== 1 ? 's' : ''} ago`,
        });
    }

    // HOT badge (top quartile of application counts)
    if (role.application_count && allRoles) {
        const allCounts = allRoles
            .map(r => r.application_count || 0)
            .filter(count => count > 0);
        
        if (isHotRole(role.application_count, allCounts)) {
            badges.push({
                icon: 'fa-fire',
                text: 'HOT',
                class: 'badge-error',
                animated: true,
                tooltip: `${role.application_count} applications - high interest!`,
            });
        }
    }

    return badges;
}

/**
 * Render a single role badge as JSX-compatible props
 */
export function renderRoleBadge(badge: RoleBadge) {
    return {
        className: `badge ${badge.class} gap-1 ${badge.animated ? 'animate-pulse' : ''}`,
        'data-tip': badge.tooltip,
        children: (
            <>
                <i className={`fa-solid ${badge.icon}`}></i>
                {badge.text && <span>{badge.text}</span>}
            </>
        ),
    };
}
