# Phase 52: Candidate Call Experience - Research

**Researched:** 2026-03-09
**Domain:** Candidate app frontend + notification wiring for call system
**Confidence:** HIGH

## Summary

Phase 52 extends the existing call system into the candidate app (`apps/candidate/`). The entire backend (call-service, API gateway, notification-service) already supports candidates as call participants. The work is purely frontend (candidate app UI) plus notification wiring adjustments to route call links to the candidate app instead of portal for candidate participants.

The candidate app is a mature Next.js app with Clerk auth, using the same `createAuthenticatedClient` API pattern as the portal. It already has a notification system (`/portal/notifications`), dashboard with urgency bar and KPI cards, and application detail panels with split/grid/table views. No new libraries or backend API changes are needed.

**Primary recommendation:** Mirror the portal's call patterns into the candidate app with four focused changes: (1) dashboard "Upcoming Calls" widget, (2) application detail Calls tab, (3) join call page, and (4) notification service adjustments for candidate-facing URLs.

## Standard Stack

No new dependencies required. Everything uses existing codebase patterns:

### Core (already in codebase)
| Library | Purpose | Where Used |
|---------|---------|------------|
| `@clerk/nextjs` | Candidate authentication | `apps/candidate/` throughout |
| `@splits-network/shared-api-client` | API calls to gateway | `apps/candidate/src/lib/api-client.ts` |
| DaisyUI | UI components | All candidate app pages |
| `useStandardList` | Paginated list fetching | `apps/candidate/src/hooks/use-standard-list.ts` |

### Existing APIs (no changes needed)
| Endpoint | Purpose | Auth |
|----------|---------|------|
| `GET /api/v2/calls` | List calls (filtered by participant via RLS) | Clerk JWT |
| `GET /api/v2/calls/:id` | Call detail | Clerk JWT |
| `GET /api/v2/calls/stats` | Call stats (entity-scoped) | Clerk JWT |
| `POST /api/v2/calls/:id/token` | Generate access token for join | Clerk JWT |
| `POST /api/v2/calls/exchange-token` | Exchange token for LiveKit JWT | Public (no auth) |

## Architecture Patterns

### Pattern 1: Dashboard Widget (Mirror Urgency Items)

The candidate dashboard uses a widget-based layout with KPI cards, urgency bar, and content sections. The "Upcoming Calls" widget should follow the existing pattern.

**Dashboard structure:**
```
apps/candidate/src/app/portal/dashboard/
  page.tsx                    -- Page shell with hero header
  components/
    candidate-dashboard.tsx   -- Main dashboard component (orchestrates widgets)
    candidate-urgency-bar.tsx -- Priority alerts
    match-preview-widget.tsx  -- Example of widget pattern
    quick-actions-grid.tsx    -- Quick action cards
```

**Widget pattern:** Each widget is a standalone component receiving data from `useCandidateDashboardData()` or its own hook. The dashboard hook (`use-candidate-dashboard-data.ts`) fetches all data in parallel using `Promise.allSettled`.

**Upcoming Calls widget approach:** Add a new `use-upcoming-calls.ts` hook that fetches `GET /calls?status=scheduled&sort_by=scheduled_at&sort_order=asc&limit=5`. Create an `upcoming-calls-widget.tsx` that renders call cards with title, time, participants, and Join Call button. Integrate into `candidate-dashboard.tsx`.

### Pattern 2: Application Calls Tab (Mirror Portal Pattern)

The portal's `application-calls-tab.tsx` is the reference implementation:
- Uses `useStandardList` with `{ entity_type: "application", entity_id: applicationId }` filters
- Shows entity-scoped stats, search, filters, and a call table
- Includes CallCreationModal for creating new calls

