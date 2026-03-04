# Activity Tracking & Entity Insights

## Problem

Recruiters, companies, and candidates have no visibility into engagement with their content. There's no way to know:
- How many people viewed a role posting
- Who's looking at a recruiter's profile
- Whether a candidate's profile is getting traction
- How a company's roles are performing relative to each other

## Current State

### What Exists (Solid Foundation)

| Layer | Status |
|---|---|
| `analytics.events` | Raw event stream from RabbitMQ — every `application.*`, `placement.*`, `job.*`, `candidate.*`, `recruiter.*` event stored with `entity_type`, `entity_id`, metadata |
| `analytics.metrics_hourly/daily/monthly` | Pre-aggregated metric counters with rollup cron jobs |
| `recruiter_activity` | Public-facing activity feed — **recruiter-scoped only** (placement_created, company_connected, etc.) |
| `application_audit_log` | Full audit trail for application actions (viewed, stage_changed, etc.) |
| Stats service | Real-time stats for recruiter, company, and platform scopes |
| Charts service | Time-series chart data (recruiter-activity, application-trends, etc.) |
| Real-time WebSocket | Analytics gateway fans out dashboard updates via Redis pub/sub |
| Gamification | Already uses polymorphic `(entity_type, entity_id)` across recruiters, candidates, companies, firms |
| Heartbeat endpoint | `POST /api/public/activity/heartbeat` fully built in analytics-service, but no frontend caller |

### What's Missing

1. **View/impression tracking** — No way to know who viewed a role, candidate profile, or company page. No `view_count` columns anywhere.
2. **Entity-agnostic activity log** — `recruiter_activity` only covers recruiters. Companies, candidates, and roles have no equivalent.
3. **Role activity feed** — No "Recruiter X viewed your role", "5 candidates applied this week", "Role trending in searches".
4. **Candidate activity feed** — No "Your profile was viewed 12 times", "Matched to 3 new roles".
5. **Company activity feed** — No "Your roles received 20 applications", "3 new recruiters connected".
6. **Frontend heartbeat sender** — Backend is ready but no frontend code calls it.

## Proposed Design

### Two Systems

#### 1. View/Impression Tracking (high-volume, write-heavy)

Track when someone views a role detail page, candidate profile, company page, or recruiter profile.

**New table: `analytics.entity_views`**
```
entity_type   — 'role' | 'recruiter' | 'candidate' | 'company'
entity_id     — UUID of the viewed entity
viewer_id     — identity user ID (nullable for anonymous)
viewer_type   — 'recruiter' | 'company_user' | 'candidate' | 'anonymous'
source        — 'search_results' | 'direct_link' | 'recommendation' | 'shared_link'
app           — 'portal' | 'candidate' | 'corporate'
created_at
```

**Rollup table: `analytics.entity_view_counts_daily`**
```
entity_type, entity_id, view_date, total_views, unique_viewers
```

