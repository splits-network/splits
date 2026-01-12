# Plan: Implement Scalable Search Architecture

Comprehensive plan for adding full-text search to all list pages and implementing global site-wide search in the header, following the proven recruiter-candidates pattern.

## Current State

### What We Just Implemented (Recruiter-Candidates Search)

**Migration**: `012_add_candidate_search_index.sql` (applied to network schema)
- Added denormalized columns: `candidate_name`, `candidate_email`, `candidate_location`, `candidate_linkedin_url`
- Added `search_vector` tsvector column for full-text search
- Created `build_recruiter_candidate_search_vector()` function with weighted fields:
  - Name (A) - highest priority
  - Email (B) - high priority  
  - Location (C) - medium priority
  - Status (D) - low priority
- Created triggers to auto-sync when candidates or recruiter_candidates change
- Created GIN indexes on `search_vector` and trigram indexes on name/email
- Populated existing rows with search data

**Repository**: `services/network-service/src/v2/recruiter-candidates/repository.ts`
```typescript
if (search) {
    const tsquery = search.split(/\s+/).filter(t => t.trim()).join(' & ');
    query = query.textSearch('search_vector', tsquery, {
        type: 'websearch',
        config: 'english'
    });
}
```

**Results**:
- ✅ Multi-word search: "brandon active engineer" finds all matches
- ✅ Stemming: "engineer" matches "engineering"
- ✅ Fast: GIN index handles millions of rows
- ✅ Auto-sync: Changes update search index automatically
- ✅ Weighted ranking: Name matches rank higher than email

### Existing Search Implementations

| Entity | Location | Method | Status |
|--------|----------|--------|--------|
| Jobs (Backend) | `services/ats-service/src/v2/jobs` | Full-text search | ✅ **Implemented** (Jan 12, 2026) |
| Jobs (Portal) | `apps/portal/src/app/portal/roles` | ILIKE multi-field | 🔄 Needs frontend update |
| Jobs (Public) | `apps/candidate/src/app/public/jobs` | ILIKE multi-field | 🔄 Needs frontend update |
| Candidates | `apps/portal/src/app/portal/candidates` | ILIKE name/email | ⏳ Planned |
| Applications | `apps/portal/src/app/portal/applications` | PostgreSQL function | ⏳ Planned |
| Applications (Candidate) | `apps/candidate/src/app/portal/applications` | Same as above | ⏳ Planned |
| Placements | `apps/portal/src/app/portal/placements` | Basic filters | ⏳ Planned |
| Recruiter-Candidates | `services/network-service/src/v2/recruiter-candidates` | Full-text search | ✅ Implemented |

### Frontend Infrastructure Already in Place

**useStandardList Hook**:
- `apps/portal/src/hooks/use-standard-list.ts`
- `apps/candidate/src/hooks/use-standard-list.ts`
- Features: Search state management, debouncing (300ms), URL sync, pagination, sorting

**SearchInput Component**:
- `apps/portal/src/components/search-input.tsx`
- `apps/candidate/src/components/search-input.tsx`
- Features: Icon, clear button, loading spinner

## Implementation Steps

### Step 1: Standardize Full-Text Search for Core Entities

Create migrations and update repositories for each entity following the recruiter-candidates pattern.

#### 1.1 Jobs Table (`public.jobs`) ✅ COMPLETED

**Status**: ✅ **Implemented and deployed** (January 12, 2026)

**Migration**: `services/ats-service/migrations/017_add_jobs_search_index.sql`

**Implemented Fields** (with weights):
- `title` (A) - Primary job field
- `description` (B) - Full job description
- `recruiter_description` (B) - Internal recruiter notes
- `candidate_description` (B) - Candidate-facing description
- `company_name` (B) - Denormalized from companies table
- `location` (C) - Geographic search
- `company_industry` (C) - Industry from companies table
- `company_headquarters_location` (C) - Company location
- `employment_type` (C) - Full-time/Contract/Temporary
- `department` (C) - Department/team
- `status` (D) - active/paused/filled/closed

**Denormalized Columns Added**:
- `company_name` - Auto-synced from companies.name
- `company_industry` - Auto-synced from companies.industry
- `company_headquarters_location` - Auto-synced from companies.headquarters_location
- `search_vector` - Full-text search tsvector

