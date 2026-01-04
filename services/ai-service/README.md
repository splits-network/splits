# AI Service

**Status**: ✅ V2 ONLY - All legacy V1 implementations removed

Centralized AI service for all OpenAI integrations and AI-powered features.

## Responsibilities

- **AI Reviews**: Analyzes candidate-job fit using OpenAI  
- **Candidate Matching**: AI-powered job matching (future)
- **Fraud Detection**: AI-assisted anomaly detection (future)  
- **Content Generation**: Job descriptions, candidate summaries (future)

## V2 Architecture ✅

This service uses **V2 patterns exclusively**:
- Domain-based folder structure (`src/v2/`)
- Repository pattern with Supabase
- Service layer with business logic
- Event publishing to RabbitMQ
- 5-route CRUD pattern where applicable
- **No legacy V1 code remains**

## Environment Variables

Required:
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_KEY`: Supabase service role key
- `RABBITMQ_URL`: RabbitMQ connection string
- `OPENAI_API_KEY`: OpenAI API key
- `PORT`: Service port (default: 3009)

## API Endpoints

### V2 AI Review
- `POST /api/v2/ai-reviews` - Create new AI review for application
- `GET /api/v2/ai-reviews/:id` - Get AI review by ID
- `GET /api/v2/ai-reviews` - List AI reviews with filters

## Events

### Consumed Events (Listens For)

| Event | Exchange | Routing Key | Description |
|-------|----------|-------------|-------------|
| `application.created` | `splits-network-events` | `application.created` | Triggers AI review when new application is submitted |

### Published Events (Publishes)

| Event | Exchange | Routing Key | Description |
|-------|----------|-------------|-------------|
| `ai_review.completed` | `splits-network-events` | `ai_review.completed` | Published when AI review analysis is complete |
| `ai_review.failed` | `splits-network-events` | `ai_review.failed` | Published when AI review analysis fails |

**Event Payload** (`ai_review.completed`):
```typescript
{
  review_id: string;
  application_id: string;
  candidate_id: string;
  job_id: string;
  fit_score: number;
  recommendation: 'good_fit' | 'poor_fit' | 'review_recommended';
  analysis_completed_at: string;
}
```

## Database Schema

Uses `ai.*` schema in Supabase:
- `ai.reviews` - AI review results (fit score, analysis)
- Future: `ai.matches`, `ai.fraud_signals`, etc.

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
