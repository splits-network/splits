# Jobs Full-Text Search - Implementation Complete ✅

**Date**: January 12, 2026  
**Status**: Ready for Testing

## What Was Implemented

### 1. Database Migration (`017_add_jobs_search_index.sql`)

**Denormalized Columns Added**:
- `company_name` (from `companies.name`)
- `company_industry` (from `companies.industry`)
- `company_headquarters_location` (from `companies.headquarters_location`)
- `search_vector` (tsvector for full-text search)

**Search Vector Weights** (A=highest, D=lowest):
- **A**: `title` - Job title is primary search target
- **B**: `description`, `recruiter_description`, `candidate_description`, `company_name` - Core job and company info
- **C**: `location`, `company_industry`, `company_headquarters_location`, `level`, `employment_type`, `department` - Supporting filters
- **D**: `status` - Low priority

**Auto-Sync Triggers**:
1. `sync_jobs_company_data` - Updates jobs when company data changes
2. `update_jobs_search_vector` - Rebuilds search vector when job fields change

**Indexes Created**:
- GIN index on `search_vector` - Fast full-text search
- Trigram indexes on `title`, `company_name`, `description` - Fallback substring matching

### 2. Repository Update (`src/v2/jobs/repository.ts`)

**Changed Search Logic**:
```typescript
// OLD: Multiple ILIKE queries with OR conditions
query = query.or('title.ilike.%search%,description.ilike.%search%,...');

// NEW: Single full-text search query
const tsquery = filters.search.split(/\s+/).filter(t => t.trim()).join(' & ');
query = query.textSearch('search_vector', tsquery, {
    type: 'websearch',
    config: 'english'
});
```

**Benefits**:
- Multi-word search: "senior engineer remote" finds jobs with all three words
- Stemming: "engineer" matches "engineering", "engineered"
- 10-100x faster than ILIKE on large datasets
- Weighted ranking: Title matches rank higher than description matches

### 3. Removed Code

**Deleted**: `parseSearchQuery()` method - No longer needed with full-text search

---

## Testing Checklist

### Prerequisites
1. ✅ Migration file created: `services/ats-service/migrations/017_add_jobs_search_index.sql`
2. ⏳ Migration needs to be applied to database
3. ⏳ ATS service needs to be restarted to load new repository code

### Migration Steps

**Apply the migration**:
```bash
# Option 1: Using Supabase CLI (if configured)
cd services/ats-service
supabase db push

# Option 2: Using psql directly
psql $DATABASE_URL -f migrations/017_add_jobs_search_index.sql

# Option 3: Using Supabase Dashboard
# Copy migration SQL and run in SQL Editor
```

### Test Cases

#### Test 1: Single Word Search
- **Query**: `engineer`
- **Expected**: Jobs with "Engineer", "Engineering", "Software Engineer" in title/description
- **Portal**: `/portal/roles?search=engineer`
- **Candidate**: `/public/jobs?search=engineer`

#### Test 2: Multi-Word Search (AND Logic)
- **Query**: `senior python remote`
- **Expected**: Only jobs with ALL three terms (in any field)
- **Portal**: `/portal/roles?search=senior+python+remote`
- **Candidate**: `/public/jobs?search=senior+python+remote`

#### Test 3: Company Name Search
- **Query**: `acme`
- **Expected**: Jobs at companies with "Acme" in name
- **Portal**: `/portal/roles?search=acme`
- **Candidate**: `/public/jobs?search=acme`

#### Test 4: Location Search
- **Query**: `san francisco`
- **Expected**: Jobs in San Francisco or with SF in description
- **Portal**: `/portal/roles?search=san+francisco`

#### Test 5: Industry Search
- **Query**: `fintech`
- **Expected**: Jobs at fintech companies (via `company_industry`)
- **Candidate**: `/public/jobs?search=fintech`

#### Test 6: Mixed Search
- **Query**: `product manager stripe`
- **Expected**: Product Manager roles at Stripe
- **Portal**: `/portal/roles?search=product+manager+stripe`

#### Test 7: Empty Search
- **Query**: `` (empty)
- **Expected**: All jobs returned (no search filter applied)
- **Portal**: `/portal/roles`