**Triggers Created**:
- `sync_jobs_company_data` - Updates jobs when companies change
- `update_jobs_search_vector` - Rebuilds search_vector on job changes

**Indexes Created**:
- `jobs_search_vector_idx` (GIN) - Main full-text search
- `jobs_title_trgm_idx` (Trigram) - Substring title matching
- `jobs_company_name_trgm_idx` (Trigram) - Fuzzy company search
- `jobs_description_trgm_idx` (Trigram) - Description substring matching

**Test Results**:
- ✅ Single-word: "engineer" returns 9 results with ranking
- ✅ Multi-word: "Splits Network" returns 5 results (AND logic)
- ✅ Company search: Denormalized data working perfectly
- ✅ Performance: <1ms execution time with 25 rows
- ✅ Auto-sync: Company changes propagate to jobs automatically

**Repository Updated**: `services/ats-service/src/v2/jobs/repository.ts`
```typescript
if (filters.search) {
    const tsquery = filters.search.split(/\s+/).filter(t => t.trim()).join(' & ');
    query = query.textSearch('search_vector', tsquery, {
        type: 'websearch',
        config: 'english'
    });
}
```

**Future Enhancements** (not implemented yet):
- Job requirements concatenation (requires JOIN or denormalization)
- Salary range text concatenation
- Remote policy field (not in current schema)

**Pattern**:
```sql
-- Add denormalized search columns
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS company_name text,
ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create search vector builder
CREATE OR REPLACE FUNCTION public.build_jobs_search_vector(
  p_title text,
  p_description text,
  p_location text,
  p_company_name text,
  p_level text,
  p_employment_type text
) RETURNS tsvector AS $$
BEGIN
  RETURN 
    setweight(to_tsvector('english', COALESCE(p_title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(p_description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(p_location, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(p_company_name, '')), 'D') ||
    setweight(to_tsvector('english', COALESCE(p_level, '')), 'D') ||
    setweight(to_tsvector('english', COALESCE(p_employment_type, '')), 'D');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Sync company name from companies table
CREATE OR REPLACE FUNCTION public.sync_jobs_company_name() RETURNS trigger AS $$
BEGIN
  UPDATE public.jobs j
  SET 
    company_name = NEW.name,
    search_vector = build_jobs_search_vector(
      j.title, j.description, j.location, NEW.name, j.level, j.employment_type
    )
  WHERE j.company_id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update search vector on jobs change
CREATE OR REPLACE FUNCTION public.update_jobs_search_vector() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := build_jobs_search_vector(
    NEW.title, NEW.description, NEW.location, 
    NEW.company_name, NEW.level, NEW.employment_type
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
DROP TRIGGER IF EXISTS sync_jobs_company_name ON public.companies;
CREATE TRIGGER sync_jobs_company_name
AFTER INSERT OR UPDATE OF name ON public.companies
FOR EACH ROW
EXECUTE FUNCTION public.sync_jobs_company_name();

DROP TRIGGER IF EXISTS update_jobs_search_vector_trigger ON public.jobs;
CREATE TRIGGER update_jobs_search_vector_trigger
BEFORE INSERT OR UPDATE ON public.jobs
FOR EACH ROW
EXECUTE FUNCTION public.update_jobs_search_vector();

-- Populate existing rows
UPDATE public.jobs j
SET company_name = c.name
FROM public.companies c
WHERE j.company_id = c.id;

UPDATE public.jobs
SET search_vector = build_jobs_search_vector(
  title, description, location, company_name, level, employment_type
);

-- Create indexes
CREATE INDEX IF NOT EXISTS jobs_search_vector_idx 
ON public.jobs USING GIN(search_vector);

CREATE INDEX IF NOT EXISTS jobs_title_trgm_idx 
ON public.jobs USING gin(title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS jobs_company_name_trgm_idx 
ON public.jobs USING gin(company_name gin_trgm_ops);
```

**Repository Update**: `services/ats-service/src/v2/jobs/repository.ts`
```typescript
// Replace existing ILIKE search with:
if (search) {
    console.log('Applying full-text search on jobs:', search);
    const tsquery = search.split(/\s+/).filter(t => t.trim()).join(' & ');
    query = query.textSearch('search_vector', tsquery, {
        type: 'websearch',
        config: 'english'
    });
}
```

