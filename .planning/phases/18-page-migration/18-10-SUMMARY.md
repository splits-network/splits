---
phase: 18-page-migration
plan: 10
status: complete
duration: ~4 min
---

# 18-10: Portal Admin Removal & Redirect Stubs

## What Was Done

Removed all portal admin pages, components, and hooks now that the dedicated admin app handles all admin functionality.

### Task 1: Human Verification (Checkpoint)

User verified admin app is functional and approved proceeding with portal admin removal. During verification, several infrastructure fixes were applied:
- Added admin-gateway to docker-compose.yml
- Fixed port conflict (3020 → 3030)
- Added Dockerfile development stage
- Fixed ADMIN_CLERK_SECRET_KEY env var handling
- Added Google OAuth sign-in support

### Task 2: Remove Portal Admin Pages

**Deleted (59 files, 14,826 lines removed):**
- All 22 page directories under `apps/portal/src/app/portal/admin/`
- `components/` directory (admin-sidebar, admin-page-header, admin-layout-client, admin-confirm-provider, admin-stats-banner, admin-bulk-actions, index.ts)
- `hooks/` directory (use-admin-stats, use-bulk-selection, index.ts)
- `admin-dashboard-client.tsx`

**Replaced with redirect stubs:**
- `layout.tsx` — server-side redirect to `NEXT_PUBLIC_ADMIN_APP_URL`
- `page.tsx` — server-side redirect to `NEXT_PUBLIC_ADMIN_APP_URL`

**Fixed broken references:**
- `image-detail-modal.tsx` — replaced deleted `useAdminConfirm` import with `window.confirm`
- Sidebar and user-dropdown keep `/portal/admin` href (hits redirect stub)

## Commits

| Hash | Description |
|------|-------------|
| e2c3932f | feat(18-10): remove portal admin pages, add redirect stubs |

## Verification

- Portal builds clean (`pnpm --filter @splits-network/portal build` passes)
- Admin directory contains only `layout.tsx` and `page.tsx` (redirect stubs)
- No broken imports from deleted admin files
- Sidebar/dropdown admin links route through redirect to admin app
