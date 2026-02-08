# ATS Service

**Status**: ✅ V2 ONLY - All legacy V1 implementations removed

The ATS (Applicant Tracking System) Service manages core recruiting data including companies, jobs, candidates, applications, and placements.

## Responsibilities

- **Companies**: Company profiles and organizational data
- **Jobs**: Job postings, requirements, pre-screening questions
- **Candidates**: Candidate profiles and document management
- **Applications**: Application lifecycle, stages, and notes
- **Placements**: Successful placements and recruiter assignments
- **AI Reviews**: Integration with AI service for candidate-job fit analysis
- **Statistics**: Dashboard metrics and analytics

## V2 Architecture ✅

This service uses **V2 patterns exclusively**:

- Domain-based folder structure (`src/v2/`)
- Repository pattern with direct Supabase access
- Service layer with business logic and validation
- Event publishing to RabbitMQ for coordination
- 5-route CRUD pattern for all resources
- Role-based access control via shared access context
- **No legacy V1 code remains**

## Environment Variables

Required:

- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key
- `RABBITMQ_URL`: RabbitMQ connection string
- `PORT`: Service port (default: 3002)

Optional:

- `SENTRY_DSN`: Error tracking and monitoring
- `SENTRY_RELEASE`: Release version for Sentry

## API Endpoints

All endpoints follow V2 standardized patterns:

### Companies (`/api/v2/companies`)

- `GET /v2/companies` - List companies (role-filtered)
- `GET /v2/companies/:id` - Get company details
- `POST /v2/companies` - Create company
- `PATCH /v2/companies/:id` - Update company
- `DELETE /v2/companies/:id` - Soft delete company

### Jobs (`/api/v2/jobs`)

- `GET /v2/jobs` - List jobs with filtering and search
- `GET /v2/jobs/:id` - Get job with optional includes (requirements, pre-screen, etc.)
- `POST /v2/jobs` - Create new job posting
- `PATCH /v2/jobs/:id` - Update job details
- `DELETE /v2/jobs/:id` - Soft delete job

### Candidates (`/api/v2/candidates`)

- `GET /v2/candidates` - List candidates (role-filtered)
- `GET /v2/candidates/:id` - Get candidate profile
- `POST /v2/candidates` - Create candidate profile
- `PATCH /v2/candidates/:id` - Update candidate
- `DELETE /v2/candidates/:id` - Soft delete candidate

### Applications (`/api/v2/applications`)

- `GET /v2/applications` - List applications with filtering
- `GET /v2/applications/:id?include=candidate,job,documents,ai_review` - Get application with related data
- `POST /v2/applications` - Submit new application
- `PATCH /v2/applications/:id` - Update application (stage, notes, etc.)
- `DELETE /v2/applications/:id` - Withdraw application

### Placements (`/api/v2/placements`)

- `GET /v2/placements` - List placements (role-filtered)
- `GET /v2/placements/:id` - Get placement details
- `POST /v2/placements` - Create placement record
- `PATCH /v2/placements/:id` - Update placement
- `DELETE /v2/placements/:id` - Soft delete placement

### Additional Resources

- **Job Requirements**: `/api/v2/job-requirements` - Job skill/experience requirements
- **Pre-Screen Questions**: `/api/v2/job-pre-screen-questions` - Job-specific questionnaires
- **Pre-Screen Answers**: `/api/v2/job-pre-screen-answers` - Candidate responses
- **Statistics**: `/api/v2/stats` - Dashboard metrics and analytics

## Database Schema

Uses `*` schema in shared Supabase database:

- `companies` - Company profiles
- `jobs` - Job postings and details
- `candidates` - Candidate profiles
- `applications` - Application records and stages
- `placements` - Successful placement records
- `job_requirements` - Job skill requirements
- `job_pre_screen_questions` - Pre-screening questionnaires
- `job_pre_screen_answers` - Candidate questionnaire responses

## Events Published

The service publishes domain events for coordination:

- `company.created`, `company.updated`, `company.deleted`
- `job.created`, `job.updated`, `job.deleted`
- `candidate.created`, `candidate.updated`, `candidate.deleted`
- `application.created`, `application.stage_changed`, `application.updated`
- `placement.created`, `placement.updated`

## Role-Based Access

Access control uses shared access context patterns:

- **Candidates**: See only their own data
- **Recruiters**: See assigned candidates and applications
- **Company Users**: See organization-scoped data
- **Platform Admins**: Full access to all data

## Development

### Local Development

```bash
# Install dependencies
pnpm install

# Start in development mode
pnpm dev

# Build for production
pnpm build
```

### Testing

Service includes comprehensive test coverage for repositories, services, and routes.

### API Documentation

- Swagger docs available at `/docs` when running locally
- OpenAPI spec covers all V2 endpoints with examples

## Migration Notes

**V1 Cleanup Completed**: January 2, 2026

- Removed all legacy V1 routes, services, and repositories
- Removed unused integration code (moved to `FUTURE-INTEGRATIONS.md`)
- Updated to V2-only architecture throughout
- All functionality preserved in V2 implementations

## Future Enhancements

See `FUTURE-INTEGRATIONS.md` for planned ATS integration features (Greenhouse, Lever, etc.)

---

**Last Updated**: January 2, 2026  
**V1 Cleanup Status**: ✅ COMPLETE
