/**
 * Central export file for all utility functions
 * 
 * This provides a single import point for all utilities:
 * import { formatDate, getApplicationStageBadge } from '@/lib/utils';
 */

// Badge utilities
export {
    getApplicationStageBadge,
    getApplicationStageLabel,
    getJobStatusBadge,
    getRelationshipStatusBadge,
    getVerificationStatusBadge,
    getPlacementStatusBadge,
    getPriorityBadge,
    getSyncStatusBadge,
    getRoleBadge,
    getAlertClass,
    getPlatformBadge,
} from './badge-styles';

// Icon utilities
export {
    getApplicationStageIcon,
    getPlacementStatusIcon,
    getVerificationStatusIcon,
    getNotificationIcon,
    getActivityIcon,
    getServiceHealthIcon,
    getPlatformIcon,
} from './icon-styles';

// Date utilities
export {
    formatDate,
    formatDateLong,
    formatDateTime,
    formatTime,
    formatRelativeTime,
    daysBetween,
    daysSince,
    isWithinDays,
} from './date-formatting';

// Currency utilities
export {
    formatCurrency,
    formatCurrencyWithCents,
    formatSalaryRange,
    formatCurrencyShort,
    formatPercentage,
} from './currency-formatting';

// Color utilities
export {
    getJobStatusBorderColor,
    getApplicationStageBgColor,
    getApplicationStageBorderColor,
    getPlacementStatusBgColor,
    getHealthScoreColor,
    getHealthScore,
    getServiceStatusColor,
} from './color-styles';

// Role badge utilities
export {
    getRoleBadges,
    isHotRole,
    renderRoleBadge,
    type RoleBadge,
    type RoleWithApplicationCount,
} from './role-badges';