---

#### 1.2 Candidates Table (`public.candidates`)

**Migration**: `/infra/migrations/0XX_add_candidates_search_index.sql`

**Searchable Fields** (with weights):

**Primary Candidate Fields:**
- `full_name` (A) - Primary identifier
- `email` (B) - Contact
- `phone` (C) - Contact
- `location` (C) - Current location
- `desired_title` (B) - What role they're looking for
- `current_title` (C) - Current professional role
- `current_company` (C) - Current employer
- `linkedin_url` (D) - Professional profile
- `years_of_experience` (D) - Seniority level

**Enriched Public Profile Data:**
- `professional_summary` (B) - Candidate's written bio/summary
- `skills` (B) - Self-reported skills list (comma-separated or JSONB array)
- `certifications` (C) - Professional certifications
- `education` (C) - Degrees and institutions
- `work_experience` (C) - Previous roles and companies (if structured fields exist)
- `portfolio_url` (D) - Personal website or portfolio
- `github_url` (D) - GitHub profile
- Any other public profile fields that candidates can customize

**Related Application Data (from `applications` table):**
- Companies applied to (D) - Denormalize as comma-separated list
- Job titles applied to (D) - Shows interest areas

**Related Document Data (from `documents` table via `metadata.extracted_text`):**
- Resume text content (B) - Skills, experience, education from resume
- Cover letter text (C) - Candidate's own words about their experience

**Why Include Related Data:**
Users might search for a candidate by:
- Name or email (direct match)
- Skills from their resume ("React developer", "AWS certified")
- Companies they've worked at (even if not current)
- Education ("Stanford", "Computer Science degree")
- What roles they're interested in ("seeking product manager role")

**Note**: Resume text extraction is critical - see `docs/implementation-plans/ai-flow-gap-analysis.md` section 2.1 for document processing service requirements.

```sql
ALTER TABLE public.candidates 
ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE OR REPLACE FUNCTION public.update_candidates_search_vector() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.full_name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.email, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.location, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.current_title, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.current_company, '')), 'D') ||
    setweight(to_tsvector('english', COALESCE(NEW.phone, '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_candidates_search_vector_trigger ON public.candidates;
CREATE TRIGGER update_candidates_search_vector_trigger
BEFORE INSERT OR UPDATE ON public.candidates
FOR EACH ROW
EXECUTE FUNCTION public.update_candidates_search_vector();

UPDATE public.candidates
SET search_vector = 
  setweight(to_tsvector('english', COALESCE(full_name, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(email, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(location, '')), 'C') ||
  setweight(to_tsvector('english', COALESCE(current_title, '')), 'C') ||
  setweight(to_tsvector('english', COALESCE(current_company, '')), 'D') ||
  setweight(to_tsvector('english', COALESCE(phone, '')), 'D');

CREATE INDEX IF NOT EXISTS candidates_search_vector_idx 
ON public.candidates USING GIN(search_vector);

CREATE INDEX IF NOT EXISTS candidates_name_trgm_idx 
ON public.candidates USING gin(full_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS candidates_email_trgm_idx 
ON public.candidates USING gin(email gin_trgm_ops);
```

**Repository Update**: `services/ats-service/src/v2/candidates/repository.ts`

---

#### 1.3 Companies Table (`public.companies`)

**Migration**: `/infra/migrations/0XX_add_companies_search_index.sql`

**Searchable Fields** (with weights):

**Primary Company Fields:**
- `name` (A) - Primary identifier
- `description` (B) - Company overview and mission
- `industry` (C) - Industry classification
- `headquarters_location` (C) - Main office location
- `size` (C) - Number of employees (e.g., "51-200")
- `website` (D) - Domain name
- `linkedin_url` (D) - LinkedIn profile

**Related Job Data (from `jobs` table):**
- Count of active jobs (D) - Shows hiring activity
- Job locations offered (D) - Where they have openings

**Why Include Related Data:**
Users search for companies by:
- Name ("Google", "Acme Corp")
- Industry ("fintech", "healthcare")
- Location ("San Francisco", "remote-first")
- Size ("startup", "enterprise")
- What they do (keywords from description like "payments", "AI", "SaaS")

