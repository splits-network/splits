# Document Service

Universal document storage and processing service for Splits 

## Overview

Handles file uploads, storage, and processing for all document types across the platform:
- Candidate resumes and cover letters
- Job descriptions and company documents
- Contracts and agreements (future)
- Invoices and receipts (future)

## Technology Stack

- **Storage**: Supabase Storage (S3-compatible)
- **Database**: Supabase Postgres (`storage` schema)
- **Processing**: File type validation, size limits, virus scanning (future)

## Features

- Multi-entity document attachments (candidates, jobs, applications, companies)
- Secure pre-signed URLs for uploads/downloads
- File type validation (PDF, DOCX, TXT, etc.)
- Size limits (10MB default, configurable)
- Metadata extraction and storage
- Processing status tracking

## Storage Buckets

- `candidate-documents` - Resumes, cover letters
- `company-documents` - Job descriptions, agreements
- `system-documents` - Contracts, invoices (future)

## API Endpoints

### Upload Document
`POST /documents/upload`

**Body (multipart/form-data):**
```json
{
  "file": "<file>",
  "entity_type": "candidate",
  "entity_id": "uuid",
  "document_type": "resume"
}
```

### Get Document
`GET /documents/:id`

Returns document metadata and signed download URL.

### List Documents
`GET /documents`

**Query params:**
- `entity_type` - Filter by entity type
- `entity_id` - Filter by entity ID
- `document_type` - Filter by document type

### Delete Document
`DELETE /documents/:id`

Soft delete (marks as deleted, removes from storage).

## Environment Variables

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
MAX_FILE_SIZE_MB=10
ALLOWED_MIME_TYPES=application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain
```

## Development

```bash
pnpm install
pnpm dev
```

## Testing

```bash
# Upload a test document
curl -X POST http://localhost:3006/documents/upload \
  -F "file=@resume.pdf" \
  -F "entity_type=candidate" \
  -F "entity_id=123e4567-e89b-12d3-a456-426614174000" \
  -F "document_type=resume"
```
