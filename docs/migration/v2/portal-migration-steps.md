# Portal App V2 Migration Steps

**Status**: Planning  
**Created**: December 30, 2025  
**Target**: Complete migration from legacy `/api/*` endpoints to standardized `/api/v2/*` endpoints

## 🎯 Migration Overview

The portal app requires substantial V2 migration work. While the API client has modern architecture with V2 support built-in, **26 legacy endpoints** are calling legacy paths that need to be updated to use V2 standardized routes.

### Current Architecture (Good Foundation)
- ✅ V2/V1 versioning support built-in (`version: 'v1' | 'v2' = 'v2'`)
- ✅ Separate base URLs for V1 and V2 endpoints 
- ✅ Notifications already using V2 (`/api/v2/notifications`)
- ✅ Documents upload using V2 (`/v2/documents`)

### Critical Issue
Most methods default to V2 version parameter but call legacy endpoint paths:
- `this.request('/jobs')` → `{baseV2}/jobs` → `/api/v2/jobs` (but no V2 route exists on backend)
- Should be: `this.request('/v2/jobs')` → `{baseV2}/v2/jobs` → `/api/v2/jobs`

---

## 🚨 Legacy Endpoints Inventory

### Phase 1: Core Functionality (Critical Priority)
**Target**: Essential user workflows and job management

| Method | Current Path | V2 Path | Impact |
|--------|-------------|---------|--------|
| `getCurrentUser()` | `/users/me` | `/users` | User authentication |
| `getJobs()` | `/jobs` | `/v2/jobs` | Job listings |
| `getRoles()` | `/jobs` | `/v2/jobs` | Role management |
| `getJob(id)` | `/jobs/${id}` | `/v2/jobs/${id}` | Job details |
| `createJob()` | `/jobs` | `/v2/jobs` | Job creation |
| `updateJob()` | `/jobs/${id}` | `/v2/jobs/${id}` | Job updates |
| `getApplicationsByJob()` | `/applications` | `/v2/applications` | Application listings |
| `submitCandidate()` | `/applications` | `/v2/applications` | Application submission |
| `updateApplicationStage()` | `/applications/${id}` | `/v2/applications/${id}` | Stage management |

### Phase 2: Recruiter Operations (High Priority) 
**Target**: Recruiter-specific functionality and candidate management

| Method | Current Path | V2 Path | Impact |
|--------|-------------|---------|--------|
| `getCandidates()` | `/candidates` | `/v2/candidates` | Candidate listings |
| `getRecruiterProfile()` | `/recruiters/${id}` | `/v2/recruiters/${id}` | Recruiter profiles |
| `updateRecruiterProfile()` | `/recruiters/${id}` | `/v2/recruiters/${id}` | Profile updates |
| `getPendingApplications()` | `/applications` | `/v2/applications` | Application review |
| `getApplicationFullDetails()` | `/applications/${id}` | `/v2/applications/${id}` | Application details |

### Phase 3: Supporting Features (Medium Priority)
**Target**: Secondary functionality and admin features

| Method | Current Path | V2 Path | Impact |
|--------|-------------|---------|--------|
| `getMySubscription()` | `/subscriptions` | `/v2/subscriptions` | Billing management |
| `getPlacements()` | `/placements` | `/v2/placements` | Placement tracking |
| `createPlacement()` | `/placements` | `/v2/placements` | Placement creation |
| `getDocument()` | `/documents/${id}` | `/v2/documents/${id}` | Document access |
| `getDocumentsByEntity()` | `/documents` | `/v2/documents` | Document listings |
| `deleteDocument()` | `/documents/${id}` | `/v2/documents/${id}` | Document deletion |
| `getRecruiterCandidateRelationship()` | `/recruiter-candidates` | `/v2/recruiter-candidates` | Relationship mgmt |
| `getStats()` | `/stats` | `/v2/stats` | Dashboard stats |
| `updateUser()` | `/users/${id}` | `/users/${id}` | User management |