#### Test 8: Special Characters
- **Query**: `c++ developer`
- **Expected**: C++ jobs (special chars handled gracefully)
- **Candidate**: `/public/jobs?search=c%2B%2B+developer`

#### Test 9: Search + Other Filters
- **Query**: `engineer` + status filter `active`
- **Expected**: Active engineering jobs only
- **Portal**: `/portal/roles?search=engineer&status=active`

#### Test 10: Auto-Sync Test
1. Create/update a job
2. Update company name
3. Search for new company name
4. **Expected**: Job appears in search results immediately

---

## Performance Benchmarks

**Target Metrics**:
- Search query execution: <100ms (single entity)
- Index size: 5-10% of table size
- Search scales to 1M+ rows without degradation

**How to Check Query Performance**:
```sql
EXPLAIN ANALYZE 
SELECT * FROM jobs 
WHERE search_vector @@ to_tsquery('english', 'senior & engineer & remote')
LIMIT 25;
```

Look for:
- `Index Scan using jobs_search_vector_idx` (✅ Good - using GIN index)
- `Seq Scan` (❌ Bad - full table scan, index not being used)

---

## Rollback Plan

If issues occur, rollback with:

```sql
-- Drop all triggers
DROP TRIGGER IF EXISTS sync_jobs_company_data ON public.companies;
DROP TRIGGER IF EXISTS update_jobs_search_vector_trigger ON public.jobs;

-- Drop all functions
DROP FUNCTION IF EXISTS public.sync_jobs_company_data();
DROP FUNCTION IF EXISTS public.update_jobs_search_vector();
DROP FUNCTION IF EXISTS public.build_jobs_search_vector(text, text, text, text, text, text, text, text, text, text, text, text);

-- Drop all indexes
DROP INDEX IF EXISTS jobs_search_vector_idx;
DROP INDEX IF EXISTS jobs_title_trgm_idx;
DROP INDEX IF EXISTS jobs_company_name_trgm_idx;
DROP INDEX IF EXISTS jobs_description_trgm_idx;

-- Remove added columns
ALTER TABLE public.jobs 
DROP COLUMN IF EXISTS company_name,
DROP COLUMN IF EXISTS company_industry,
DROP COLUMN IF EXISTS company_headquarters_location,
DROP COLUMN IF EXISTS search_vector;
```

Then restore old repository code using git:
```bash
git checkout HEAD~1 -- services/ats-service/src/v2/jobs/repository.ts
```

---

## Next Steps

After jobs search is tested and working:

1. **Candidates Search** - Similar pattern for candidate profiles
2. **Companies Search** - Company directory search
3. **Placements Search** - Historical placements lookup
4. **Recruiters Search** - Recruiter marketplace search
5. **Global Search API** - Unified search across all entities

Each will follow the same pattern:
1. Create migration with search_vector + denormalized columns
2. Update repository to use textSearch()
3. Test multi-word searches
4. Monitor performance

---

## Troubleshooting

### Issue: Search returns no results
**Check**:
1. Was migration applied? `SELECT search_vector FROM jobs LIMIT 1;` should return data
2. Are search_vector values populated? Check for NULL values
3. Is GIN index created? `\d jobs` in psql should show `jobs_search_vector_idx`

### Issue: Search is slow (>500ms)
**Check**:
1. Run EXPLAIN ANALYZE - is GIN index being used?
2. Check table size: `SELECT pg_size_pretty(pg_total_relation_size('jobs'));`
3. Vacuum if needed: `VACUUM ANALYZE jobs;`

### Issue: Company data not syncing
**Check**:
1. Trigger exists? `\df sync_jobs_company_data` in psql
2. Update a company and check if jobs update: `SELECT company_name FROM jobs WHERE company_id = 'xxx';`

### Issue: TypeScript errors after update
**Rebuild packages**:
```bash
cd services/ats-service
pnpm build
```

---

## Success Criteria

✅ Migration applies without errors  
✅ Existing jobs have search_vector populated  
✅ Single-word searches return relevant results  
✅ Multi-word searches use AND logic  
✅ Company name searches work  
✅ Search + filters work together  
✅ Auto-sync triggers update search_vector  
✅ Query performance <100ms  
✅ No TypeScript build errors  
✅ Portal jobs list search works  
✅ Candidate jobs list search works  

---

**Status**: Ready to apply migration and test 🚀