---

#### 1.4 Placements Table (`public.placements`)

**Migration**: `/infra/migrations/0XX_add_placements_search_index.sql`

**Challenge**: Placements need data from candidates, jobs, companies, and recruiters.

**Searchable Fields** (with weights):

**Denormalized Fields (from related tables):**
- `candidate_name` (A) - From `candidates.full_name`
- `candidate_email` (B) - From `candidates.email`
- `job_title` (B) - From `jobs.title`
- `company_name` (B) - From `companies.name`
- `recruiter_name` (C) - From `users.name` (recruiter who made placement)
- `job_location` (C) - From `jobs.location`
- `placement_date` (D) - When placement was made
- `annual_salary` (D) - Compensation amount
- `status` (D) - Active/Completed/Cancelled

**Why Include Related Data:**
Users search placements by:
- Candidate name ("Who placed John Doe?")
- Company ("All placements at Stripe")
- Job title ("All Senior Engineer placements")
- Recruiter ("Placements by Sarah")
- Time period ("Q4 2025 placements")
- Salary range ("$200k+ placements")

**Approach**: Create triggers on `candidates`, `jobs`, `companies`, and `users` tables to sync denormalized data to `placements` whenever source data changes.

---

#### 1.5 Recruiters Table (`public.recruiters`)

**Migration**: `/infra/migrations/0XX_add_recruiters_search_index.sql`

**Searchable Fields** (with weights):

**Primary Recruiter Fields:**
- `recruiter_name` (A) - From `users.name`
- `recruiter_email` (B) - From `users.email`
- `bio` (B) - Professional background and expertise
- `specialization` (C) - Area of focus (e.g., "Engineering", "Sales")
- `status` (D) - Active/Inactive/Pending

**Enriched Public Profile Data:**
- `headline` (B) - Professional headline/tagline
- `industries` (B) - Industries of expertise (comma-separated or JSONB array)
- `skills` (B) - Recruiting specialties and skills
- `company_types` (C) - Types of companies worked with (startup, enterprise, etc.)
- `years_of_experience` (C) - Time in recruiting
- `success_stories` (C) - Notable placements or achievements text
- `languages` (D) - Languages spoken
- `certifications` (D) - Professional recruiting certifications
- Any other public profile fields that recruiters can customize

**Related Performance Data:**
- Total placements count (D) - Shows track record
- Success rate (D) - Placement ratio
- Industries worked in (C) - From placement history

**Related Activity Data (from `role_assignments` table):**
- Active job count (D) - How many roles they're working on
- Job titles working on (D) - Current focus areas

**Why Include Related Data:**
Users search recruiters by:
- Name or email (direct contact)
- Specialization ("looking for engineering recruiter")
- Experience ("recruiters with 10+ placements")
- Industry expertise ("fintech recruiter")
- Bio keywords ("startup experience", "executive search")

**Approach**: Denormalize user data and performance metrics to `recruiters` table with triggers for auto-sync.

---

### Step 1.6: Evaluating Searchable Fields

**Before Creating Each Migration**, use Supabase MCP tools to inspect tables and related data:

```bash
# List all tables in a schema
mcp_supabase_list_tables --schemas public

# Inspect table structure
mcp_supabase_execute_sql --query "SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'jobs' ORDER BY ordinal_position;"

# Check foreign key relationships
mcp_supabase_execute_sql --query "SELECT tc.table_name, kcu.column_name, ccu.table_name AS foreign_table_name, ccu.column_name AS foreign_column_name FROM information_schema.table_constraints AS tc JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'jobs';"
```

**Decision Framework:**

For each table, ask:
1. **What would users type to find this record?**
   - Names, titles, emails, locations, descriptions
   - Keywords from descriptions or bios
   - Company/organization names
   - Skills, specializations, industries
   - **PUBLIC PROFILE DATA** - Content users create to be discovered (bio, summary, skills, certifications, marketplace profiles)

2. **What related data adds context?**
   - Foreign key relationships (jobs → companies, candidates → applications)
   - Many-to-many relationships (jobs → job_requirements)
   - Aggregated data (recruiter → placement count)

