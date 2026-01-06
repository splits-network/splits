# Portal UI Utilities Refactoring Summary

## Overview
Successfully refactored embedded utility functions across the portal into centralized, reusable utility modules under `src/lib/utils/`.

## Structure Created

```
src/lib/utils/
├── badge-styles.ts       # Badge color utilities for all statuses
├── icon-styles.ts        # FontAwesome icon mappings
├── date-formatting.ts    # Date/time formatting functions
├── currency-formatting.ts # Money and percentage formatting
├── color-styles.ts       # Background and border color utilities
└── index.ts              # Central export file
```

## Usage

Components can now import utilities in two ways:

### Named imports from index (recommended)
```typescript
import { formatDate, getApplicationStageBadge } from '@/lib/utils';
```

### Direct imports (when needed)
```typescript
import { formatDate } from '@/lib/utils/date-formatting';
```

## Available Utilities

### Badge Styles (`badge-styles.ts`)
- `getApplicationStageBadge(stage)` - Application stage badges
- `getApplicationStageLabel(stage)` - Human-readable stage labels
- `getJobStatusBadge(status)` - Job/role status badges
- `getRelationshipStatusBadge(status)` - Recruiter-candidate relationship badges
- `getVerificationStatusBadge(status)` - Verification status badges
- `getPlacementStatusBadge(status)` - Placement status badges
- `getPriorityBadge(priority)` - Notification priority badges
- `getSyncStatusBadge(status)` - Integration sync status badges
- `getRoleBadge(role)` - Team role badges

### Icon Styles (`icon-styles.ts`)
- `getApplicationStageIcon(stage)` - Application stage icons
- `getPlacementStatusIcon(status)` - Placement status icons
- `getVerificationStatusIcon(status)` - Verification status icons
- `getNotificationIcon(category)` - Notification category icons
- `getActivityIcon(type)` - Activity type icons
- `getServiceHealthIcon(status)` - Service health status icons

### Date Formatting (`date-formatting.ts`)
- `formatDate(date)` - Short format: "Dec 14, 2024"
- `formatDateLong(date)` - Long format: "December 14, 2024"
- `formatDateTime(date)` - With time: "Dec 14, 2024 at 3:45 PM"
- `formatTime(date)` - Time only: "3:45 PM"
- `formatRelativeTime(timestamp)` - Relative: "2 minutes ago"
- `daysBetween(start, end)` - Calculate days between dates
- `daysSince(date)` - Days since a date
- `isWithinDays(date, days)` - Check if within X days

### Currency Formatting (`currency-formatting.ts`)
- `formatCurrency(amount)` - "$150,000"
- `formatCurrencyWithCents(amount)` - "$150,000.50"
- `formatSalaryRange(min, max)` - "$100k - $150k"
- `formatCurrencyShort(amount)` - "$150k" or "$1.5M"
- `formatPercentage(value)` - "15%"

### Color Styles (`color-styles.ts`)
- `getJobStatusBorderColor(status)` - Border colors for job cards
- `getPlacementStatusBgColor(status)` - Background colors for placements
- `getHealthScoreColor(score)` - Text colors for metrics
- `getServiceStatusColor(status)` - Service status colors

## Components Updated

### Fully Migrated
- ✅ `applications-list-client2.tsx` - Using `formatDate` and `getApplicationStageBadge`
- ✅ `application-detail-client.tsx` - Using all application utilities
- ✅ `roles-list.tsx` - Using `getJobStatusBadge` and `getJobStatusBorderColor`

### Partially Migrated
- ⚠️ `candidate-detail-client.tsx` - Imports added, inline functions removed
- ⚠️ Other dashboard and detail components - Need to replace inline references

### Not Yet Migrated
Several components still have embedded utilities that should be updated:
- `company-dashboard.tsx`
- `admin-dashboard.tsx`
- `teams/[id]/page.tsx`
- `invitations-client.tsx`
- `placement-lifecycle.tsx`
- `ownership-badge.tsx`
- Various status pages

## Benefits

1. **Consistency** - All badges, colors, and formats look the same across the app
2. **Maintainability** - Single source of truth for UI styling logic
3. **Testability** - Utilities can be unit tested independently
4. **Reusability** - Import anywhere without copy-paste
5. **Discoverability** - All utilities in one place with documentation
6. **Performance** - No duplicate function definitions across components

## Next Steps

To complete the migration:

1. Update remaining components to import from `@/lib/utils`
2. Remove all inline utility function definitions
3. Add unit tests for utility functions
4. Update TypeScript to enforce using utilities instead of inline definitions
5. Consider adding JSDoc comments to all utility functions

## Migration Guide for Developers

When you encounter inline utility functions in components:

### Before (❌ Don't do this)
```typescript
const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

const getStageColor = (stage: string) => {
    const colors = {
        ai_review: 'badge-warning',
        submitted: 'badge-info',
        // ...
    };
    return colors[stage] || 'badge-ghost';
};
```

### After (✅ Do this)
```typescript
import { formatDate, getApplicationStageBadge } from '@/lib/utils';

// Use directly in JSX
<span>{formatDate(application.created_at)}</span>
<span className={getApplicationStageBadge(application.stage)} />
```

## Notes

- The `ts` file still contains duplicate implementations - consider fully migrating it
- Consider adding a linting rule to prevent inline utility function definitions
- Some components may need custom utilities - add them to appropriate utility files

---

**Last Updated**: December 31, 2024  
**Refactored By**: AI Assistant  
**Files Created**: 6 new utility files
