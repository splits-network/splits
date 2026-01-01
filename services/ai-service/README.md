# AI Service

Centralized AI service for all OpenAI integrations and AI-powered features.

## Responsibilities

- **AI Reviews**: Analyzes candidate-job fit using OpenAI
- **Candidate Matching**: AI-powered job matching (future)
- **Fraud Detection**: AI-assisted anomaly detection (future)
- **Content Generation**: Job descriptions, candidate summaries (future)

## V2 Architecture

Follows standardized V2 patterns:
- Domain-based folder structure
- Repository pattern with Supabase
- Service layer with business logic
- Event publishing to RabbitMQ
- 5-route CRUD pattern where applicable

## Environment Variables

Required:
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_KEY`: Supabase service role key
- `RABBITMQ_URL`: RabbitMQ connection string
- `OPENAI_API_KEY`: OpenAI API key
- `PORT`: Service port (default: 3009)

## API Endpoints

### V2 AI Review
- `POST /v2/ai-reviews` - Create new AI review for application
- `GET /v2/ai-reviews/:id` - Get AI review by ID
- `GET /v2/ai-reviews` - List AI reviews with filters

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
