# Memphis Status Pages — Documentation

**Created**: 2026-02-16
**Apps**: Portal, Candidate, Corporate
**Design System**: Memphis (SilicaUI/DaisyUI v5 fork)

---

## Overview

The Memphis status pages provide real-time system health monitoring with bold Memphis design language across all three Splits Network apps:

- **Portal** (`apps/portal/src/app/public/status-memphis/`) — Recruiter-focused, Splits Network brand
- **Candidate** (`apps/candidate/src/app/public/status-memphis/`) — Candidate-focused, Applicant Network brand
- **Corporate** (`apps/corporate/src/app/status-memphis/`) — Enterprise-focused, Employment Networks brand

All three share the same design architecture but use brand-differentiated copy and color emphasis.

---

## Architecture

### File Structure

Each app contains three core files:

```
apps/{app}/src/app/{path}/status-memphis/
├── page.tsx                   # Server component - fetches /api/v2/system-health
├── status-memphis-client.tsx  # Client component - UI + state + auto-refresh
└── status-animator.tsx        # GSAP animations (shared across all apps)
```

### Data Flow

1. **Server Component** (`page.tsx`)
   - Fetches system health from `/api/v2/system-health` on initial load
   - Passes initial data to client component as props
   - Revalidates every 15 seconds (`export const revalidate = 15`)

2. **Client Component** (`status-memphis-client.tsx`)
   - Uses `useServiceHealth` hook for auto-refresh (30s interval)
   - Fetches past incidents from `/api/v2/system-health/incidents`
   - Manages all state and UI rendering

3. **Animations** (`status-animator.tsx`)
   - GSAP entrance animations for all sections
   - Scroll-triggered reveals
   - Floating Memphis shapes with continuous animation

---

## Design Patterns

### Hero Banner (Dynamic Background)

The hero section changes background color based on system state:

- **All Healthy** → `bg-teal` (Portal), `bg-teal` (Candidate), `bg-purple` (Corporate)
- **Service Degraded** → `bg-coral` (all apps)
- **Investigating** → `bg-yellow` (all apps)
- **Loading** → `bg-dark` (all apps)

**Memphis Shapes** float continuously using GSAP:
- Circles (`rounded-full`), squares (`rotate-45`), rectangles
- 4px borders on outline shapes (`border-4 border-coral`)
- Solid fill shapes (`bg-teal`, `bg-yellow`, `bg-purple`)

### Metrics Grid

Four metrics displayed in bordered cards with Memphis accent colors:
- **Services Healthy** — Shows `{healthy}/{total}` count (border-teal)
- **Avg Response** — Average response time in ms (border-coral)
- **Uptime** — Percentage uptime (border-yellow)
- **Auto-Refresh** — Shows 30s refresh interval (border-purple)

### Service Grid

Services displayed as cards with **accent color cycling**:
- Each service gets a rotating accent (coral → teal → yellow → purple)
- 4px border in accent color (`border-coral`, `border-teal`, etc.)
- Corner decoration square in accent color
- Status badge using Memphis badge classes (`badge badge-teal`, etc.)

### Incident Feed

**Active Incidents**:
- Bold Memphis alert cards with 4px coral border
- Corner accent decoration
- Icon + service name + error message
- Active badge

**No Incidents** (Empty State):
- Celebrate with teal/purple accent
- "No Active Incidents" / "Nothing To Report" / "Zero Active Incidents"
- Positive messaging

**Past Incidents**:
- Purple-bordered cards
- Timeline format with resolved badge
- Duration shown in seconds/minutes

---

## Memphis Compliance

### ✅ Design Rules (STRICT)

1. **ZERO shadows** — No `shadow-`, `drop-shadow`, or blur effects
2. **ZERO rounded corners** — Only `rounded-full` for perfect circles
3. **4px borders ONLY** — `border-4` or `border-memphis` for containers
4. **Memphis palette via Tailwind** — `bg-coral`, `bg-teal`, `bg-yellow`, `bg-purple`, `bg-dark`, `bg-cream`
5. **NO inline hex colors** — Never `style={{ backgroundColor: "#FF6B6B" }}`
6. **NO color constant objects** — Never `const M = { coral: "#FF6B6B" }`
7. **Opacity via Tailwind** — `text-white/70` NOT `rgba(255,255,255,0.7)`
8. **Minimum text size** — `text-xs` minimum, `text-base` for body copy

### Memphis Tailwind Classes

