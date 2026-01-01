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

export function getVerificationStatusBadge(status: string): string {
  switch (status) {
    case 'verified':
      return 'badge-success';
    case 'pending':
      return 'badge-warning';
    case 'rejected':
      return 'badge-error';
    default:
      return 'badge-neutral';
  }
}

export function getVerificationStatusIcon(status: string): string {
  switch (status) {
    case 'verified':
      return 'fa-check-circle';
    case 'pending':
      return 'fa-clock';
    case 'rejected':
      return 'fa-times-circle';
    default:
      return 'fa-question-circle';
  }
}

export function getActivityIcon(activity: string): string {
  switch (activity) {
    case 'application_created':
      return 'fa-file-plus';
    case 'stage_changed':
      return 'fa-arrow-right';
    case 'interview_scheduled':
      return 'fa-calendar';
    case 'offer_extended':
      return 'fa-handshake';
    case 'placement_confirmed':
      return 'fa-check-circle';
    case 'user_created':
      return 'fa-user-plus';
    case 'role_created':
      return 'fa-briefcase';
    default:
      return 'fa-info-circle';
  }
}

export function getAlertClass(level: 'high' | 'medium' | 'low'): string {
  switch (level) {
    case 'high':
      return 'alert-error';
    case 'medium':
      return 'alert-warning';
    case 'low':
      return 'alert-info';
    default:
      return 'alert-info';
  }
}

export function getHealthScore(metrics: { success_rate?: number; response_time?: number; error_rate?: number }): number {
  const successScore = (metrics.success_rate || 95) * 0.5;
  const speedScore = Math.max(0, 100 - (metrics.response_time || 200) / 10) * 0.3;
  const errorScore = Math.max(0, 100 - (metrics.error_rate || 1) * 20) * 0.2;
  
  return Math.round(successScore + speedScore + errorScore);
}

export function getJobStatusBadge(status: string): string {
  switch (status) {
    case 'open':
    case 'active':
      return 'badge-success';
    case 'closed':
      return 'badge-neutral';
    case 'paused':
      return 'badge-warning';
    case 'draft':
      return 'badge-info';
    default:
      return 'badge-neutral';
  }
}