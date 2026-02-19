# /basel:switchover - Replace Original Pages with Basel Versions

**Category:** Design System
**Description:** Promote Basel pages to primary and archive originals

## Usage

```bash
/basel:switchover <target>       # Switchover single feature
/basel:switchover <app> --all    # Switchover all approved Basel pages in app
/basel:switchover <target> --dry # Preview what would happen (no changes)
```

## Parameters

- `<target>` - Feature path (e.g., `apps/portal/src/app/jobs`) or app name
- `--all` - Switchover all approved Basel pages in the app
- `--dry` - Dry run: show what would happen without making changes

## Examples

```bash
# Single feature
/basel:switchover apps/portal/src/app/jobs

# All approved Basel pages in portal
/basel:switchover portal --all

# Preview first
/basel:switchover apps/portal/src/app/jobs --dry
```

## What It Does

For each feature being switched over:

### Step 1: Validate Basel Version
- Confirm `{feature}-basel/` exists and passes audit
- Run `/basel:validate` on the Basel page
- Ensure 100% Basel compliance (zero critical violations)

### Step 2: Archive Original
```
apps/portal/src/app/jobs/page.tsx
  → apps/portal/src/app/jobs-legacy/page.tsx
```
- Renames original folder to `{feature}-legacy/`
- Original code is preserved, just moved
- Can be deleted later once Basel version is stable

### Step 3: Promote Basel Version
```
apps/portal/src/app/jobs-basel/page.tsx
  → apps/portal/src/app/jobs/page.tsx
```
- Renames Basel folder to take over the original route
- All links/navigation now point to the Basel version
- No code changes needed in other files (same route path)

### Step 4: Update Imports (if needed)
- Scan for any imports referencing `{feature}-basel/`
- Update to new `{feature}/` path
- Scan for any imports referencing original `{feature}/` components
- These should NOT exist in Basel pages (component isolation rule)

### Step 5: Verify
- Run build to confirm no broken imports
- Run tests to confirm no regressions
- Update build progress state

## File Operations

```
BEFORE:
apps/portal/src/app/jobs/                   ← Original
apps/portal/src/app/jobs/page.tsx
apps/portal/src/app/jobs/components/
apps/portal/src/app/jobs-basel/             ← Basel version
apps/portal/src/app/jobs-basel/page.tsx
apps/portal/src/app/jobs-basel/components/

AFTER:
apps/portal/src/app/jobs-legacy/            ← Archived original
apps/portal/src/app/jobs-legacy/page.tsx
apps/portal/src/app/jobs-legacy/components/
apps/portal/src/app/jobs/                   ← Basel (promoted)
apps/portal/src/app/jobs/page.tsx
apps/portal/src/app/jobs/components/
```

## Dry Run Output

```
/basel:switchover apps/portal/src/app/jobs --dry

Basel Switchover - DRY RUN
============================
Feature: jobs

Pre-checks:
  jobs-basel/ exists
  Basel compliance: 100%
  No imports from original page components

Planned operations:
  1. RENAME jobs/ → jobs-legacy/
  2. RENAME jobs-basel/ → jobs/
  3. UPDATE 0 import paths

No changes made (dry run).
Run without --dry to execute.
```

## Batch Switchover (--all)

When using `--all`, only pages that meet ALL criteria are switched:
- Basel version exists (`{feature}-basel/`)
- Basel version passes audit (100% compliance)
- Basel version is self-contained (no imports from original)
- Basel version was marked as "approved" in build progress

```
/basel:switchover portal --all

Basel Batch Switchover
=======================
App: portal

Eligible for switchover (8 of 45 features):
  dashboard        → 100% compliant, self-contained
  jobs             → 100% compliant, self-contained
  candidates       → 100% compliant, self-contained
  settings         → 100% compliant, self-contained
  profile          → 100% compliant, self-contained
  notifications    → 100% compliant, self-contained
  analytics        → 100% compliant, self-contained
  billing          → 100% compliant, self-contained

Not eligible (37 features):
  roles            → Basel version not yet created
  assignments      → 85% compliant (3 violations)
  proposals        → Imports from original (ProposalForm)
  ...

Proceed with switchover of 8 features? (y/n)
```

## Cleanup Command

After switchover is stable and verified, clean up legacy pages:

```bash
/basel:switchover portal --cleanup
```

This removes all `{feature}-legacy/` directories.

## Safety Rails

- **Dry run first**: Always recommend `--dry` before actual switchover
- **Git status check**: Warn if there are uncommitted changes
- **Build verification**: Run build after switchover to catch broken imports
- **Rollback**: If build fails, automatically revert the rename operations
- **Legacy preserved**: Originals are renamed, not deleted (until --cleanup)

## Rollback

If something goes wrong after switchover:

```bash
/basel:switchover apps/portal/src/app/jobs --rollback
```

This reverses the operation:
```
1. RENAME jobs/ → jobs-basel/     (Basel back to -basel)
2. RENAME jobs-legacy/ → jobs/    (Original restored)
```

## Implementation

When invoked:
1. Parse target and flags
2. If `--dry`: run all checks, report what would happen, exit
3. Validate Basel version (existence, compliance, isolation)
4. If `--all`: filter to only eligible features
5. Confirm with user
6. Execute renames (archive original → promote Basel)
7. Update any import paths
8. Run build to verify
9. If build fails: automatic rollback
10. Update build progress state
11. Report success with summary
