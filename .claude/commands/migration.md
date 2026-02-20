# /migration - Create Database Migration

**Description:** Create a properly formatted Supabase migration file with standard patterns

## Usage

```bash
/migration <description>
```

## Parameters

- `<description>` — What the migration does (e.g., `add interviews table`, `add index on applications status`)

## Examples

```bash
/migration add interviews table
/migration add skill_assessments table with scoring
/migration add index on applications job_id and status
/migration add RLS policies to placements
```

## Execution

Spawn the `migration` agent. It will:

1. Generate a timestamped filename: `supabase/migrations/YYYYMMDDHHMMSS_<description_snake_case>.sql`
2. Follow established patterns:
   - Standard columns: `id uuid PK`, `created_at`, `updated_at`, `deleted_at`
   - Auto-update trigger for `updated_at`
   - Soft delete pattern (`deleted_at` column, not hard delete)
   - `CREATE INDEX CONCURRENTLY` for indexes (no table locks)
   - Backward-compatible changes only (additive first, destructive later)
3. Reference existing migrations in `supabase/migrations/` for naming conventions
4. Reference the `dba` agent patterns for schema design

## Key Rules

- Every table gets `id`, `created_at`, `updated_at`, `deleted_at`
- Tables are snake_case, plural (`interviews`, `skill_assessments`)
- Indexes named `idx_{table}_{columns}`
- Foreign keys named `fk_{table}_{referenced_table}`
- Never drop columns in same migration that stops writing them
- Add nullable columns first, backfill, then add NOT NULL constraint
