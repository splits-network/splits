# AI Service

**Status**: ✅ V2 only

AI-powered service for candidate-job fit reviews. It exposes REST endpoints for AI reviews and listens to domain events to auto-trigger reviews when applications enter the `ai_review` stage.

## Responsibilities

- **AI reviews**: Analyze candidate-job fit using OpenAI and persist results.
- **Event-driven automation**: Trigger reviews on `application.created` or `application.stage_changed`.
- **Future expansion**: Candidate matching, fraud detection, content generation (not implemented yet).

## Architecture

- V2 domain structure under `src/v2/`
- Repository + service layers backed by Supabase
- Fastify API with Swagger at `/docs`
- RabbitMQ publisher + consumer for domain events

## Environment Variables

Required:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY` (service role key is preferred; see below)
- `RABBITMQ_URL`
- `OPENAI_API_KEY`

Recommended:
- `SUPABASE_SERVICE_ROLE_KEY` (used if present, falls back to `SUPABASE_ANON_KEY`)
- `INTERNAL_SERVICE_KEY` (enables internal service auth via `x-internal-service-key`)
- `ATS_SERVICE_URL` (defaults to `http://ats-service:3003`)
- `OPENAI_MODEL` (defaults to `gpt-4o-mini`)
- `PORT` (defaults to `3009`)
- `NODE_ENV`

Optional:
- `SENTRY_DSN`
- `SENTRY_RELEASE`

## API

All endpoints require `x-clerk-user-id` unless the caller is an internal service using `x-internal-service-key`.

- `POST /api/v2/ai-reviews`
  - Creates a new AI review. You can pass minimal data (just `application_id`), and the service will fetch full application context from ATS.
  - Optional inputs include `resume_text`, `job_description`, `job_title`, `required_skills`, `preferred_skills`, and `auto_transition`.
- `GET /api/v2/ai-reviews/:id`
  - Fetch a review by ID.
- `GET /api/v2/ai-reviews`
  - List reviews with filters: `application_id`, `job_id`, `fit_score_min`, `fit_score_max`, `recommendation`, `page`, `limit`.
- `GET /api/v2/ai-reviews/stats/:jobId`
  - Aggregate review stats for a job.

## Events

Consumed:
- `application.created` (triggers review only when created in `ai_review` stage)
- `application.stage_changed` (triggers review when transitioning to `ai_review`)

Published:
- `ai_review.started`
- `ai_review.completed`
- `ai_review.failed`

## Data Storage

Reviews are stored in the `ai_reviews` table (Supabase). Responses are shaped to include:
- `skills_match: { match_percentage, matched_skills, missing_skills }`
- `experience_analysis: { candidate_years, required_years, meets_requirement }`

## Development

```bash
# Install dependencies (from repo root)
pnpm install

# Run in dev mode
pnpm --filter @splits-network/ai-service dev

# Build
pnpm --filter @splits-network/ai-service build

# Run production
pnpm --filter @splits-network/ai-service start
```

## Docker

```bash
docker-compose build ai-service
docker-compose up -d ai-service
```
