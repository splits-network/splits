# Requirements: Splits Network v6.0 — Admin App Extraction

**Defined:** 2026-02-27
**Core Value:** Connecting recruiters and companies through a marketplace model with transparent split-fee arrangements

## v6.0 Requirements

Requirements for admin extraction milestone. Each maps to roadmap phases.

### Shared Packages

- [x] **PKG-01**: Extract `use-standard-list` hook into `@splits-network/shared-hooks` package usable by both portal and admin apps
- [x] **PKG-02**: Extract `api-client` (createAuthenticatedClient) into a shared package usable by both portal and admin apps
- [x] **PKG-03**: Extract `toast-context` (toast notifications provider) into a shared package usable by both portal and admin apps
- [x] **PKG-04**: Move `confirm-dialog` component into `@splits-network/shared-ui` for use by both apps

### Admin App

- [ ] **APP-01**: Create `apps/admin/` Next.js 16 app with App Router, TailwindCSS, and DaisyUI
- [ ] **APP-02**: Configure Clerk authentication for admin app (separate Clerk instance, user handles setup)
- [ ] **APP-03**: Admin layout with `is_platform_admin` gating at server component level (redirect non-admins)
- [ ] **APP-04**: Admin sidebar navigation with collapsible sections and dynamic badge counts
- [ ] **APP-05**: Admin dashboard page with KPI stat tiles and actionable items
- [ ] **APP-06**: Dockerfile and K8s deployment manifests for admin app
- [ ] **APP-07**: GitHub Actions CI/CD workflow for admin app

### Admin Gateway

- [ ] **GW-01**: Create `services/admin-gateway/` Fastify service scaffold (health check, shared-config, shared-logging)
- [ ] **GW-02**: Admin auth middleware enforcing `is_platform_admin` on all routes via Clerk + resolveAccessContext
- [ ] **GW-03**: Thin proxy routes forwarding to existing domain services (ats-service, identity-service, network-service, billing-service, etc.)
- [ ] **GW-04**: Dockerfile and K8s deployment manifests for admin gateway
- [ ] **GW-05**: GitHub Actions CI/CD workflow for admin gateway

### Page Migration — Operations

- [ ] **OPS-01**: Migrate recruiters management page to admin app
- [ ] **OPS-02**: Migrate assignments management page to admin app
- [ ] **OPS-03**: Migrate placements management page to admin app
- [ ] **OPS-04**: Migrate applications management page to admin app
- [ ] **OPS-05**: Migrate notifications management page to admin app

### Page Migration — Directory

- [ ] **DIR-01**: Migrate users management page to admin app
- [ ] **DIR-02**: Migrate organizations management page to admin app
- [ ] **DIR-03**: Migrate companies management page to admin app
- [ ] **DIR-04**: Migrate jobs management page (including job detail view) to admin app
- [ ] **DIR-05**: Migrate candidates management page to admin app

### Page Migration — Settings

- [ ] **SET-01**: Migrate settings page to admin app

### Cleanup

- [ ] **CLN-01**: Remove all admin routes, components, and hooks from portal app
- [ ] **CLN-02**: Remove admin-specific route files from api-gateway
- [ ] **CLN-03**: Add redirect from portal `/portal/admin` to admin app URL
- [ ] **CLN-04**: Update portal sidebar to remove admin navigation link (or replace with external link to admin app)

## v6.1 Requirements (Deferred)

Remaining admin sections to migrate in follow-up milestone.

### Billing Section

- **BIL-01**: Migrate payouts page to admin app
- **BIL-02**: Migrate escrow management page to admin app
- **BIL-03**: Migrate payout audit page to admin app
- **BIL-04**: Migrate payout schedules page to admin app
- **BIL-05**: Migrate billing profiles page to admin app

### Intelligence Section

- **INT-01**: Migrate matches pages (list + detail) to admin app
- **INT-02**: Migrate automation rules page to admin app
- **INT-03**: Migrate fraud detection page to admin app
- **INT-04**: Migrate decision log page to admin app
- **INT-05**: Migrate chat moderation page to admin app

### Content Section

- **CMS-01**: Migrate content pages editor to admin app
- **CMS-02**: Migrate navigation editor to admin app
- **CMS-03**: Migrate image asset management to admin app

### Trust & Quality Section

- **TQ-01**: Migrate ownership audit page to admin app
- **TQ-02**: Migrate reputation management page to admin app

### Analytics Section

- **ANL-01**: Migrate metrics dashboard to admin app
- **ANL-02**: Migrate activity log page to admin app

## Out of Scope

| Feature | Reason |
|---------|--------|
| New admin features | This milestone is extraction only, not new functionality |
| Redesigning admin pages | Move as-is, redesign in future milestone (Basel migration) |
| Splitting the database | Single Supabase Postgres database stays — admin gateway queries same DB |
| Admin-specific domain services | Admin gateway proxies to existing services, no new domain logic |
| Mobile-responsive admin | Admin is desktop-focused, mobile optimization deferred |
| Billing/Intelligence/Content/Trust/Analytics pages | Deferred to v6.1 to keep scope manageable |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| PKG-01 | Phase 16 | Complete |
| PKG-02 | Phase 16 | Complete |
| PKG-03 | Phase 16 | Complete |
| PKG-04 | Phase 16 | Complete |
| APP-01 | Phase 17 | Pending |
| APP-02 | Phase 17 | Pending |
| APP-03 | Phase 17 | Pending |
| APP-04 | Phase 18 | Pending |
| APP-05 | Phase 18 | Pending |
| APP-06 | Phase 17 | Pending |
| APP-07 | Phase 17 | Pending |
| GW-01 | Phase 17 | Pending |
| GW-02 | Phase 17 | Pending |
| GW-03 | Phase 17 | Pending |
| GW-04 | Phase 17 | Pending |
| GW-05 | Phase 17 | Pending |
| OPS-01 | Phase 18 | Pending |
| OPS-02 | Phase 18 | Pending |
| OPS-03 | Phase 18 | Pending |
| OPS-04 | Phase 18 | Pending |
| OPS-05 | Phase 18 | Pending |
| DIR-01 | Phase 18 | Pending |
| DIR-02 | Phase 18 | Pending |
| DIR-03 | Phase 18 | Pending |
| DIR-04 | Phase 18 | Pending |
| DIR-05 | Phase 18 | Pending |
| SET-01 | Phase 18 | Pending |
| CLN-01 | Phase 19 | Pending |
| CLN-02 | Phase 19 | Pending |
| CLN-03 | Phase 19 | Pending |
| CLN-04 | Phase 19 | Pending |

**Coverage:**
- v6.0 requirements: 31 total
- Mapped to phases: 31
- Unmapped: 0

---
*Requirements defined: 2026-02-27*
*Last updated: 2026-02-27 after roadmap creation*
