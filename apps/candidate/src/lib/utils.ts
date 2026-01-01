
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) {
    return 'Just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else if (diffDays < 30) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months !== 1 ? 's' : ''} ago`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `${years} year${years !== 1 ? 's' : ''} ago`;
  }
}

export function formatSalary(min: number, max: number, currency = 'USD'): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  if (min && max) {
    return `${formatter.format(min)} - ${formatter.format(max)}`;
  } else if (min) {
    return `From ${formatter.format(min)}`;
  } else if (max) {
    return `Up to ${formatter.format(max)}`;
  }
  return 'Competitive';
}

export function daysSince(date: string | Date): number {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return Math.floor((Date.now() - dateObj.getTime()) / (1000 * 60 * 60 * 24));
}

export interface RoleBadge {
  icon: string;
  text?: string;
  class: string;
  animated?: boolean;
  tooltip?: string;
}

export interface RoleWithApplicationCount {
  id: string;
  created_at: string;
  application_count?: number;
}

/**
 * Calculate if a role should show the "HOT" badge
 * Based on top quartile of application counts among active roles
 * Note: Candidate app shows "hot" badge but not application counts
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
 * Get all badges for a role (for candidate app - no application counts shown)
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
  // Show badge but don't reveal exact numbers to candidates
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
        tooltip: 'High interest role - popular with candidates!',
      });
    }
  }

  return badges;
}
