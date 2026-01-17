# Database Migration Execution Guide

**Date:** January 16, 2026  
**Phase:** 1-2 (Database Schema)  
**Status:** Ready for execution

---

## Pre-Flight Checklist

Before running migrations, ensure:

- [ ] **Decisions confirmed:**
  - Decision 1: ✅ Option A (rename to sourcer_recruiter_id)
  - Decision 2: ✅ Option A (service-specific migrations)
  - Decision 3: ✅ Option A (single permanent model)

- [ ] **Environment prepared:**
  - [ ] Local dev environment running
  - [ ] Database connection tested
  - [ ] Supabase CLI installed (`supabase --version`)
  - [ ] Backup created (optional but recommended)

- [ ] **Dependencies checked:**
  - [ ] All services stopped (to avoid conflicts)
  - [ ] No pending migrations
  - [ ] Database in clean state

---

## Migration Files Created

### ATS Service (3 migrations)

**Location:** `services/ats-service/migrations/`

1. **029_split_cra_recruiter_columns.sql**
   - Split `recruiter_id` → `candidate_recruiter_id` + `company_recruiter_id`
   - Add gate routing columns
   - Update indexes

2. **030_create_sourcer_tables.sql**
   - Fix field name: `sourcer_user_id` → `sourcer_recruiter_id`
   - Create `company_sourcers` table
   - Add RLS policies

3. **031_add_job_owner_recruiter.sql**
   - Add `job_owner_recruiter_id` to `jobs` table
   - Create index

**Rollback files:**
- `029_split_cra_recruiter_columns_rollback.sql`
- `030_create_sourcer_tables_rollback.sql`
- `031_add_job_owner_recruiter_rollback.sql`

### Billing Service (1 migration)

**Location:** `services/billing-service/migrations/` (newly created)

1. **001_create_placement_snapshot.sql**
   - Create `placement_snapshot` table
   - Add all 5 role ID columns
   - Add all 5 rate columns
   - Add indexes and RLS policies

**Rollback file:**
- `001_create_placement_snapshot_rollback.sql`

---

## Execution Steps

### Option A: Manual Execution (psql)

```bash
# 1. Connect to database
psql $DATABASE_URL

# 2. Run ATS migrations in order
\i services/ats-service/migrations/029_split_cra_recruiter_columns.sql
\i services/ats-service/migrations/030_create_sourcer_tables.sql
\i services/ats-service/migrations/031_add_job_owner_recruiter.sql

# 3. Run billing migration
\i services/billing-service/migrations/001_create_placement_snapshot.sql

# 4. Verify changes
\d candidate_role_assignments
\d candidate_sourcers
\d company_sourcers
\d jobs
\d placement_snapshot

# 5. Exit
\q
```

### Option B: Supabase CLI Execution

```bash
# 1. Apply ATS migrations
cd services/ats-service
supabase db push

# 2. Apply billing migration
cd ../billing-service
supabase db push

# 3. Verify in Supabase Studio
# Navigate to: https://supabase.com/dashboard/project/[project-id]/editor
```

### Option C: Programmatic Execution (Node.js)

```typescript
// scripts/run-migrations.ts
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

async function runMigration(filePath: string) {
  const sql = fs.readFileSync(filePath, 'utf8');
  const { error } = await supabase.rpc('exec_sql', { sql });
  if (error) throw error;
  console.log(`✅ ${path.basename(filePath)}`);
}

async function main() {
  // ATS migrations
  await runMigration('services/ats-service/migrations/029_split_cra_recruiter_columns.sql');
  await runMigration('services/ats-service/migrations/030_create_sourcer_tables.sql');
  await runMigration('services/ats-service/migrations/031_add_job_owner_recruiter.sql');
  
  // Billing migration
  await runMigration('services/billing-service/migrations/001_create_placement_snapshot.sql');
  
  console.log('\n✅ All migrations completed successfully');
}

main().catch(console.error);
```

---

## Verification Checklist

After migrations complete, verify:

### ATS Service