Design considerations:
- Deduplicate per viewer per entity per day (don't count 10 page refreshes as 10 views)
- Batch writes — collect on the frontend, send in periodic batches (or piggyback on heartbeat)
- Rollup via cron job (fits existing hourly/daily rollup pattern)
- Raw views retained for N days (30? 90?), rolled-up counts kept indefinitely

#### 2. Entity Activity Feed (event-driven, human-readable)

Generalize `recruiter_activity` into an entity-agnostic system using the polymorphic `(entity_type, entity_id)` pattern from gamification.

**New table: `public.entity_activity`**
```
id, entity_type, entity_id, activity_type, description,
related_entity_type, related_entity_id,
actor_id, actor_type,
metadata (jsonb), created_at
```

Activity types per entity:

**Role:**
- `application_received` — "New application from [candidate] via [recruiter]"
- `candidate_matched` — "AI matched [candidate] (92% score)"
- `stage_advanced` — "[Candidate] moved to Interview stage"
- `view_milestone` — "Your role reached 50 views this week"
- `role_shared` — "[Recruiter] shared this role"
- `placement_created` — "Placement started for [candidate]"

**Company:**
- `role_published` — "New role posted: [title]"
- `recruiter_connected` — "[Recruiter] connected as sourcer"
- `application_received` — "New application on [role]"
- `placement_completed` — "Placement completed for [role]"
- `view_milestone` — "Company profile reached 100 views this month"

**Recruiter (extends existing `recruiter_activity`):**
- All current types plus...
- `view_milestone` — "Profile reached 50 views this week"
- `candidate_submitted` — "Submitted [candidate] to [role]"
- `fee_earned` — "Earned $X from [placement]"

**Candidate:**
- `profile_viewed_milestone` — "Your profile was viewed 12 times this week"
- `matched_to_role` — "New match: [role] at [company] (88% score)"
- `application_status_changed` — "Application for [role] moved to Interview"
- `interview_scheduled` — "Interview scheduled for [role]"

### Architecture

```
                                                    ┌─────────────────┐
Frontend (page view)──► POST /activity/heartbeat ──►│                 │
                                                    │ analytics-      │
RabbitMQ domain events ────────────────────────────►│ service         │
  application.created                               │                 │
  placement.completed                               │  DomainEvent    │
  job.published                                     │  Consumer       │
  candidate.matched                                 │                 │
  recruiter.connected                               ├────────┬────────┤
                                                    │        │        │
                                              ┌─────┘        │        └─────┐
                                              ▼              ▼              ▼
                                     analytics.events  entity_activity  entity_views
                                     (raw events)     (human-readable) (view tracking)
                                              │              │              │
                                              ▼              │              ▼
                                     metrics_hourly    ┌─────┘     view_counts_daily
                                     metrics_daily     │           (cron rollup)
                                     metrics_monthly   │
                                                       ▼
                                              REST API + WebSocket
                                              push to dashboards
```

- **View tracking** — New module in `analytics-service` (already manages analytics tables)
- **Activity feed generation** — Extend existing `DomainEventConsumer` — when it receives `application.created`, write both the raw `analytics.events` row AND generate `entity_activity` rows for all affected entities (the role, the company, the recruiter, the candidate)
- **Frontend** — View-tracking hook that fires on entity detail pages, plus activity feed components per entity

### Migration Path from `recruiter_activity`

Option A: Migrate `recruiter_activity` data into `entity_activity` and deprecate the old table.
Option B: Keep `recruiter_activity` for the public marketplace profile (it has RLS for anon access) and use `entity_activity` for the authenticated dashboard view.

Leaning toward **Option B** — `recruiter_activity` serves a specific public-facing purpose with its own RLS, while `entity_activity` is internal/authenticated only.

## Open Questions

1. **Privacy** — Should recruiters see *who* viewed their profile, or just view counts? Same for candidates — do companies see which candidates viewed their roles?
2. **Retention** — How long do we keep raw view data vs. rolled-up counts? 30 days raw / indefinite rollups?
3. **Real-time** — Should the activity feed update in real-time via WebSocket, or is polling/refresh sufficient?
4. **Phasing** — Build the generic system from the start, or phase 1 = roles only?
5. **Heartbeat integration** — Should view tracking piggyback on the existing heartbeat infrastructure, or be a separate lighter-weight call?

## Implementation Phases (Rough)

### Phase 1: View Tracking Foundation
- `analytics.entity_views` table + daily rollup table (migration)
- View tracking module in analytics-service (record + deduplicate + rollup)
- Frontend `useViewTracker` hook that fires on entity detail pages
- API gateway route for recording views

### Phase 2: Entity Activity Feed
- `public.entity_activity` table (migration)
- Extend `DomainEventConsumer` to generate activity rows from domain events
- Activity feed API endpoints in analytics-service
- API gateway routes

### Phase 3: Frontend — Role Insights
- Role detail page "Activity" tab showing view count trend + activity feed
- Role list page showing view counts as a column
- Company dashboard "Role Performance" widget

### Phase 4: Frontend — Entity Insights
- Recruiter dashboard insights (extend existing with views)
- Candidate portal insights (views, matches, status changes)
- Company dashboard insights (aggregate across all roles)

### Phase 5: Real-time + Notifications
- Wire activity feed updates through existing WebSocket gateway
- Optional email digests ("Your role received 10 views this week")