**Backgrounds**:
```tsx
bg-coral    // #FF6B6B
bg-teal     // #4ECDC4
bg-yellow   // #FFE66D
bg-purple   // #A78BFA
bg-dark     // #1A1A2E
bg-cream    // #F5F0EB
```

**Text Colors**:
```tsx
text-coral
text-teal
text-yellow
text-purple
text-dark
text-cream
text-white
```

**Borders**:
```tsx
border-4 border-coral
border-4 border-teal
border-4 border-yellow
border-4 border-purple
border-4 border-dark
```

**Badges**:
```tsx
badge badge-coral
badge badge-teal
badge badge-yellow
badge badge-purple
```

**Buttons**:
```tsx
btn btn-coral btn-md
btn btn-teal btn-md
btn btn-outline-white btn-md
```

---

## Brand Differentiation

### Portal (Splits Network)

**Tone**: Direct, professional, action-oriented
**Primary Accent**: Coral
**Hero States**:
- Healthy: "ALL SYSTEMS OPERATIONAL"
- Degraded: "INVESTIGATING SERVICE DEGRADATION"
- Loading: "CHECKING SYSTEM STATUS"

**Copy Examples**:
- "Recruiter dashboards, pipelines, automations, and AI review signals are green."
- "We detected a hiccup. Follow the incident card below or ping us at help@splits.network."
- "We're mitigating the issue. Updates every 10 minutes."

**Email**: help@splits.network

---

### Candidate (Applicant Network)

**Tone**: Reassuring, clear, candidate-focused
**Primary Accent**: Teal
**Hero States**:
- Healthy: "EVERYTHING'S RUNNING SMOOTH"
- Degraded: "ONE SERVICE RUNNING SLOW"
- Loading: "DOUBLE-CHECKING EVERYTHING"

**Copy Examples**:
- "Your profile, applications, and recruiter connections are all green."
- "We spotted an issue. Your profile and applications are safe."
- "We're on it. This won't take long."

**Empty State**: "Nothing To Report. Everything's green. You're good to go."

**Email**: help@applicant.network

---

### Corporate (Employment Networks)

**Tone**: Confident, SLA-aware, enterprise-appropriate
**Primary Accent**: Purple
**Hero States**:
- Healthy: "FULL SYSTEM HEALTH"
- Degraded: "DEGRADED PERFORMANCE DETECTED"
- Loading: "ANOMALY DETECTION IN PROGRESS"

**Copy Examples**:
- "Platform infrastructure, marketplace services, and network integrations are operational."
- "Service experiencing elevated response times. The issue is isolated."
- "Engineering team deployed. Status updates in 10-minute intervals."

**Empty State**: "Zero Active Incidents. Full operational status across all infrastructure tiers."

**Email**: enterprise@employment-networks.com

---

## GSAP Animation Strategy

### Animation Constants (Shared)

```ts
const D = { fast: 0.3, normal: 0.5, slow: 0.8, hero: 1.0 };
const E = {
    smooth: "power2.out",
    bounce: "back.out(1.7)",
    elastic: "elastic.out(1, 0.4)",
};
const S = { tight: 0.06, normal: 0.1, loose: 0.15 };
```

### Animation Sequence

1. **Memphis Shapes** — Elastic bounce in from scale 0, then continuous float
2. **Hero Content** — Badge → Headline → Subtext → Timestamp (cascading)
3. **Metrics Grid** — Stagger fade + scale bounce
4. **Service Cards** — Scroll-triggered stagger entrance
5. **Incident Cards** — Slide in from left
6. **Past Incidents** — Cascade down timeline

### Reduced Motion Support

```ts
if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    gsap.set(containerRef.current.querySelectorAll("[class*='opacity-0']"), { opacity: 1 });
    return;
}
```

---

## Maintenance

### Updating Copy

Copy is defined in the `heroState` useMemo hook in each `status-memphis-client.tsx`:

```tsx
const heroState = useMemo(() => {
    if (isLoading) {
        return {
            headline: "YOUR HEADLINE HERE",
            subtext: "Your description here.",
            bgColor: "bg-dark",
            textColor: "text-cream",
            badgeColor: "bg-purple",
            badgeText: "text-white",
        };
    }
    // ... more states
}, [isLoading, allHealthy, someUnhealthy]);
```

**To update**:
1. Locate the appropriate state block (isLoading, allHealthy, someUnhealthy, or fallback)
2. Update `headline` and/or `subtext`
3. Ensure copy matches brand voice (see Brand Differentiation section)