### Phase 4: Explicit V1 Calls (Requires Backend Check)
**Target**: Methods already marked as V1 - verify if V2 routes exist

| Method | Current Path | V2 Path | Status |
|--------|-------------|---------|--------|
| `getRecruiterJobs()` | `/jobs` (V1) | `/v2/jobs` (?) | Has TODO comment |
| `recruiterSubmitApplication()` | `/applications` (V1) | `/v2/applications` (?) | Explicit V1 call |
| `requestPreScreen()` | `/applications/${id}/request-pre-screen` (V1) | `/v2/applications/${id}` (?) | Explicit V1 call |

---

## 🔧 Implementation Steps

### Step 1: Update API Client Methods
**File**: `apps/portal/src/lib/api-client.ts`

For each legacy endpoint, update the path to include `/v2/` prefix:

```typescript
// ❌ Before (Legacy)
async getJobs(params?: JobFilters): Promise<Job[]> {
  const response = await this.request('/jobs', { params });
  return response.data;
}

// ✅ After (V2)
async getJobs(params?: JobFilters): Promise<{ data: Job[], pagination?: PaginationResponse }> {
  const response = await this.request('/v2/jobs', { params });
  return response; // V2 response includes { data, pagination }
}
```

### Step 2: Handle V2 Response Format
V2 endpoints return `{ data: <payload>, pagination?: <pagination> }` format.

**Update calling code to destructure properly**:

```typescript
// ❌ Before
const jobs = await apiClient.getJobs();

// ✅ After  
const { data: jobs, pagination } = await apiClient.getJobs();
```

### Step 3: Remove `/me` Endpoint Dependencies
V2 architecture eliminates `/me` endpoints in favor of filtered queries:

```typescript
// ❌ Before
async getCurrentUser(): Promise<User> {
  return this.request('/users/me');
}

// ✅ After (use filtered query)
async getCurrentUser(): Promise<{ data: User[] }> {
  return this.request('/users?limit=1'); // Backend filters by access context
}
```

### Step 4: Progressive Loading Pattern
Implement progressive loading for better performance:

```typescript
// ✅ Progressive loading example
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true);
const [jobs, setJobs] = useState([]);
const [jobsLoading, setJobsLoading] = useState(true);

// Load critical data first
useEffect(() => {
  async function loadUser() {
    const { data } = await apiClient.getCurrentUser();
    setUser(data[0]);
    setLoading(false);
  }
  loadUser();
}, []);

// Load secondary data in parallel
useEffect(() => {
  async function loadJobs() {
    const { data } = await apiClient.getJobs();
    setJobs(data);
    setJobsLoading(false);
  }
  if (user) loadJobs();
}, [user]);
```

---

## 🧪 Testing Strategy

### Phase 1 Testing
1. **User Authentication Flow**
   - Login/logout functionality
   - User profile loading
   - Permission checks

2. **Job Management Flow**  
   - Job listings (recruiter, admin views)
   - Job creation and editing
   - Job search and filtering

3. **Application Flow**
   - Application submission
   - Stage progression  
   - Application details view

### Phase 2 Testing
1. **Recruiter Operations**
   - Recruiter profile management
   - Candidate assignment
   - Application review workflow

2. **Candidate Management**
   - Candidate listings
   - Candidate search
   - Candidate profile access

### Phase 3 Testing
1. **Supporting Features**
   - Document management
   - Billing subscription access
   - Placement creation
   - Dashboard statistics

### Testing Checklist Per Endpoint
- [ ] API response format matches V2 (`{ data, pagination }`)
- [ ] Access context filtering works correctly (role-based data)
- [ ] Pagination controls function properly
- [ ] Search and filtering parameters work
- [ ] Error handling for 400/401/403/404/500 responses
- [ ] Loading states display correctly
- [ ] Data updates propagate properly