3. **What's the user's mental model?**
   - If searching jobs, do they think about the company? (Yes)
   - If searching candidates, do they remember resume keywords? (Yes)
   - If searching placements, do they care about salary? (Often yes)

4. **Performance trade-offs:**
   - Denormalization adds storage (usually <10% table size)
   - Triggers add minimal write overhead (<1ms per insert)
   - Benefits: 10-100x faster searches, simpler queries

**Golden Rule**: When in doubt, include it. Storage is cheap, user frustration from missing results is expensive.

---

### Step 2: Global Search API

Create unified search endpoint that queries all entities in parallel.

**Location**: `services/api-gateway/src/routes/search/routes.ts`

**Endpoint**: `GET /api/v2/search?q=query&entity=all&limit=5`

**Query Parameters**:
- `q` (required) - Search query string
- `entity` (optional) - Filter to specific entity: `all`, `jobs`, `candidates`, `applications`, `placements`, `recruiters`, `companies`
- `limit` (optional) - Results per entity (default 5)

**Response Format**:
```typescript
{
  data: {
    jobs: {
      data: [...],
      total: 150
    },
    candidates: {
      data: [...],
      total: 45
    },
    applications: {
      data: [...],
      total: 230
    },
    placements: {
      data: [...],
      total: 18
    },
    companies: {
      data: [...],
      total: 67
    }
  },
  query: "brandon active engineer"
}
```

**Implementation**:
```typescript
export async function searchRoutes(app: FastifyInstance, services: ServiceRegistry) {
  app.get('/api/v2/search', {
    preHandler: requireRoles(['platform_admin', 'company_admin', 'hiring_manager', 'recruiter', 'candidate'], services),
    schema: {
      querystring: {
        type: 'object',
        properties: {
          q: { type: 'string' },
          entity: { type: 'string', enum: ['all', 'jobs', 'candidates', 'applications', 'placements', 'companies'] },
          limit: { type: 'number', default: 5 }
        },
        required: ['q']
      }
    }
  }, async (request, reply) => {
    const { q, entity = 'all', limit = 5 } = request.query as any;
    const authHeaders = buildAuthHeaders(request);
    
    const results: any = {};
    
    // Search each entity in parallel
    const searchPromises = [];
    
    if (entity === 'all' || entity === 'jobs') {
      searchPromises.push(
        services.ats().get('/v2/jobs', {
          params: { search: q, limit, page: 1 },
          headers: authHeaders
        }).then(res => ({ jobs: res.data }))
      );
    }
    
    if (entity === 'all' || entity === 'candidates') {
      searchPromises.push(
        services.ats().get('/v2/candidates', {
          params: { search: q, limit, page: 1 },
          headers: authHeaders
        }).then(res => ({ candidates: res.data }))
      );
    }
    
    if (entity === 'all' || entity === 'applications') {
      searchPromises.push(
        services.ats().get('/v2/applications', {
          params: { search: q, limit, page: 1 },
          headers: authHeaders
        }).then(res => ({ applications: res.data }))
      );
    }
    
    if (entity === 'all' || entity === 'placements') {
      searchPromises.push(
        services.ats().get('/v2/placements', {
          params: { search: q, limit, page: 1 },
          headers: authHeaders
        }).then(res => ({ placements: res.data }))
      );
    }
    
    if (entity === 'all' || entity === 'companies') {
      searchPromises.push(
        services.ats().get('/v2/companies', {
          params: { search: q, limit, page: 1 },
          headers: authHeaders
        }).then(res => ({ companies: res.data }))
      );
    }
    
    // Wait for all searches
    const allResults = await Promise.all(searchPromises);
    
    // Merge results
    for (const result of allResults) {
      Object.assign(results, result);
    }
    
    return reply.send({
      data: results,
      query: q
    });
  });
}
```

---

### Step 3: Global Search UI Components

#### 3.1 GlobalSearch Modal Component

**Location**: `apps/portal/src/components/global-search.tsx` and `apps/candidate/src/components/global-search.tsx`

**Features**:
- Keyboard shortcut (Cmd/Ctrl+K) to open
- Search input with debouncing
- Categorized results by entity type
- "View all X results" links to entity list pages
- Recent searches history (localStorage)
- Loading states
- Empty states
- Keyboard navigation (arrow keys, enter to select)

