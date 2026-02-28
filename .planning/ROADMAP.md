# Roadmap: Splits Network

## Milestones

- v2.0 Global Search (Phases 1-3) -- shipped 2026-02-13
- v3.0 Platform Admin Restructure (Phases 4-7) -- shipped 2026-02-13
- v4.0 Commute Types & Job Levels (Phases 8-10) -- shipped 2026-02-13
- v5.0 Custom GPT / Applicant Network (Phases 11-15) -- shipped 2026-02-13
- v6.0 Admin App Extraction (Phases 16-19) -- in progress

## Phases

<details>
<summary>v2.0 Global Search (Phases 1-3) -- SHIPPED 2026-02-13</summary>

- [x] Phase 1: Search Infrastructure (2/2 plans)
- [x] Phase 2: Search Service (3/3 plans)
- [x] Phase 3: Search UI (2/2 plans)

</details>

<details>
<summary>v3.0 Platform Admin Restructure (Phases 4-7) -- SHIPPED 2026-02-13</summary>

- [x] Phase 4: Schema Migration (1/1 plan)
- [x] Phase 5: Data Migration (2/2 plans)
- [x] Phase 6: Code Alignment (2/2 plans)
- [x] Phase 7: Legacy Cleanup (1/1 plan)

</details>

<details>
<summary>v4.0 Commute Types & Job Levels (Phases 8-10) -- SHIPPED 2026-02-13</summary>

- [x] Phase 8: Schema & Types (1/1 plan)
- [x] Phase 9: Backend & Filtering (2/2 plans)
- [x] Phase 10: Portal UI (2/2 plans)

</details>

<details>
<summary>v5.0 Custom GPT / Applicant Network (Phases 11-15) -- SHIPPED 2026-02-13</summary>

- [x] Phase 11: Service Foundation (3/3 plans)
- [x] Phase 12: OAuth2 Provider (6/6 plans)
- [x] Phase 13: GPT API Endpoints (4/4 plans)
- [x] Phase 14: OpenAPI Schema + GPT Configuration (2/2 plans)
- [x] Phase 15: Production Hardening (3/3 plans)

</details>

### v6.0 Admin App Extraction (In Progress)

**Milestone Goal:** Extract platform administration from portal into a dedicated admin app and admin gateway, reducing complexity in both the portal and api-gateway.

#### Phase 16: Shared Packages
**Goal**: Portal and admin app can share hooks and utilities without code duplication
**Depends on**: Nothing (first phase of v6.0)
**Requirements**: PKG-01, PKG-02, PKG-03, PKG-04
**Success Criteria** (what must be TRUE):
  1. Both portal and admin apps can import `use-standard-list` from `@splits-network/shared-hooks` and it compiles
  2. Both apps can import `createAuthenticatedClient` from a shared api-client package and make authenticated API calls
  3. Both apps can import and render the toast notification provider from a shared package
  4. Both apps can import and render the confirm-dialog component from `@splits-network/shared-ui`
  5. Portal continues to function identically after switching its imports to the shared packages
**Plans**: 2 plans

Plans:
- [x] 16-01-PLAN.md -- Create shared-hooks package and move UI components to shared-ui
- [x] 16-02-PLAN.md -- Switch portal imports to shared packages and delete originals

#### Phase 17: Admin App & Gateway Scaffold
**Goal**: Admin app and admin gateway are running, authenticated, and connected -- ready to receive migrated pages
**Depends on**: Phase 16
**Requirements**: APP-01, APP-02, APP-03, APP-06, APP-07, GW-01, GW-02, GW-03, GW-04, GW-05
**Success Criteria** (what must be TRUE):
  1. Admin app loads at its URL with TailwindCSS/DaisyUI styling and Clerk login flow
  2. Non-platform-admin users are redirected away from admin app at the server component level
  3. Admin gateway health check endpoint responds and all proxy routes forward to existing domain services
  4. Admin gateway rejects requests from non-platform-admin users on every route
  5. Both admin app and admin gateway have working Dockerfiles, K8s manifests, and CI/CD workflows
**Plans**: 3 plans

Plans:
- [x] 17-01-PLAN.md -- Admin gateway service with auth middleware and proxy routes
- [x] 17-02-PLAN.md -- Admin Next.js app with Clerk auth and admin gating
- [x] 17-03-PLAN.md -- Dockerfiles, K8s manifests, ingress, and CI/CD for both services

