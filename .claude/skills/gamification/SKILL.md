---
name: gamification
description: Gamification system patterns — badges, XP, levels, streaks, leaderboards. Service structure, batch fetching, UI integration, and adding new gamification features.
---

# /gamification - Gamification System Patterns

On-demand reference for the full gamification stack: backend service, shared UI package, API gateway integration, and frontend consumption.

## Architecture Overview

```
services/gamification-service/     — Fastify microservice (port 3018)
packages/shared-gamification/      — Shared React components, hooks, types
services/api-gateway/src/routes/v2/gamification.ts — Gateway proxy routes
apps/portal/src/providers/gamification-wrapper.tsx  — Portal provider
apps/candidate/src/providers/gamification-wrapper.tsx — Candidate provider
```

## Domain Modules

| Module | Tables | Service file | Key endpoints |
|--------|--------|-------------|---------------|
| Badge definitions | `badge_definitions` | `v2/badges/definitions/` | CRUD `/api/v2/badges/definitions` |
| Badge awards | `badges_awarded` | `v2/badges/awards/` | GET `/api/v2/badges/awards`, `/awards/batch` |
| Badge progress | `badge_progress` | `v2/badges/progress/` | GET `/api/v2/badges/progress` |
| XP & levels | `xp_ledger`, `entity_levels`, `level_thresholds`, `xp_rules` | `v2/xp/` | GET `/api/v2/xp/level`, `/levels/batch`, `/history`, `/rules`, `/thresholds` |
| Streaks | `entity_streaks` | `v2/streaks/` | GET `/api/v2/streaks` (auth required) |
| Leaderboards | `leaderboard_entries` | `v2/leaderboards/` | GET `/api/v2/leaderboards`, `/rank` |

## Service File Structure (per module)

```
services/gamification-service/src/v2/<module>/
  types.ts        — Domain interfaces, filter types
  repository.ts   — Supabase CRUD
  service.ts      — Business logic, event publishing
  routes.ts       — Fastify route handlers
```

Canonical example: `services/gamification-service/src/v2/xp/`

## Key Types

```typescript
// Entity types used across all gamification
type BadgeEntityType = 'recruiter' | 'candidate' | 'company' | 'firm'

// Badge definition criteria (JSONB)
interface BadgeCriteria {
    all?: ConditionClause[]  // AND
    any?: ConditionClause[]  // OR
}
interface ConditionClause {
    field: string            // dot-notation for nested fields
    operator: 'equals' | 'not_equals' | 'contains' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'exists'
    value?: any
}

// XP source types (used in xp_rules and xp_ledger)
type XpSourceType = 'placement_completed' | 'application_submitted' | 'candidate_hired'
    | 'response_sent' | 'profile_completed' | 'split_completed'
    | 'review_received' | 'streak_bonus' | 'referral_bonus'
    | 'first_placement' | 'milestone_bonus'
```

## Frontend Types (packages/shared-gamification/src/types.ts)

```typescript
interface EntityLevelInfo {
    entity_type, entity_id: string
    total_xp, current_level, xp_to_next_level: number
    title: string  // from level_thresholds, e.g. "Rising Star"
}

interface BadgeAward {
    id, badge_definition_id, entity_type, entity_id, awarded_at: string
    metadata: Record<string, any>
    badge_definition: { slug, name, description, icon, color, tier: string | null }
}
```

## Shared Components (packages/shared-gamification/src/components/)

| Component | Props | Usage |
|-----------|-------|-------|
| `LevelBadge` | `level: EntityLevelInfo, size?: "sm" \| "md"` | Compact badge with star + level number |
| `BadgeGrid` | `badges: BadgeAward[], maxVisible?: number` | 2-col grid of earned badges |
| `XpLevelBar` | `level: EntityLevelInfo, compact?: boolean` | XP progress bar with level info |
| `BadgeProgressCard` | `progress: BadgeProgressItem` | Single badge progress indicator |
| `StreakIndicator` | `streaks: EntityStreakInfo[]` | Active streak display |
| `LeaderboardRow` | `entry, isCurrentUser?, displayName?, avatarUrl?` | Single leaderboard row |

## Batch Fetching Pattern (List Views)

The `GamificationProvider` context handles batch-fetching gamification data for lists.

### How it works

1. Provider wraps the app (in root layout via `GamificationWrapper`)
2. List page calls `registerEntities("recruiter", recruiterIds)` after data loads
3. Provider debounces 50ms, then batch-fetches `/xp/levels/batch` and `/badges/awards/batch`
4. Individual cards call `getLevel(entityId)` / `getBadges(entityId)` from context

### Integration pattern (list page)

```typescript
import { useGamification } from "@splits-network/shared-gamification";

const { registerEntities } = useGamification();

useEffect(() => {
    if (recruiters.length > 0) {
        registerEntities("recruiter", recruiters.map(r => r.id));
    }
}, [recruiters, registerEntities]);
```

