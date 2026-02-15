# extract-component

Extract a reusable component from Designer Six showcase pages.

## Usage

This skill is invoked to extract patterns from showcase pages into the memphis-ui package.

## Process

1. **Identify Pattern**
   - Analyze showcase page for component
   - Identify props and variants
   - Determine reusability

2. **Extract Code**
   - Copy component structure
   - Abstract hardcoded values to props
   - Add TypeScript types

3. **Create Component File**
   - Write to `packages/memphis-ui/src/components/<ComponentName>.tsx`
   - Add proper TypeScript interfaces
   - Include JSDoc comments
   - Preserve Memphis design

4. **Update Exports**
   - Add to `packages/memphis-ui/src/index.ts`
   - Export component and types

5. **Test**
   - Verify component builds
   - Check TypeScript types
   - Ensure Memphis compliance

## Example Extraction

### From Showcase
```tsx
// apps/corporate/src/app/showcase/notifications-ui/page.tsx
<div className="card border-4 border-dark bg-cream p-6">
  <div className="flex items-start gap-4">
    <div className="w-12 h-12 bg-coral flex items-center justify-center">
      <i className="fa-regular fa-bell text-dark text-xl"></i>
    </div>
    <div className="flex-1">
      <h3 className="font-bold text-dark mb-2">New Message</h3>
      <p className="text-dark opacity-70">You have a message</p>
    </div>
  </div>
</div>
```

### To Component
```tsx
// packages/memphis-ui/src/components/NotificationCard.tsx
export interface NotificationCardProps {
  /** FontAwesome icon class (e.g., "fa-bell") */
  icon: string;
  /** Memphis color for icon background */
  iconColor: 'coral' | 'teal' | 'yellow' | 'purple';
  /** Notification title */
  title: string;
  /** Notification message */
  message: string;
  /** Optional timestamp */
  timestamp?: string;
  /** Optional dismiss handler */
  onDismiss?: () => void;
}

/**
 * Memphis-styled notification card with icon, title, and message.
 * Follows flat design principles with thick borders and Memphis colors.
 */
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
            aria-label="Dismiss notification"
          >
            <i className="fa-regular fa-times"></i>
          </button>
        )}
      </div>
    </div>
  );
}
```

### Update Index
```tsx
// packages/memphis-ui/src/index.ts
export { NotificationCard } from './components/NotificationCard';
export type { NotificationCardProps } from './components/NotificationCard';
```

## Common Extractions

| Showcase Page | Components to Extract |
|---------------|----------------------|
| notifications-ui | NotificationCard, NotificationList, NotificationBadge |
| tabs | TabGroup, TabPanel |
| timelines | Timeline, TimelineItem |
| calendars | Calendar, CalendarDay, CalendarEvent |
| testimonials | TestimonialCard, TestimonialCarousel |
| faqs | FAQAccordion, FAQItem |

## Quality Checklist

- [ ] Component abstracted with props
- [ ] TypeScript types defined
- [ ] JSDoc comments added
- [ ] Memphis design preserved
- [ ] No shadows, rounded corners, gradients
- [ ] 4px borders maintained
- [ ] Accessibility included (ARIA labels)
- [ ] Exported from index.ts
- [ ] Component builds successfully

## Output

Report extraction result:
```
✅ Component extracted: NotificationCard
- Source: apps/corporate/src/app/showcase/notifications-ui/page.tsx
- Destination: packages/memphis-ui/src/components/NotificationCard.tsx
- Props: 6 (icon, iconColor, title, message, timestamp, onDismiss)
- TypeScript: ✓
- Memphis compliant: ✓
- Exported: ✓
```
