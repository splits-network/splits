# /memphis:extract - Extract Reusable Component from Showcase

**Category:** Design System
**Description:** Extract a reusable component pattern from Designer Six showcase pages

## Usage

```bash
/memphis:extract <component-name> [source-page]
```

## Parameters

- `<component-name>` - Name of component to extract (e.g., NotificationCard, TabGroup, Timeline)
- `[source-page]` - Optional: Specific showcase page to extract from (default: auto-detect)

## Examples

```bash
/memphis:extract NotificationCard
/memphis:extract TabGroup tabs
/memphis:extract TimelineItem timelines
/memphis:extract FAQAccordion faqs
```

## What It Does

1. Analyzes Designer Six showcase pages for the pattern
2. Identifies reusable component structure
3. Extracts component with Memphis design intact
4. Adds to `packages/memphis-ui/src/components/`
5. Creates TypeScript types and props interface
6. Adds Storybook documentation (if configured)
7. Updates package exports

## Extraction Process

### 1. Identify Pattern
- Searches showcase pages for component usage
- Analyzes structure and props
- Identifies Memphis design patterns

### 2. Extract Component
```tsx
// From: .claude/memphis/showcase/notifications-ui/page.tsx
<div className="card border-4 border-dark bg-cream p-6">
  <div className="flex items-start gap-4">
    <div className="w-12 h-12 bg-coral flex items-center justify-center">
      <i className="fa-regular fa-bell text-dark text-xl"></i>
    </div>
    <div className="flex-1">
      <h3 className="font-bold text-dark mb-2">New Message</h3>
      <p className="text-dark opacity-70">You have a new message from recruiter</p>
    </div>
  </div>
</div>

// To: packages/memphis-ui/src/components/NotificationCard.tsx
export interface NotificationCardProps {
  icon: string;
  iconColor: 'coral' | 'teal' | 'yellow' | 'purple';
  title: string;
  message: string;
  timestamp?: string;
  onDismiss?: () => void;
}

export function NotificationCard({
  icon,
  iconColor,
  title,
  message,
  timestamp,
  onDismiss
}: NotificationCardProps) {
  return (
    <div className="card border-4 border-dark bg-cream p-6 relative">
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 bg-${iconColor} flex items-center justify-center`}>
          <i className={`fa-regular ${icon} text-dark text-xl`}></i>
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-dark mb-2">{title}</h3>
          <p className="text-dark opacity-70">{message}</p>
          {timestamp && (
            <p className="text-xs text-dark opacity-50 mt-2">{timestamp}</p>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="btn btn-sm border-2 border-dark"
            aria-label="Dismiss"
          >
            <i className="fa-regular fa-times"></i>
          </button>
        )}
      </div>
    </div>
  );
}
```

### 3. Update Package
```typescript
// packages/memphis-ui/src/index.ts
export { NotificationCard } from './components/NotificationCard';
export type { NotificationCardProps } from './components/NotificationCard';
```

## Common Extractions

### From Showcase Pages

**notifications-ui**:
- NotificationCard
- NotificationList
- NotificationBadge

**tabs**:
- TabGroup
- TabPanel
- TabContent

**timelines**:
- Timeline
- TimelineItem
- TimelineMilestone

**calendars**:
- Calendar
- CalendarDay
- CalendarEvent

**testimonials**:
- TestimonialCard
- TestimonialCarousel
- RatingStars

**faqs**:
- FAQAccordion
- FAQItem
- FAQCategory

## Memphis Design Preservation

Extracted components maintain:
- ✅ Flat design (no shadows)
- ✅ Sharp corners (border-radius: 0)
- ✅ Thick borders (4px)
- ✅ Memphis color palette
- ✅ Geometric decorations
- ✅ High contrast
- ✅ Accessibility (ARIA labels, keyboard nav)

## Implementation

When invoked:
1. Reads source showcase page
2. Identifies component pattern
3. Extracts to new file in memphis-ui package
4. Adds TypeScript types
5. Updates package exports
6. Runs tests
7. Updates build progress state