### Integration pattern (card component)

```typescript
const { getLevel } = useGamification();
const level = getLevel(recruiter.id);

// Render — always guard with nullish check
{level && <LevelBadge level={level} size="sm" />}
```

### Alternative: useGamificationBatch (standalone hook)

For pages that don't use the provider context:

```typescript
import { useGamificationBatch } from "@splits-network/shared-gamification";

const { levels, badges, loading } = useGamificationBatch("recruiter", recruiterIds, client);
const level = levels.get(recruiterId);
```

## Profile Page Pattern (Single Entity)

Profile pages fetch directly instead of using the batch context:

```typescript
const [badgeRes, levelRes] = await Promise.allSettled([
    client.get<{ data: BadgeAward[] }>("/badges/awards", {
        params: { entity_type: "recruiter", entity_id: recruiter.id }
    }),
    client.get<{ data: EntityLevelInfo }>("/xp/level", {
        params: { entity_type: "recruiter", entity_id: recruiter.id }
    }),
]);
```

## API Gateway Auth Model

Public GET endpoints use `optionalAuth()` — the global auth hook in `services/api-gateway/src/index.ts` has a skip list for gamification routes.

**CRITICAL:** When adding new public gamification endpoints, you MUST add them to the auth skip list in `services/api-gateway/src/index.ts`. Search for `"gamification"` to find the skip block. Without this, the global `onRequest` hook rejects unauthenticated requests before the route's `optionalAuth()` preHandler runs.

Current skip patterns:
```
/api/v2/badges/*   — all badge GET endpoints
/api/v2/xp/*       — all XP GET endpoints
/api/v2/leaderboards — leaderboard GET endpoints
```

NOT skipped (requires auth): `/api/v2/streaks`

## Event Consumer

`services/gamification-service/src/v2/consumer.ts` subscribes to RabbitMQ domain events:

- `placement.completed` — awards XP to recruiters + candidate + company, records streaks
- `application.created` — awards XP to candidate
- `reputation.updated` — triggers badge evaluation for recruiter
- `recruiter.updated` — triggers badge evaluation
- `candidate.updated` — triggers badge evaluation

Processing pipeline per event:
1. Award XP to all affected entities (via EVENT_MAP)
2. Record streak activity
3. Find badge definitions triggered by this event
4. Evaluate criteria against entity data → award or revoke badges

## Adding a New Badge Definition

1. **Create migration** with INSERT into `badge_definitions`:
   ```sql
   INSERT INTO badge_definitions (slug, name, description, entity_type, icon, color, tier, criteria, trigger_events, data_source, xp_reward, display_order)
   VALUES ('speed-demon', 'Speed Demon', 'Complete 5 placements in 30 days', 'recruiter',
           'fa-duotone fa-regular fa-rocket', 'text-warning', 'gold',
           '{"all": [{"field": "recent_placements_30d", "operator": "gte", "value": 5}]}',
           '{placement.completed}', 'recruiter_reputation', 50, 20);
   ```
2. **Ensure `data_source` table** has the field referenced in criteria
3. **Ensure `trigger_events`** match events the consumer subscribes to
4. Badge evaluation runs automatically when trigger events fire

## Adding a New XP Rule

1. **Create migration** with INSERT into `xp_rules`:
   ```sql
   INSERT INTO xp_rules (source, entity_type, base_points, max_per_day, active)
   VALUES ('referral_bonus', 'recruiter', 100, 3, true);
   ```
2. **Add source to EVENT_MAP** in `consumer.ts` if triggered by a new event
3. XP award runs automatically when the mapped event fires

## Adding a New Streak Type

1. Add streak recording in `consumer.ts` EVENT_MAP entry: `{ streakType: "my_new_streak" }`
2. Add display label in `StreakIndicator` component's label map
3. No migration needed — `streak_type` is freeform text

## Database Gotchas

- **`badge_progress.percentage`** is a `GENERATED ALWAYS AS STORED` column — never INSERT/UPDATE it
- **`badges_awarded`** uses upsert — re-awarding resets `revoked_at`, deduped by `(badge_definition_id, entity_type, entity_id)`
- **`level_thresholds`** cached in-memory by XpService — restart service after updating
- **`leaderboard_entries`** materialized by scheduler (1-hour interval), not real-time
- **Batch endpoints** accept `entity_ids` as comma-separated query param, max 100 IDs

## Non-Critical Failure Pattern

All gamification fetching uses `Promise.allSettled` with silent `catch {}`. Gamification data never blocks UI rendering. This is intentional — always maintain this pattern.

## FetchClient Interface

The shared package defines a duck-typed interface — any API client matching this shape works:

```typescript
interface FetchClient {
    get<T = any>(endpoint: string, options?: { params?: Record<string, any> }): Promise<T>;
}
```

Both apps pass their own client instances. Portal uses `createUnauthenticatedClient()` (gamification is public data).