---

## 🚀 Migration Execution Plan

### Pre-Migration Setup
1. **Backup**: Ensure all portal app code is committed
2. **Environment**: Test in development environment first
3. **Dependencies**: Verify all V2 backend endpoints are available
4. **Monitoring**: Set up error tracking for migration issues

### Migration Process
1. **Phase 1** (1-2 weeks): Core functionality migration
   - Update API client methods for user/jobs/applications
   - Update calling components to handle V2 response format
   - Test critical user workflows
   
2. **Phase 2** (1 week): Recruiter operations migration
   - Update recruiter and candidate management endpoints
   - Test recruiter workflows
   
3. **Phase 3** (1 week): Supporting features migration  
   - Update remaining endpoints
   - Complete testing suite
   
4. **Phase 4** (1 week): Legacy V1 cleanup
   - Investigate explicit V1 calls
   - Remove legacy code paths
   - Final testing and optimization

### Success Criteria
- [ ] All 26 legacy endpoints migrated to V2
- [ ] Zero calls to legacy `/api/*` endpoints (non-V2)
- [ ] All user workflows function correctly
- [ ] Performance maintained or improved
- [ ] Error handling works for all edge cases
- [ ] Progressive loading implemented for key pages

---

## 📊 Risk Assessment

### High Risk Areas
1. **User Authentication**: `getCurrentUser()` changes could break login flows
2. **Job Listings**: Core recruiter functionality depends on `getJobs()`  
3. **Application Submission**: Critical candidate workflow via `submitCandidate()`

### Mitigation Strategies
1. **Incremental Migration**: Migrate one phase at a time
2. **Feature Flags**: Use environment variables to toggle V1/V2 during testing
3. **Rollback Plan**: Keep V1 endpoints functional during migration period
4. **Monitoring**: Track API errors and response times during migration

### Dependencies
- All target V2 backend endpoints must be implemented and tested
- Shared access context package must be available
- API Gateway V2 routes must be properly configured

---

## 📋 Migration Checklist

### API Client Updates
- [ ] Update 9 Phase 1 endpoints to V2 paths
- [ ] Update 5 Phase 2 endpoints to V2 paths  
- [ ] Update 9 Phase 3 endpoints to V2 paths
- [ ] Investigate 3 Phase 4 explicit V1 calls
- [ ] Update response type definitions for V2 format

### Component Updates
- [ ] Update job listing components to destructure `{ data }`
- [ ] Update candidate components to handle pagination
- [ ] Update application components for V2 response format
- [ ] Update dashboard components for V2 stats format
- [ ] Update recruiter profile components

### Testing & Validation
- [ ] Unit tests for API client methods
- [ ] Integration tests for critical workflows
- [ ] E2E tests for user journeys
- [ ] Performance testing for paginated endpoints
- [ ] Error handling validation

### Documentation
- [ ] Update API client documentation
- [ ] Document breaking changes for components
- [ ] Update deployment procedures
- [ ] Create rollback procedures

---

## 🎯 Expected Outcomes

### Performance Improvements
- **Progressive Loading**: Faster initial page render (100-200ms vs 3-5s)
- **Reduced Network Calls**: Enriched V2 endpoints eliminate N+1 queries
- **Better Caching**: Standardized V2 responses improve caching effectiveness

### Code Quality Improvements  
- **Consistent API Patterns**: All endpoints follow standardized 5-route pattern
- **Better Error Handling**: Standardized V2 error responses
- **Type Safety**: Improved TypeScript support for V2 response format

### User Experience Improvements
- **Faster Loading**: Progressive loading reduces perceived load times
- **Better Reliability**: V2 architecture provides more robust error handling
- **Consistent Behavior**: Standardized pagination and filtering across all views

---

**Next Steps**: Begin Phase 1 migration with `getCurrentUser()`, `getJobs()`, and `getApplicationsByJob()` endpoints.