**candidate_role_assignments table:**
- [ ] Column `recruiter_id` renamed to `candidate_recruiter_id`
- [ ] Column `company_recruiter_id` exists (UUID, nullable)
- [ ] Column `current_gate` exists (TEXT, nullable)
- [ ] Column `gate_sequence` exists (JSONB, default '[]')
- [ ] Column `gate_history` exists (JSONB, default '[]')
- [ ] Column `has_candidate_recruiter` exists (BOOLEAN, default FALSE)
- [ ] Column `has_company_recruiter` exists (BOOLEAN, default FALSE)
- [ ] Index `idx_cra_candidate_recruiter` exists
- [ ] Index `idx_cra_company_recruiter` exists
- [ ] Index `idx_cra_current_gate` exists
- [ ] Index `idx_cra_routing_flags` exists
- [ ] Old index `idx_cra_recruiter` dropped

**candidate_sourcers table:**
- [ ] Column `sourcer_user_id` renamed to `sourcer_recruiter_id`
- [ ] Foreign key points to `recruiters(id)` (not `users(id)`)
- [ ] Index `idx_candidate_sourcers_recruiter` exists
- [ ] Old index `idx_candidate_sourcers_user` dropped

**company_sourcers table:**
- [ ] Table exists
- [ ] Column `company_id` has UNIQUE constraint
- [ ] Column `sourcer_recruiter_id` references `recruiters(id)`
- [ ] Index `idx_company_sourcers_company` exists
- [ ] Index `idx_company_sourcers_recruiter` exists
- [ ] RLS enabled with 3 policies

**jobs table:**
- [ ] Column `job_owner_recruiter_id` exists (UUID, nullable)
- [ ] Foreign key points to `recruiters(id)`
- [ ] Index `idx_jobs_owner_recruiter` exists

### Billing Service

**placement_snapshot table:**
- [ ] Table exists
- [ ] All 5 role ID columns exist (nullable UUIDs)
- [ ] All 5 rate columns exist (nullable DECIMAL(5,2))
- [ ] Column `total_placement_fee` exists (NOT NULL)
- [ ] Column `subscription_tier` exists (CHECK constraint)
- [ ] All 5 role indexes exist
- [ ] Created_at and tier indexes exist
- [ ] RLS enabled with 3 policies
- [ ] Rate CHECK constraints exist (0-100 range)
- [ ] Fee CHECK constraint exists (> 0)

---

## Test Queries

After verification, run these test queries:

### Test 1: CRA with split recruiters
```sql
-- Should work (both recruiter types)
INSERT INTO candidate_role_assignments (
  candidate_id, 
  job_id, 
  candidate_recruiter_id, 
  company_recruiter_id
) VALUES (
  'uuid-candidate',
  'uuid-job',
  'uuid-recruiter-1',
  'uuid-recruiter-2'
);
```

### Test 2: Company sourcer creation
```sql
-- Should work (permanent attribution)
INSERT INTO company_sourcers (
  company_id,
  sourcer_recruiter_id
) VALUES (
  'uuid-company',
  'uuid-recruiter'
);

-- Should fail (duplicate company_id)
INSERT INTO company_sourcers (
  company_id,
  sourcer_recruiter_id
) VALUES (
  'uuid-company',  -- Same company
  'uuid-recruiter-2'  -- Different recruiter
);
-- Expected: ERROR: duplicate key value violates unique constraint
```

### Test 3: Placement snapshot creation
```sql
-- Should work (all 5 roles)
INSERT INTO placement_snapshot (
  placement_id,
  candidate_recruiter_id,
  company_recruiter_id,
  job_owner_recruiter_id,
  candidate_sourcer_recruiter_id,
  company_sourcer_recruiter_id,
  candidate_recruiter_rate,
  company_recruiter_rate,
  job_owner_rate,
  candidate_sourcer_rate,
  company_sourcer_rate,
  total_placement_fee,
  subscription_tier
) VALUES (
  'uuid-placement',
  'uuid-recruiter-1',
  'uuid-recruiter-2',
  'uuid-recruiter-3',
  'uuid-recruiter-4',
  'uuid-recruiter-5',
  40.00,  -- Premium tier
  20.00,
  20.00,
  10.00,
  10.00,
  20000.00,
  'premium'
);
```