**Candidate version differences:**
- Read-only: No "New Call" button (candidates don't create calls)
- Simplified: No search/filter controls (secondary content in detail panel)
- Entity-scoped: Same `entity_type=application&entity_id=X` filter pattern
- No `CallCreationModal` import needed

**Integration point:** The candidate's `ApplicationDetail` component (`application-detail.tsx`) is a long scrollable panel with sections (header, stats, job description, requirements, documents, notes, timeline). A "Calls" section should be added between "Notes" and "Timeline" following the same section heading pattern:
```tsx
<h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
    Calls
</h3>
```

### Pattern 3: Join Call Page (Mirror Portal Pattern)

The portal's join flow (`apps/portal/src/app/portal/calls/[id]/join/page.tsx`) is simple:
1. Call `POST /calls/{id}/token` to generate access token
2. Redirect to `${NEXT_PUBLIC_VIDEO_APP_URL}/join/${access_token}`

The portal uses `useCreateCall().generateToken()` hook. The candidate app needs the same hook (or a simpler version that only has `generateToken`).

**Key difference:** The candidate app's `NEXT_PUBLIC_VIDEO_APP_URL` should point to `video.applicant.network` (not `video.splits.network`). This is already configured in the Dockerfile.

**Route structure:**
```
apps/candidate/src/app/portal/calls/
  [id]/
    join/
      page.tsx  -- Generate token + redirect to video.applicant.network
```

### Pattern 4: Notification URL Routing

**Current problem:** All call notification URLs (emails + in-app) use `portalUrl` which points to `portal.splits.network`. When a candidate receives a call notification, clicking "Join Call" takes them to the portal app where they don't have access.

**Notification service analysis:**
- `CallsEventConsumer` receives `portalUrl` in constructor (single URL for all participants)
- `CallInAppNotificationService` receives `portalUrl` for action URLs
- Both services iterate over ALL participants and send the same URL to everyone
- `resolveParticipantContacts` resolves user IDs to name+email but doesn't determine user type

**Fix approach:** The notification consumer already has `candidateWebsiteUrl` available (passed to `MatchesEventConsumer`). The fix needs to:
1. Pass `candidateWebsiteUrl` to `CallsEventConsumer` constructor
2. When building notification URLs, determine if participant is a candidate (via `contactLookup` or by checking `users.user_type`)
3. For candidate participants: use `candidateWebsiteUrl/portal/calls/{callId}/join`
4. For portal participants: keep using `portalUrl/portal/calls/{callId}/join`

**Email brand detection:** The `determineBrand()` method already checks for candidate entities in entity links. This can be extended to also check participant user types.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Paginated call list | Custom fetch+pagination | `useStandardList` hook | Already handles loading, error, pagination, filters |
| Token generation | Custom API call | Portal's `useCreateCall().generateToken()` pattern | Proven pattern, handles auth |
| Call card UI | Custom components | DaisyUI card/list patterns | Basel design consistency |
| Notification routing | Separate notification service | Modify existing `CallsEventConsumer` | Single source of truth for call notifications |

## Common Pitfalls

### Pitfall 1: Candidate RLS Access to Calls
**What goes wrong:** Candidate makes API call to `/calls` but gets empty results
**Why it happens:** RLS policies on `calls` table use participant-based access. The candidate must be a `call_participants` record with their internal user_id (not Clerk ID).
**How to avoid:** When recruiters schedule calls with candidates, they must add the candidate as a participant. This is already handled by the call creation flow.
**Warning signs:** Calls appear in portal but not in candidate app for same user.

### Pitfall 2: Join URL Domain Mismatch
**What goes wrong:** Candidate clicks "Join Call" and lands on `video.splits.network` instead of `video.applicant.network`
**Why it happens:** `NEXT_PUBLIC_VIDEO_APP_URL` not configured or defaulting to splits.network
**How to avoid:** Verify `NEXT_PUBLIC_VIDEO_APP_URL=https://video.applicant.network` in candidate app's Dockerfile and K8s deployment. The Dockerfile already has the ARG defined.
**Warning signs:** Candidate sees Splits Network branding in video app instead of Applicant Network.

### Pitfall 3: Notification Links to Wrong App
**What goes wrong:** Candidate receives call email with link to `portal.splits.network/portal/calls/...` which they can't access
**Why it happens:** `CallsEventConsumer` uses single `portalUrl` for all participants
**How to avoid:** Route candidate participants to `candidateWebsiteUrl` URLs in notification service
**Warning signs:** Candidates clicking notification links get redirected to portal login

### Pitfall 4: Application Detail Panel Oversize
**What goes wrong:** Adding Calls section makes the `application-detail.tsx` file exceed 200 lines
**Why it happens:** File is already ~700 lines (near limit concerns for readability)
**How to avoid:** Create `application-calls-section.tsx` as a separate component file. Import and render in the detail panel.
**Warning signs:** File becomes unwieldy, violates 200-line architectural rule.

### Pitfall 5: Missing `calls` Category in Notification Display
**What goes wrong:** Call notifications don't show the phone icon in candidate notification page
**Why it happens:** `getNotificationIcon()` in `apps/candidate/src/lib/notifications.ts` doesn't have a `calls` category case
**How to avoid:** Add `case 'calls': return 'fa-phone';` to the icon function
**Warning signs:** Call notifications show generic bell icon.

## Code Examples

### Upcoming Calls Hook (candidate pattern)
```typescript
// Source: Mirrors use-candidate-dashboard-data.ts pattern
export function useUpcomingCalls() {
    const { getToken } = useAuth();
    const [calls, setCalls] = useState<CallListItem[]>([]);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        try {
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            const res = await client.get('/calls', {
                params: {
                    status: 'scheduled',
                    sort_by: 'scheduled_at',
                    sort_order: 'asc',
                    limit: 5,
                },
            });
            setCalls(res.data || []);
        } catch (err) {
            console.error('[UpcomingCalls] Failed to load:', err);
        } finally {
            setLoading(false);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => { refresh(); }, [refresh]);
    return { calls, loading, refresh };
}
```

### Join Call Page (candidate pattern)
```typescript
// Source: Mirrors apps/portal/src/app/portal/calls/[id]/join/page.tsx
"use client";
export default function JoinCallPage() {
    const { id } = useParams<{ id: string }>();
    // Same pattern as portal but uses VIDEO_APP_URL which points to video.applicant.network
    const videoBaseUrl = process.env.NEXT_PUBLIC_VIDEO_APP_URL || "https://video.applicant.network";
    // Generate token via POST /calls/{id}/token then redirect
}
```

### Notification URL Routing (per-participant)
```typescript
// Source: Extends CallsEventConsumer pattern
private getJoinUrl(callId: string, userId: string, isCandidate: boolean): string {
    const baseUrl = isCandidate ? this.candidateWebsiteUrl : this.portalUrl;
    return `${baseUrl}/portal/calls/${callId}/join`;
}
```

## Key Findings: Candidate App Structure

### Dashboard Integration Points
- `candidate-dashboard.tsx` (577 lines) orchestrates all widgets in sections
- Sections are full-width with `bg-base-100` or `bg-base-200` alternating
- New widget goes between "Match Preview" (Section 2b) and "Pipeline + Momentum" (Section 3) or as a new section
- Widget receives data from its own hook, not the main dashboard hook

### Application Detail Integration Points
- `application-detail.tsx` has `ApplicationDetail` (renders sections) and `DetailLoader` (fetches data)
- Sections: Header > Stats > Warnings > AI Review > Job Description > Requirements > Pre-screen > Documents > Company > Notes > Timeline
- Calls section fits between Notes and Timeline
- Must be extracted as separate component to stay under 200-line files

### Existing Notification Infrastructure
- Candidate app already has `/portal/notifications` page with filtering
- `useCandidateNotifications` hook counts unread notifications
- `getNotificationIcon()` needs `calls` category added
- In-app notifications already appear in the notification bell

### API Gateway
- All `/api/v2/calls/*` routes proxy to call-service with auth headers
- Candidate app uses same gateway (different frontend, same API)
- No gateway changes needed - Clerk auth from candidate app works the same way

## Open Questions

1. **Call creation by candidates?**
   - Current plan: Candidates are read-only (can view and join calls, not create them)
   - The portal's `ApplicationCallsTab` has a "New Call" button with `CallCreationModal`
   - Candidate version should omit this since candidates don't initiate calls
   - If this assumption is wrong, the `CallCreationModal` would need to be ported

2. **Urgency bar integration for upcoming calls?**
   - The urgency bar (`candidate-urgency-bar.tsx`) shows P0/P1/P2 items
   - An upcoming call within 24h could be a P1 urgency item
   - This is an enhancement that could be added but isn't in the success criteria
   - Recommendation: Include it as it's low effort and high value

## Sources

### Primary (HIGH confidence)
- Codebase inspection: `apps/candidate/src/` - full structure analysis
- Codebase inspection: `apps/portal/src/app/portal/calls/` - reference implementation
- Codebase inspection: `services/call-service/src/v2/` - API routes and types
- Codebase inspection: `services/notification-service/src/consumers/calls/` - event handling
- Codebase inspection: `services/api-gateway/src/routes/v2/calls.ts` - gateway routing

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all existing codebase patterns, no new libraries
- Architecture: HIGH - direct code inspection of all integration points
- Pitfalls: HIGH - identified from actual code analysis (RLS, URL routing, file size)

**Research date:** 2026-03-09
**Valid until:** 2026-04-09 (stable - internal codebase patterns)
