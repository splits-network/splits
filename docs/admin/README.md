# Admin App - Feature Assessment & Roadmap

## Executive Summary

The admin app has **25+ feature areas** but is **~95% read-only data display**. Most pages follow the same pattern: a table with filters, sorting, and pagination, but no ability to act on data.

### What Works Well (6 features with real admin capability)
1. **Content/CMS** - Full page builder with 12 block types, live preview, drag-reorder, publish/unpublish, image library, nav editor
2. **Site Notifications** - Full CRUD: create, edit, toggle, delete
3. **Support Tickets** - Ticket detail with reply, claim, status management
4. **Support Chat** - Real-time chat with queue, threading, presence
5. **Settings** - Platform name, support email, maintenance mode, feature flags (AI matching, fraud, automation, escrow)
6. **AI Usage** - Usage dashboard, model config editing/testing, usage logs

### What's Partially There (5 features with limited actions)
7. **Jobs** - Status transitions (activate/pause/close/reopen), detail page
8. **Recruiters** - Approve/suspend with confirmation
9. **Firms** - Marketplace approve/revoke
10. **Automation** - Toggle rules active/inactive
11. **Escrow** - Release holds

### What's Purely Read-Only (14+ features)
Everything else - Users, Candidates, Companies, Organizations, Applications, Matches, Placements, Assignments, Payouts, Billing Profiles, Chat Moderation, Fraud, Reputation, Ownership, Decision Log, Activity, Metrics

## Common Gaps Across All Features

1. **No detail pages** - Most entities have no click-through detail view
2. **No editing** - Almost no ability to edit existing records
3. **No entity creation** - Can't create records from admin (except notifications)
4. **No bulk actions** - No multi-select, no batch operations
5. **No internal notes** - No admin-only notes on any entity
6. **No entity linking** - Can't navigate between related entities (e.g., recruiter -> their jobs -> placements)
7. **No audit trail visibility** - Actions taken aren't logged or visible
8. **Data display issues** - Some tables show UUIDs instead of names (assignments shows recruiter_id)

## Feature Documents

### Core Entities
| Document | Feature | Current | Gap |
|----------|---------|---------|-----|
| [users.md](users.md) | Users | List + search | No detail, no role mgmt, no suspend |
| [recruiters.md](recruiters.md) | Recruiters | List + approve/suspend | No detail, no editing, no performance |
| [candidates.md](candidates.md) | Candidates | List + smart resume | No detail, no profile mgmt |
| [companies.md](companies.md) | Companies | List + search | Fully read-only, no detail |
| [firms.md](firms.md) | Firms | List + marketplace approve | No detail, no member mgmt |
| [organizations.md](organizations.md) | Organizations | List + search | Fully read-only, no detail |

### Business Operations
| Document | Feature | Current | Gap |
|----------|---------|---------|-----|
| [jobs.md](jobs.md) | Jobs | List + status actions + detail | No editing, no pipeline view |
| [applications.md](applications.md) | Applications | List + stage filter | No detail, no stage mgmt |
| [matches.md](matches.md) | Matches | List + detail page | No filters, no actions, no pagination |
| [placements.md](placements.md) | Placements | List + status filter | No detail, no fee mgmt |
| [assignments.md](assignments.md) | Assignments | List (shows UUIDs!) | Broken display, no actions |

### Financial
| Document | Feature | Current | Gap |
|----------|---------|---------|-----|
| [payouts-billing.md](payouts-billing.md) | Payouts & Billing | List + detail modal + escrow release | No approval workflow, no manual payouts |

### Platform & Communication
| Document | Feature | Current | Gap |
|----------|---------|---------|-----|
| [chat-moderation.md](chat-moderation.md) | Chat Moderation | List flagged messages | No moderation actions! |
| [notifications.md](notifications.md) | Notifications | Full CRUD | Add targeting + scheduling |
| [support.md](support.md) | Support | Tickets + live chat | Add priority, SLA, assignment |
| [automation.md](automation.md) | Automation | List + toggle | No create/edit, no history |

### Trust & Security
| Document | Feature | Current | Gap |
|----------|---------|---------|-----|
| [fraud-trust.md](fraud-trust.md) | Fraud & Trust | Three list views | No actions, no investigation workflow |
| [decision-log.md](decision-log.md) | Decision Log | List view | No detail, no override capability |

### System & Analytics
| Document | Feature | Current | Gap |
|----------|---------|---------|-----|
| [dashboard-analytics.md](dashboard-analytics.md) | Dashboard & Analytics | Stats + charts + activity | KPIs not actionable, no revenue dashboard |
| [settings.md](settings.md) | Settings | Basic form | Feature flags, fee config, maintenance mode |
| [content.md](content.md) | CMS | Page builder + images + nav | Publishing workflow, versioning |

## Suggested Phase Order

### Phase 1: Entity Detail Pages & Core Actions
**Goal:** Every major entity has a clickable detail page and basic management actions.
- User detail page + role management + suspend
- Recruiter detail page + profile editing + rejection workflow
- Candidate detail page + resume viewer
- Company detail page
- Firm detail page + member management
- Application detail page + stage management
- Placement detail page + fee management
- Fix assignments table (show names, not UUIDs)

### Phase 2: Financial Management
**Goal:** Admins can fully manage the financial pipeline.
- Payout approval workflow
- Manual payout creation
- Refund processing
- Revenue dashboard
- Fee structure management

### Phase 3: Moderation & Trust Actions
**Goal:** Admins can act on flagged content and trust signals.
- Chat moderation actions (clear/remove/warn)
- Fraud investigation workflow + resolution
- Reputation management + overrides
- Ownership verification actions

### Phase 4: Automation & Intelligence
**Goal:** Admin can configure and monitor automated systems.
- Automation rule creation and editing
- Decision log detail + override capability
- AI usage budget management
- Matching engine controls

### Phase 5: Analytics & Reporting
**Goal:** Data-driven decision making.
- Revenue analytics
- Funnel analytics
- Actionable dashboard KPIs
- Export/reporting capabilities
- Scheduled reports

### Phase 6: Advanced Operations
**Goal:** Power tools for mature platform operations.
- Bulk actions across all entities
- Internal notes system
- GDPR compliance tools
- Content publishing workflow
- Integration/webhook management