#### Phase 18: Page Migration
**Goal**: All admin pages are live in the admin app with sidebar navigation and dashboard
**Depends on**: Phase 17
**Requirements**: APP-04, APP-05, OPS-01, OPS-02, OPS-03, OPS-04, OPS-05, DIR-01, DIR-02, DIR-03, DIR-04, DIR-05, SET-01
**Success Criteria** (what must be TRUE):
  1. Admin sidebar displays all sections (Operations, Directory, Settings) with collapsible groups and dynamic badge counts
  2. Admin dashboard shows KPI stat tiles and actionable items
  3. All 5 Operations pages (recruiters, assignments, placements, applications, notifications) render and function in admin app
  4. All 5 Directory pages (users, organizations, companies, jobs, candidates) render and function in admin app
  5. Settings page renders and functions in admin app
**Plans**: 10 plans

Plans:
- [x] 18-01-PLAN.md -- Shared charts package (ECharts components)
- [x] 18-02-PLAN.md -- Real-time infrastructure (WebSocket for admin)
- [x] 18-03-PLAN.md -- Admin backend routes (/admin/ prefix in domain services)
- [x] 18-04-PLAN.md -- Admin layout, sidebar, and shared page components
- [x] 18-05-PLAN.md -- Admin dashboard with charts, stats, and activity feed
- [x] 18-06-PLAN.md -- Operations pages (Recruiters, Assignments, Placements, Applications, Notifications)
- [x] 18-07-PLAN.md -- Directory pages (Users, Organizations, Companies, Jobs, Candidates)
- [x] 18-08-PLAN.md -- Intelligence & Trust pages (Matches, Automation, Fraud, Decision Log, Chat, Ownership, Reputation)
- [x] 18-09-PLAN.md -- Finance, Content, Analytics, and Settings pages
- [x] 18-10-PLAN.md -- Portal admin page removal and redirect stubs

#### Phase 19: Portal & Gateway Cleanup
**Goal**: Portal and api-gateway are free of admin code, with clean redirects for bookmarked URLs
**Depends on**: Phase 18
**Requirements**: CLN-01, CLN-02, CLN-03, CLN-04
**Success Criteria** (what must be TRUE):
  1. Portal no longer contains any admin routes, components, or hooks (59 files removed)
  2. Api-gateway no longer contains admin-specific route files
  3. Navigating to portal `/portal/admin/*` redirects to the admin app
  4. Portal sidebar no longer shows admin navigation (or shows an external link to admin app)
**Plans**: TBD

Plans:
- [ ] 19-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 16 -> 17 -> 18 -> 19

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Search Infrastructure | v2.0 | 2/2 | Complete | 2026-02-13 |
| 2. Search Service | v2.0 | 3/3 | Complete | 2026-02-13 |
| 3. Search UI | v2.0 | 2/2 | Complete | 2026-02-13 |
| 4. Schema Migration | v3.0 | 1/1 | Complete | 2026-02-13 |
| 5. Data Migration | v3.0 | 2/2 | Complete | 2026-02-13 |
| 6. Code Alignment | v3.0 | 2/2 | Complete | 2026-02-13 |
| 7. Legacy Cleanup | v3.0 | 1/1 | Complete | 2026-02-13 |
| 8. Schema & Types | v4.0 | 1/1 | Complete | 2026-02-13 |
| 9. Backend & Filtering | v4.0 | 2/2 | Complete | 2026-02-13 |
| 10. Portal UI | v4.0 | 2/2 | Complete | 2026-02-13 |
| 11. Service Foundation | v5.0 | 3/3 | Complete | 2026-02-13 |
| 12. OAuth2 Provider | v5.0 | 6/6 | Complete | 2026-02-13 |
| 13. GPT API Endpoints | v5.0 | 4/4 | Complete | 2026-02-13 |
| 14. OpenAPI Schema + GPT Config | v5.0 | 2/2 | Complete | 2026-02-13 |
| 15. Production Hardening | v5.0 | 3/3 | Complete | 2026-02-13 |
| 16. Shared Packages | v6.0 | 2/2 | Complete | 2026-02-27 |
| 17. Admin App & Gateway Scaffold | v6.0 | 3/3 | Complete | 2026-02-27 |
| 18. Page Migration | v6.0 | 10/10 | Complete | 2026-02-28 |
| 19. Portal & Gateway Cleanup | v6.0 | 0/TBD | Not started | - |

---
*Roadmap created: 2026-02-12 (v2.0)*
*Last updated: 2026-02-28 (Phase 18 complete)*
