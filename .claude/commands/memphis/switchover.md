# /memphis:switchover - Replace Original Pages with Memphis Versions

**Category:** Design System
**Description:** Promote Memphis pages to primary and archive originals

## Usage

```bash
/memphis:switchover <target>       # Switchover single feature
/memphis:switchover <app> --all    # Switchover all approved Memphis pages in app
/memphis:switchover <target> --dry # Preview what would happen (no changes)
```

## Parameters

- `<target>` - Feature path (e.g., `apps/portal/src/app/jobs`) or app name
- `--all` - Switchover all approved Memphis pages in the app
- `--dry` - Dry run: show what would happen without making changes

## Examples

```bash
# Single feature
/memphis:switchover apps/portal/src/app/jobs

# All approved Memphis pages in portal
/memphis:switchover portal --all

# Preview first
/memphis:switchover apps/portal/src/app/jobs --dry
```

## What It Does

For each feature being switched over:

### Step 1: Validate Memphis Version
- Confirm `{feature}-memphis/` exists and passes audit
- Run `/memphis:validate` on the Memphis page
- Ensure 100% Memphis compliance (zero critical violations)

### Step 2: Archive Original
```
apps/portal/src/app/jobs/page.tsx
  → apps/portal/src/app/jobs-legacy/page.tsx
```
- Renames original folder to `{feature}-legacy/`
- Original code is preserved, just moved
- Can be deleted later once Memphis version is stable

### Step 3: Promote Memphis Version
```
apps/portal/src/app/jobs-memphis/page.tsx
  → apps/portal/src/app/jobs/page.tsx
```
- Renames Memphis folder to take over the original route
- All links/navigation now point to the Memphis version
- No code changes needed in other files (same route path)

### Step 4: Update Imports (if needed)
- Scan for any imports referencing `{feature}-memphis/`
- Update to new `{feature}/` path
- Scan for any imports referencing original `{feature}/` components
- These should NOT exist in Memphis pages (component isolation rule)

### Step 5: Verify
- Run build to confirm no broken imports
- Run tests to confirm no regressions
- Update build progress state

## File Operations

```
BEFORE:
apps/portal/src/app/jobs/                    ← Original
apps/portal/src/app/jobs/page.tsx
apps/portal/src/app/jobs/components/
apps/portal/src/app/jobs-memphis/            ← Memphis version
apps/portal/src/app/jobs-memphis/page.tsx
apps/portal/src/app/jobs-memphis/components/

AFTER:
apps/portal/src/app/jobs-legacy/             ← Archived original
apps/portal/src/app/jobs-legacy/page.tsx
apps/portal/src/app/jobs-legacy/components/
apps/portal/src/app/jobs/                    ← Memphis (promoted)
apps/portal/src/app/jobs/page.tsx
apps/portal/src/app/jobs/components/
```

## Dry Run Output

```
/memphis:switchover apps/portal/src/app/jobs --dry

Memphis Switchover - DRY RUN
=============================
Feature: jobs

Pre-checks:
  ✅ jobs-memphis/ exists
  ✅ Memphis compliance: 100%
  ✅ No imports from original page components

Planned operations:
  1. RENAME jobs/ → jobs-legacy/
  2. RENAME jobs-memphis/ → jobs/
  3. UPDATE 0 import paths

No changes made (dry run).
Run without --dry to execute.
```

## Batch Switchover (--all)

When using `--all`, only pages that meet ALL criteria are switched:
- Memphis version exists (`{feature}-memphis/`)
- Memphis version passes audit (100% compliance)
- Memphis version is self-contained (no imports from original)
- Memphis version was marked as "approved" in build progress

```
/memphis:switchover portal --all

Memphis Batch Switchover
========================
App: portal

Eligible for switchover (12 of 45 features):
  ✅ dashboard        → 100% compliant, self-contained
  ✅ jobs             → 100% compliant, self-contained
  ✅ candidates       → 100% compliant, self-contained
  ✅ applications     → 100% compliant, self-contained
  ✅ settings         → 100% compliant, self-contained
  ✅ profile          → 100% compliant, self-contained
  ✅ notifications    → 100% compliant, self-contained
  ✅ messages         → 100% compliant, self-contained
  ✅ analytics        → 100% compliant, self-contained
  ✅ billing          → 100% compliant, self-contained
  ✅ team             → 100% compliant, self-contained
  ✅ onboarding       → 100% compliant, self-contained

Not eligible (33 features):
  ❌ roles            → Memphis version not yet created
  ❌ assignments      → 85% compliant (3 violations)
  ❌ proposals        → Imports from original (ProposalForm)
  ...

Proceed with switchover of 12 features? (y/n)
```

## Cleanup Command

After switchover is stable and verified, clean up legacy pages:

```bash
/memphis:switchover portal --cleanup
```

This removes all `{feature}-legacy/` directories:
```
Removing legacy pages:
  🗑️ apps/portal/src/app/dashboard-legacy/
  🗑️ apps/portal/src/app/jobs-legacy/
  🗑️ apps/portal/src/app/candidates-legacy/
  ...

Removed 12 legacy directories.
```

## Safety Rails

- **Dry run first**: Always recommend `--dry` before actual switchover
- **Git status check**: Warn if there are uncommitted changes
- **Build verification**: Run build after switchover to catch broken imports
- **Rollback**: If build fails, automatically revert the rename operations
- **Legacy preserved**: Originals are renamed, not deleted (until --cleanup)

## Rollback

If something goes wrong after switchover:

```bash
/memphis:switchover apps/portal/src/app/jobs --rollback
```

This reverses the operation:
```
1. RENAME jobs/ → jobs-memphis/     (Memphis back to -memphis)
2. RENAME jobs-legacy/ → jobs/      (Original restored)
```

## Build Progress Updates

After switchover:
```json
{
  "switchovers": [
    {
      "feature": "jobs",
      "switchedAt": "2026-02-15T10:00:00Z",
      "legacyPath": "apps/portal/src/app/jobs-legacy/",
      "status": "switched",
      "cleanedUp": false
    }
  ]
}
```

## Implementation

When invoked:
1. Parse target and flags
2. If `--dry`: run all checks, report what would happen, exit
3. Validate Memphis version (existence, compliance, isolation)
4. If `--all`: filter to only eligible features
5. Confirm with user
6. Execute renames (archive original → promote Memphis)
7. Update any import paths
8. Run build to verify
9. If build fails: automatic rollback
10. Update build progress state
11. Report success with summary