### Adding New Services

Services are automatically pulled from `/api/v2/system-health`. No code changes needed.

The service grid uses accent cycling — new services automatically get assigned the next accent color in the rotation.

### Updating Accent Colors

Accent cycling is defined at the top of each client file:

```ts
const ACCENT_COLORS = ['coral', 'teal', 'yellow', 'purple'] as const;
const accentAt = (idx: number) => ACCENT_COLORS[idx % 4];
```

To change the rotation order, reorder the array. Keep it to 4 colors.

---

## Testing

### Manual Testing Checklist

- [ ] Hero banner changes color by state (healthy/degraded/loading)
- [ ] Memphis shapes animate smoothly (elastic bounce + continuous float)
- [ ] Metrics grid shows correct counts
- [ ] Service cards cycle through accent colors correctly
- [ ] Status badges use Memphis colors (teal/coral/yellow)
- [ ] Active incidents display with coral borders
- [ ] Empty state shows when no incidents
- [ ] Past incidents display in timeline format
- [ ] Auto-refresh works (check console for 30s intervals)
- [ ] Reduced motion preference is respected
- [ ] All text is readable (minimum text-xs)
- [ ] NO hardcoded hex colors anywhere
- [ ] NO inline styles for visual properties
- [ ] NO shadows or rounded corners (except circles)

### Visual Regression Testing

Compare against design specs:
- **Color accuracy**: Use browser DevTools to verify Memphis colors
- **Border widths**: All containers use 4px borders
- **Typography**: Headlines use `font-black uppercase`, body uses `text-base`
- **Spacing**: Check padding/margins match Memphis scale

---

## Performance

### Optimization Notes

- Server-side rendering for initial load (no flash of unstyled content)
- 15-second server-side revalidation
- 30-second client-side auto-refresh
- GSAP animations are GPU-accelerated (transform/opacity only)
- Incident history limited to 10 most recent items

### Monitoring

- Track `/api/v2/system-health` response times
- Monitor GSAP animation performance (should be 60fps)
- Check for layout shifts during loading states

---

## Future Enhancements

### Potential Features

1. **Real-time WebSocket Updates** — Replace 30s polling with live updates
2. **Incident Subscriptions** — Email/SMS alerts for service degradation
3. **Historical Uptime Charts** — 7-day/30-day uptime visualization
4. **SLA Tracking** — Display SLA compliance metrics (corporate only)
5. **Status RSS Feed** — Auto-generated feed for incident notifications
6. **Mobile App Integration** — Push notifications for incidents

### Design Enhancements

1. **Service Icons** — Add unique icons for each service (currently generic)
2. **Severity Levels** — Distinguish between minor/major/critical incidents
3. **Estimated Resolution Time** — Show ETA for incident resolution
4. **Incident Details Modal** — Expandable cards with full incident timeline
5. **Dark Mode** — Memphis dark theme variant

---

## Troubleshooting

### Common Issues

**Issue**: Memphis shapes not animating
**Fix**: Check that GSAP is installed (`pnpm install gsap @gsap/react`)

**Issue**: Wrong colors displaying
**Fix**: Verify Memphis UI package is built (`pnpm --filter @splits-network/memphis-ui build`)

**Issue**: Inline hex colors still present
**Fix**: Run compliance check: `grep -r "#FF6B6B\|#4ECDC4\|#FFE66D\|#A78BFA\|#1A1A2E" apps/*/src/app/**/status-memphis/`

**Issue**: Animations laggy on mobile
**Fix**: GSAP animations use transform/opacity (GPU-accelerated). Check for large DOM trees or slow network.

---

## References

- **Design Spec**: `.claude/teams/status-memphis-redesign/design-spec.md`
- **Copy Spec**: `.claude/teams/status-memphis-redesign/copy-spec.md`
- **Memphis UI Package**: `packages/memphis-ui/`
- **Showcase Pages**: `apps/corporate/src/app/showcase/articles/six/`
- **API Endpoint**: `services/health-monitor/` (system-health service)

---

## Credits

**Design**: Memphis Design System (Designer Six aesthetic)
**Implementation**: Memphis Orchestrator + Team
**Animation Pattern**: Based on articles/six showcase reference
**Voice**: Designer Six (bold, disruptive, confident)

---

**Last Updated**: 2026-02-16
**Maintained By**: Memphis Design Team
