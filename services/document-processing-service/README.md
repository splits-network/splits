# Document Processing Service

A microservice for processing uploaded documents, extracting text, and enabling AI analysis.

## Features

- **Text Extraction**: PDF and DOCX support using `pdf-parse` and `mammoth`
- **V2 Architecture**: Standardized 5-route pattern with access context
- **Event-Driven**: Processes `document.uploaded` events via RabbitMQ
- **Retroactive Processing**: Handles existing pending documents on startup
- **AI Ready**: Extracted text enables AI reviews and analysis

## API Endpoints

### V2 Routes (RESTful)

- `GET /v2/documents` - List documents with filtering
- `GET /v2/documents/:id` - Get document by ID
- `PATCH /v2/documents/:id` - Update document (single method for all updates)

### System Routes

- `GET /health` - Health check
- `GET /stats` - Processing statistics

## Events

### Consumed Events (Listens For)

| Event | Exchange | Routing Key | Description | 
|-------|----------|-------------|-------------|
| `document.uploaded` | `splits-network-events` | `document.uploaded` | Published by document-service when new document is uploaded |

**Event Payload** (`document.uploaded`):
```typescript
{
  document_id: string;
  entity_type: 'application' | 'candidate' | 'job' | 'company';
  entity_id: string;
  file_path: string;
  mime_type: string;
  file_size: number;
  uploaded_at: string;
  uploaded_by: string;
}
```

### Published Events (Publishes)

| Event | Exchange | Routing Key | Description |
|-------|----------|-------------|-------------|
| `document.processed` | `splits-network-events` | `document.processed` | Published when text extraction completes |
| `document.failed` | `splits-network-events` | `document.failed` | Published when text extraction fails |

**Event Payload** (`document.processed`):
```typescript
{
  document_id: string;
  entity_type: string;
  entity_id: string;
  processing_status: 'processed' | 'failed';
  text_length: number;
  structured_data_available: boolean;
  embedding_generated: boolean;
  processed_at: string;
  processing_time_ms: number;
  error?: string;
}
```

## Document Processing Flow

1. Document uploaded → `document.uploaded` event published
2. Service receives event and marks document as `processing`
3. Downloads document from Supabase Storage
4. Extracts text using appropriate parser (PDF/DOCX)
5. Validates extraction quality
6. Updates document with extracted text in `metadata.extracted_text`
7. Publishes `document.processed` event

## Critical Information

⚠️ **Known Issue**: This service addresses the [document text extraction bug](../../docs/implementation-plans/ai-flow-gap-analysis.md#21-document-text-extraction-bug) that was blocking AI reviews.

**Key Fix**: 
- Extracts text from documents and stores in `metadata.extracted_text`
- AI service can now access resume text for quality reviews
- Processes 99+ existing pending documents on startup

## Environment Variables

```bash
# Supabase
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_KEY=your-service-key

# RabbitMQ
RABBITMQ_URL=amqp://localhost:5672

# Service
PORT=3006
LOG_LEVEL=info
```

## Development

```bash
# Install dependencies
pnpm install

# Start in development mode
pnpm dev

# Build
pnpm build

# Start production
pnpm start
```

## Architecture Compliance

This service follows **V2 Architecture** patterns:

- ✅ Single PATCH method for all updates
- ✅ Access context integration for role-based authorization
- ✅ Domain-based folder structure under `src/v2/`
- ✅ Standardized response format: `{ data: ... }`
- ✅ Event-driven coordination (no HTTP service calls)

## Related Services

- **AI Service**: Consumes extracted text for candidate-job fit analysis
- **Document Service**: Manages document uploads and storage
- **ATS Service**: Links documents to applications and candidates

## Processing Status Flow

```
pending → processing → processed | failed
```

- **pending**: Document uploaded but not yet processed
- **processing**: Currently extracting text
- **processed**: Text extraction completed successfully
- **failed**: Extraction failed (with error details)