### Test 4: Job with owner
```sql
-- Should work (job owner set)
INSERT INTO jobs (
  company_id,
  title,
  job_owner_recruiter_id
) VALUES (
  'uuid-company',
  'Senior Engineer',
  'uuid-recruiter'
);

-- Should work (job owner NULL - company employee created)
INSERT INTO jobs (
  company_id,
  title,
  job_owner_recruiter_id
) VALUES (
  'uuid-company',
  'Senior Engineer',
  NULL
);
```

---

## Rollback Procedure

If issues occur, rollback in **reverse order**:

```bash
# 1. Rollback billing migration
psql $DATABASE_URL < services/billing-service/migrations/001_create_placement_snapshot_rollback.sql

# 2. Rollback ATS migrations (reverse order)
psql $DATABASE_URL < services/ats-service/migrations/031_add_job_owner_recruiter_rollback.sql
psql $DATABASE_URL < services/ats-service/migrations/030_create_sourcer_tables_rollback.sql
psql $DATABASE_URL < services/ats-service/migrations/029_split_cra_recruiter_columns_rollback.sql

# 3. Verify rollback
psql $DATABASE_URL -c "\d candidate_role_assignments"
psql $DATABASE_URL -c "\d jobs"
psql $DATABASE_URL -c "\d+ company_sourcers"  # Should not exist
psql $DATABASE_URL -c "\d+ placement_snapshot"  # Should not exist
```

---

## Common Issues & Solutions

### Issue 1: Foreign key constraint violation
**Error:** `column "sourcer_user_id" referenced in foreign key constraint does not exist`

**Solution:**
```sql
-- Check if old constraint still exists
SELECT conname FROM pg_constraint WHERE conname LIKE '%sourcer%';

-- Drop manually if needed
ALTER TABLE candidate_sourcers DROP CONSTRAINT IF EXISTS candidate_sourcers_sourcer_user_id_fkey;

-- Re-run migration 030
```

### Issue 2: Index already exists
**Error:** `relation "idx_cra_candidate_recruiter" already exists`

**Solution:**
```sql
-- Drop existing index
DROP INDEX IF EXISTS idx_cra_candidate_recruiter;

-- Re-run migration
```

### Issue 3: RLS policy conflict
**Error:** `policy "company_sourcers_admin_all" already exists`

**Solution:**
```sql
-- Drop existing policies
DROP POLICY IF EXISTS company_sourcers_admin_all ON company_sourcers;
DROP POLICY IF EXISTS company_sourcers_recruiter_own ON company_sourcers;
DROP POLICY IF EXISTS company_sourcers_company_own ON company_sourcers;

-- Re-run migration
```

---

## Next Steps After Successful Migration

1. **Phase 3: TypeScript Types**
   - Update `CandidateRoleAssignment` interface
   - Fix `CandidateSourcer` interface
   - Create `CompanySourcer` interface
   - Create `PlacementSnapshot` interface
   - Regenerate types: `pnpm supabase:types`

2. **Phase 4: V2 Repositories**
   - Update CRA repository (split recruiter queries)
   - Fix candidate sourcer repository (field name)
   - Create company sourcer repository
   - Update jobs repository (job owner support)

3. **Test Services**
   - Start ATS service: `pnpm --filter @splits-network/ats-service dev`
   - Start billing service: `pnpm --filter @splits-network/billing-service dev`
   - Verify no compilation errors

---

## Success Criteria

✅ **Phase 1-2 Complete When:**
- [ ] All 4 migrations executed successfully
- [ ] All verification checks passed
- [ ] All test queries executed successfully
- [ ] No rollback needed
- [ ] Services start without errors
- [ ] Ready to proceed to Phase 3 (TypeScript types)

---

**Estimated Time:** 30-60 minutes (including verification)  
**Risk Level:** MEDIUM (schema changes, test thoroughly in dev)  
**Rollback Time:** 5-10 minutes (if needed)

---

**Questions?** Refer to the implementation plan in `untitled:plan-implementSourcerTablesCommissionStructure.prompt.md` for detailed context.