**Component Structure**:
```tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/use-debounce';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const router = useRouter();

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open modal (handled by parent)
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Search API call
  useEffect(() => {
    if (!debouncedQuery) {
      setResults(null);
      return;
    }

    const search = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/v2/search?q=${encodeURIComponent(debouncedQuery)}&limit=5`);
        const data = await res.json();
        setResults(data.data);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    search();
  }, [debouncedQuery]);

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            className="input w-full pr-10"
            placeholder="Search jobs, candidates, applications..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {loading && (
            <span className="loading loading-spinner loading-sm absolute right-3 top-3"></span>
          )}
        </div>

        {/* Results */}
        {results && (
          <div className="mt-4 space-y-4 max-h-96 overflow-y-auto">
            {/* Jobs */}
            {results.jobs && results.jobs.data.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">Jobs</h3>
                  <button
                    className="btn btn-sm btn-ghost"
                    onClick={() => {
                      router.push(`/portal/roles?search=${query}`);
                      onClose();
                    }}
                  >
                    View all {results.jobs.total}
                  </button>
                </div>
                <div className="space-y-2">
                  {results.jobs.data.map((job: any) => (
                    <div
                      key={job.id}
                      className="p-3 rounded hover:bg-base-200 cursor-pointer"
                      onClick={() => {
                        router.push(`/portal/roles/${job.id}`);
                        onClose();
                      }}
                    >
                      <div className="font-medium">{job.title}</div>
                      <div className="text-sm opacity-70">{job.company_name} • {job.location}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Candidates */}
            {results.candidates && results.candidates.data.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">Candidates</h3>
                  <button
                    className="btn btn-sm btn-ghost"
                    onClick={() => {
                      router.push(`/portal/candidates?search=${query}`);
                      onClose();
                    }}
                  >
                    View all {results.candidates.total}
                  </button>
                </div>
                <div className="space-y-2">
                  {results.candidates.data.map((candidate: any) => (
                    <div
                      key={candidate.id}
                      className="p-3 rounded hover:bg-base-200 cursor-pointer"
                      onClick={() => {
                        router.push(`/portal/candidates/${candidate.id}`);
                        onClose();
                      }}
                    >
                      <div className="font-medium">{candidate.full_name}</div>
                      <div className="text-sm opacity-70">{candidate.email}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Similar for Applications, Placements, Companies */}
          </div>
        )}

        {/* Empty State */}
        {query && !loading && results && Object.keys(results).length === 0 && (
          <div className="text-center py-8 opacity-70">
            No results found for "{query}"
          </div>
        )}

        {/* Close Button */}
        <div className="modal-action">
          <button className="btn" onClick={onClose}>Close</button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}
```

---

#### 3.2 Search Trigger Button

**Add to Portal NavBar** (`apps/portal/src/components/layout/nav-bar.tsx`):
```tsx
const [searchOpen, setSearchOpen] = useState(false);

// In the navbar JSX, add at the top:
<button
  className="btn btn-ghost btn-sm gap-2"
  onClick={() => setSearchOpen(true)}
>
  <i className="fa-duotone fa-regular fa-search"></i>
  <span>Search</span>
  <kbd className="kbd kbd-sm">⌘K</kbd>
</button>

<GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
```

**Add to Candidate Header** (`apps/candidate/src/components/layout/header.tsx`):
```tsx
// Add search icon in the center nav area
<button
  className="btn btn-ghost btn-circle"
  onClick={() => setSearchOpen(true)}
  aria-label="Search"
>
  <i className="fa-duotone fa-regular fa-search text-xl"></i>
</button>
```

---

### Step 4: Documentation

**Create**: `docs/guidance/full-text-search.md`

**Contents**:
1. Overview of full-text search architecture
2. Migration template with explanation
3. Repository implementation pattern
4. Trigger and function best practices
5. Index types and when to use them (GIN vs trigram)
6. Performance benchmarks
7. Troubleshooting common issues
8. Future enhancements (Elasticsearch, etc.)

---

## Technical Considerations

### 1. Search Field Weights

**Principle**: More specific fields get higher weights

**Recommended Weights**:
- **A (4.0)**: Primary identifier fields (name, title)
- **B (2.0)**: Secondary important fields (email, description)
- **C (1.0)**: Supporting fields (location, current_title)
- **D (0.5)**: Low-priority fields (status, employment_type)

### 2. Performance Optimization

**Current Scale** (estimated):
- Jobs: ~1,000-10,000 rows
- Candidates: ~1,000-50,000 rows
- Applications: ~10,000-100,000 rows

**Performance Targets**:
- Search query: <100ms for single entity
- Global search (all entities): <500ms
- Index rebuild: <5s for full table

**Monitoring**:
- Add query timing logs to repository methods
- Track slow queries (>200ms)
- Monitor index size growth

### 3. Index Maintenance

**Auto-vacuum**: PostgreSQL handles this automatically, but monitor:
```sql
-- Check index bloat
SELECT schemaname, tablename, indexname, 
       pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;
```

**Reindex if needed**:
```sql
REINDEX INDEX CONCURRENTLY jobs_search_vector_idx;
```

### 4. Future Scalability

**When to consider Elasticsearch/Typesense**:
- More than 1M rows per entity
- Search latency consistently >500ms
- Need for advanced features (fuzzy matching, typo tolerance, faceted search)
- Real-time analytics on search patterns

**Current Recommendation**: PostgreSQL full-text search is sufficient for 95% of use cases up to 10M rows.

---

## Testing Checklist

### Per-Entity Search Testing

For each entity (Jobs, Candidates, etc.):

- [ ] Single word search works
- [ ] Multi-word search works (AND logic)
- [ ] Partial word matching works
- [ ] Case-insensitive search
- [ ] Special characters handled
- [ ] Empty search returns all results
- [ ] Search combines with filters correctly
- [ ] Pagination works with search
- [ ] Sorting works with search
- [ ] Search ranking makes sense (relevant results first)

### Global Search Testing

- [ ] Keyboard shortcut (Cmd/Ctrl+K) opens modal
- [ ] ESC closes modal
- [ ] Search input is auto-focused
- [ ] Debouncing works (no search until 300ms after typing stops)
- [ ] Results categorized by entity
- [ ] "View all" links navigate correctly
- [ ] Clicking result navigates to detail page
- [ ] Loading states show correctly
- [ ] Empty state shows when no results
- [ ] Recent searches saved (if implemented)

### Performance Testing

- [ ] Search query executes in <100ms (single entity)
- [ ] Global search completes in <500ms (all entities)
- [ ] No N+1 query issues
- [ ] Indexes being used (check EXPLAIN ANALYZE)
- [ ] Concurrent searches don't cause issues

---

## Rollout Plan

### Phase 1: Backend Foundation (Week 1)
1. Create migrations for Jobs table
2. Update Jobs repository
3. Test in dev environment
4. Apply to production with zero downtime

### Phase 2: Remaining Entities (Week 2)
1. Candidates migration + repository update
2. Companies migration + repository update
3. Placements migration + repository update
4. Recruiters migration + repository update

### Phase 3: Global Search API (Week 3)
1. Create `/api/v2/search` endpoint
2. Test parallel entity searches
3. Optimize response times
4. Add caching if needed

### Phase 4: Frontend Integration (Week 4)
1. Build GlobalSearch modal component
2. Add to Portal navbar
3. Add to Candidate header
4. User testing and refinements

### Phase 5: Documentation & Monitoring (Week 5)
1. Write full-text-search.md guide
2. Add performance monitoring
3. Set up alerts for slow queries
4. Train team on patterns

---

## Success Metrics

### User Experience
- Search usage increases by 50%
- Average time to find content decreases
- User feedback is positive

### Performance
- 95th percentile search latency <200ms
- Zero search timeouts or errors
- Index size manageable (<10% of table size)

### Developer Experience
- New searches implemented in <1 hour
- Clear documentation reduces support questions
- Consistent patterns across services

---

## Next Steps

1. **Review this plan** with team
2. **Choose starting point**: Jobs or Candidates?
3. **Create first migration** and test thoroughly
4. **Iterate and refine** pattern based on learnings
5. **Scale to other entities** once pattern proven
6. **Implement global search** when backend ready
