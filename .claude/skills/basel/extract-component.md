# extract-component

Extract reusable components from Designer One showcase pages for Basel design system. Consolidated skill that handles ALL showcase page types via dynamic lookup.

## Usage

This skill is invoked by `basel-orchestrator` or `basel-designer` to extract reusable component patterns from any Designer One showcase page.

## Showcase Source Lookup

Dynamically select the correct Designer One showcase based on the component category:

| Category | Showcase Source |
|----------|----------------|
| Headers/navigation | `showcase/headers/one/page.tsx` |
| Footers | `showcase/footers/one/page.tsx` |
| Landing/hero sections | `showcase/landing/one/page.tsx` |
| Cards | `showcase/cards/one/page.tsx` |
| Dashboards/analytics | `showcase/dashboards/one/page.tsx` |
| Tables/data grids | `showcase/tables/one/page.tsx` |
| Forms/inputs | `showcase/forms/one/page.tsx` |
| Detail views | `showcase/details/one/page.tsx` |
| Pricing | `showcase/pricing/one/page.tsx` |
| Modals/dialogs | `showcase/modals/one/page.tsx` |
| Profiles | `showcase/profiles/one/page.tsx` |
| Settings | `showcase/settings/one/page.tsx` |
| Notifications | `showcase/notifications-ui/one/page.tsx` |
| Tabs | `showcase/tabs/one/page.tsx` |
| Testimonials | `showcase/testimonials/one/page.tsx` |
| FAQs | `showcase/faqs/one/page.tsx` |
| Timelines | `showcase/timelines/one/page.tsx` |
| Calendars | `showcase/calendars/one/page.tsx` |
| Articles | `showcase/articles/one/page.tsx` |

All showcase paths are relative to `apps/corporate/src/app/`.

## Process

1. **Identify Component**
   - Read the target showcase page
   - Identify the reusable component pattern
   - Analyze structure, props, and styling

2. **Extract Component**
   - Create standalone component file
   - Define TypeScript props interface
   - Use DaisyUI semantic tokens for all colors
   - Ensure sharp corners (no rounded-*)
   - Include editorial patterns (border-left accents, typography hierarchy)

3. **Place Component (CRITICAL — two tiers only)**
   - **Shared (2+ apps)** → `packages/basel-ui/src/{category}/{ComponentName}.tsx` → import as `@splits-network/basel-ui`
   - **App-local (1 app)** → `apps/{app}/src/components/basel/{ComponentName}.tsx` → import as `@/components/basel/...`
   - **NEVER** place in `packages/shared-ui/`, `apps/{app}/src/components/` root, or `{feature}-basel/components/`

4. **Update Exports**
   - If in `packages/basel-ui/`: add to category barrel (`src/{category}/index.ts`) and root barrel (`src/index.ts`)
   - If app-local: just export from the file
   - Run `pnpm --filter @splits-network/basel-ui build` after adding to the package
   - Verify TypeScript compilation

## Component Extraction Rules

### Color System
```tsx
// CORRECT — DaisyUI semantic tokens
<div className="bg-primary text-primary-content">
<button className="btn btn-secondary">
<span className="badge badge-accent">

// WRONG — Memphis or raw colors
<div className="bg-coral text-cream">
<span className="bg-blue-500">
```

### Sharp Corners
```tsx
// CORRECT — no border-radius
<div className="card card-bordered bg-base-100">

// WRONG — rounded corners
<div className="card rounded-lg">
```

### Editorial Patterns
```tsx
// Kicker + heading
<div className="border-l-4 border-primary pl-4">
  <span className="text-sm uppercase tracking-[0.2em] text-primary font-medium">{kicker}</span>
  <h3 className="text-xl font-bold text-base-content tracking-tight">{title}</h3>
</div>

// Border-left accent card
<div className="card card-bordered bg-base-100 border-l-4 border-primary shadow-sm">
  <div className="card-body">{children}</div>
</div>
```

## Example Extraction

### From: `showcase/cards/one/page.tsx`
### To: `apps/portal/src/components/basel/BaselStatCard.tsx`

```tsx
interface BaselStatCardProps {
    kicker: string;
    value: string | number;
    label: string;
    trend?: { value: number; direction: 'up' | 'down' };
    accentColor?: 'primary' | 'secondary' | 'accent' | 'info';
}

export function BaselStatCard({
    kicker,
    value,
    label,
    trend,
    accentColor = 'primary',
}: BaselStatCardProps) {
    return (
        <div className={`card card-bordered bg-base-100 border-l-4 border-${accentColor} shadow-sm`}>
            <div className="card-body p-5">
                <span className={`text-sm uppercase tracking-[0.2em] text-${accentColor} font-medium`}>
                    {kicker}
                </span>
                <div className="text-3xl font-black tracking-tight text-base-content">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-base-content/60">{label}</span>
                    {trend && (
                        <span className={`text-sm font-semibold ${
                            trend.direction === 'up' ? 'text-success' : 'text-error'
                        }`}>
                            {trend.direction === 'up' ? '+' : ''}{trend.value}%
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
```

## Quality Checklist

- [ ] DaisyUI semantic tokens only (no Memphis colors, no raw palette, no hex)
- [ ] Sharp corners (no rounded-*)
- [ ] TypeScript props interface defined
- [ ] Exported correctly from file
- [ ] Component placed in correct location (`packages/basel-ui/` or `components/basel/`)
- [ ] If in `packages/basel-ui/`: barrel exports updated, `tsc -b` passes
- [ ] NOT in `packages/shared-ui/`, NOT in components root, NOT in `{feature}-basel/components/`
- [ ] Editorial patterns included where appropriate
- [ ] Component is self-contained (no external page dependencies)
- [ ] Accessibility: proper ARIA labels, keyboard navigation

## Output

Report extraction result:
```
Component extracted: BaselStatCard
- Source: showcase/cards/one/page.tsx
- Target: apps/portal/src/components/basel/BaselStatCard.tsx
- Props: kicker, value, label, trend?, accentColor?
- Color system: DaisyUI semantic tokens (100% compliant)
- Pattern: border-left accent card with kicker + value
```
