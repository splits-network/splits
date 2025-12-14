# Document Service - Supabase Storage Integration

## Overview

The document-service provides universal document storage and management for the Splits Network platform using Supabase Storage.

## Architecture

### Service Details
- **Port**: 3006
- **Database Schema**: `storage`
- **Storage Provider**: Supabase Storage (S3-compatible)
- **Framework**: Fastify + TypeScript

### Storage Buckets

Three primary buckets for organizing documents:

1. **candidate-documents**
   - Resumes
   - Cover letters
   - Supporting documents for candidate profiles

2. **company-documents**
   - Job descriptions
   - Company agreements
   - Recruitment contracts

3. **system-documents** (future)
   - Platform contracts
   - Invoices
   - Receipts

## Database Schema

### `documents.documents` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `entity_type` | ENUM | Type of entity (candidate, job, application, company, etc.) |
| `entity_id` | UUID | ID of the related entity |
| `document_type` | ENUM | Category (resume, cover_letter, job_description, etc.) |
| `filename` | VARCHAR(500) | Original filename |
| `storage_path` | TEXT | Full path in Supabase Storage |
| `bucket_name` | VARCHAR(100) | Supabase bucket name |
| `content_type` | VARCHAR(100) | MIME type |
| `file_size` | INTEGER | File size in bytes |
| `uploaded_by_user_id` | UUID | User who uploaded (optional) |
| `processing_status` | ENUM | pending, processing, processed, failed |
| `metadata` | JSONB | Extracted metadata and tags |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |
| `deleted_at` | TIMESTAMPTZ | Soft delete timestamp |

### Enums

**entity_type**:
- `candidate`
- `job`
- `application`
- `company`
- `placement`
- `contract`
- `invoice`

**document_type**:
- `resume`
- `cover_letter`
- `job_description`
- `company_document`
- `contract`
- `invoice`
- `receipt`
- `agreement`
- `other`

**processing_status**:
- `pending` - Just uploaded
- `processing` - Text extraction/analysis in progress
- `processed` - Processing complete
- `failed` - Processing failed

## API Endpoints

### Upload Document
```
POST /documents/upload
Content-Type: multipart/form-data

Fields:
- file: <binary>
- entity_type: string
- entity_id: UUID
- document_type: string
- uploaded_by_user_id: UUID (optional)
- metadata: JSON (optional)

Response:
{
  "id": "uuid",
  "filename": "resume.pdf",
  "storage_path": "candidate/123/1234567890-abc123-resume.pdf",
  "bucket_name": "candidate-documents",
  "content_type": "application/pdf",
  "file_size": 102400,
  "entity_type": "candidate",
  "entity_id": "123",
  "created_at": "2024-12-14T..."
}
```

### Get Document
```
GET /documents/:id

Response:
{
  "id": "uuid",
  "filename": "resume.pdf",
  "downloadUrl": "https://supabase.co/storage/v1/object/sign/...",
  "content_type": "application/pdf",
  "file_size": 102400,
  ...
}
```

### List Documents
```
GET /documents?entity_type=candidate&entity_id=123&limit=10&offset=0

Query params:
- entity_type (optional)
- entity_id (optional)
- document_type (optional)
- uploaded_by_user_id (optional)
- limit (default: 50)
- offset (default: 0)

Response:
{
  "documents": [...],
  "total": 25
}
```

### Get Documents by Entity
```
GET /documents/entity/:entityType/:entityId

Example:
GET /documents/entity/candidate/123e4567-e89b-12d3-a456-426614174000

Response:
{
  "documents": [...]
}
```

### Delete Document
```
DELETE /documents/:id

Response: 204 No Content
```

### Update Processing Status (Internal)
```
PATCH /documents/:id/status

Body:
{
  "status": "processed",
  "metadata": {
    "text_length": 5000,
    "keywords": ["java", "python", "aws"]
  }
}
```

## File Validation

### Size Limits
- Default: 10MB
- Configurable via `MAX_FILE_SIZE_MB` environment variable

### Allowed MIME Types
- `application/pdf` - PDF documents
- `application/msword` - MS Word (.doc)
- `application/vnd.openxmlformats-officedocument.wordprocessingml.document` - MS Word (.docx)
- `text/plain` - Plain text files
- `application/rtf` - Rich Text Format

### Validation Process
1. Check file size against limit
2. Detect MIME type from file buffer
3. Verify against allowed types
4. Sanitize filename
5. Generate unique storage path

## Security

### Access Control
- All endpoints require authentication through API Gateway
- Document deletion requires recruiter, company_admin, or platform_admin role
- Signed URLs expire after 1 hour

### Storage Paths
Files are organized by entity type and ID:
```
{entity_type}/{entity_id}/{timestamp}-{uuid}-{sanitized_filename}
```

Example:
```
candidate/123e4567-e89b-12d3-a456-426614174000/1702569600-abc123-john_doe_resume.pdf
```

## Integration Points

### API Gateway Routes
- `POST /api/documents/upload` → document-service
- `GET /api/documents/:id` → document-service
- `GET /api/documents` → document-service (with filters)
- `GET /api/documents/entity/:entityType/:entityId` → document-service
- `DELETE /api/documents/:id` → document-service (RBAC protected)

### Frontend Integration
Example: Candidate submission with resume upload

```typescript
const formData = new FormData();
formData.append('file', resumeFile);
formData.append('entity_type', 'candidate');
formData.append('entity_id', candidateId);
formData.append('document_type', 'resume');
formData.append('uploaded_by_user_id', userId);

const response = await fetch('/api/documents/upload', {
  method: 'POST',
  body: formData,
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## Environment Variables

```env
PORT=3006
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
MAX_FILE_SIZE_MB=10
ALLOWED_MIME_TYPES=application/pdf,application/msword,...
```

## Future Enhancements

### Phase 2+
- **Text Extraction**: Extract text from PDFs/DOCs for search
- **Virus Scanning**: Integrate ClamAV or similar
- **OCR**: Process scanned documents
- **Thumbnail Generation**: Create previews for PDFs
- **Version Control**: Track document versions
- **Sharing**: Generate shareable links with expiration
- **Compression**: Automatic file size optimization
- **Format Conversion**: Convert DOC → PDF automatically

## Development

### Local Setup
```bash
cd services/document-service
pnpm install
pnpm dev
```

### Testing
```bash
# Upload test document
curl -X POST http://localhost:3006/documents/upload \
  -F "file=@resume.pdf" \
  -F "entity_type=candidate" \
  -F "entity_id=123e4567-e89b-12d3-a456-426614174000" \
  -F "document_type=resume"
```

### Docker Compose
Service runs on port 3006 and is automatically registered with API Gateway.

### Kubernetes
Deployment manifests available in `infra/k8s/document-service/`.

## Migration

### Applying the Storage Schema
```bash
# Connect to Supabase and run:
psql -h db.project.supabase.co -U postgres -d postgres \
  -f infra/migrations/007_create_storage_schema.sql
```

### Creating Storage Buckets
Buckets are created automatically on service startup in development mode. For production, create them manually in Supabase dashboard or via migration script.

## Monitoring

### Health Check
```
GET /health

Response:
{
  "status": "ok",
  "service": "document-service"
}
```

### Key Metrics to Track
- Upload success/failure rate
- Average file size
- Storage usage by bucket
- Download request rate
- Processing job queue length (future)

---

## Frontend Integration

### React Components

#### SubmitCandidateModal
Upload resumes during candidate submission:

```tsx
// Optional resume upload during candidate creation
const [resumeFile, setResumeFile] = useState<File | null>(null);

<input 
    type="file"
    accept=".pdf,.doc,.docx,.txt"
    onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
/>

// After creating candidate
if (resumeFile && response.data?.candidate?.id) {
    const formData = new FormData();
    formData.append('file', resumeFile);
    formData.append('entity_type', 'candidate');
    formData.append('entity_id', response.data.candidate.id);
    formData.append('document_type', 'resume');
    await client.uploadDocument(formData);
}
```

#### DocumentList Component
Display and manage documents for any entity:

```tsx
<DocumentList
    entityType="candidate"
    entityId={candidateId}
    showUpload={true}
/>
```

Features:
- Lists all documents for an entity
- Download button (opens signed URL in new tab)
- Delete button with confirmation
- File type icons (PDF, Word, Text)
- File size and upload date display
- Processing status badges
- Optional upload button

#### UploadDocumentModal
Standalone modal for uploading documents:

```tsx
<UploadDocumentModal
    entityType="candidate"
    entityId={candidateId}
    documentType="resume"
    onClose={() => setShowModal(false)}
    onSuccess={() => {
        setShowModal(false);
        refreshDocuments();
    }}
/>
```

Document type options:
- `resume`, `cover_letter`, `job_description`
- `contract`, `invoice`, `other`

#### CandidatePipeline Integration
Expandable candidate rows with document management:

```tsx
// Click to expand candidate row
{isExpanded && (
    <tr>
        <td colSpan={6}>
            <DocumentList
                entityType="candidate"
                entityId={application.candidate_id}
                showUpload={true}
            />
        </td>
    </tr>
)}
```

### API Client Methods

```typescript
// Upload document with multipart form data
async uploadDocument(formData: FormData) {
    // Don't set Content-Type - browser adds multipart boundary
    const response = await fetch(`${baseUrl}/documents/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
    });
    return response.json();
}

// Get document metadata and signed download URL
async getDocument(id: string) {
    return this.request(`/documents/${id}`);
}

// List all documents for an entity
async getDocumentsByEntity(entityType: string, entityId: string) {
    return this.request(`/documents/entity/${entityType}/${entityId}`);
}

// Delete document (soft delete)
async deleteDocument(id: string) {
    return this.request(`/documents/${id}`, { method: 'DELETE' });
}
```

### Common Usage Patterns

#### 1. Upload During Entity Creation
```typescript
// Step 1: Create entity
const candidate = await client.submitCandidate(formData);

// Step 2: Upload document if provided
if (resumeFile && candidate.data?.candidate?.id) {
    const uploadData = new FormData();
    uploadData.append('file', resumeFile);
    uploadData.append('entity_type', 'candidate');
    uploadData.append('entity_id', candidate.data.candidate.id);
    uploadData.append('document_type', 'resume');
    await client.uploadDocument(uploadData);
}
```

#### 2. Upload Additional Documents
```typescript
// Show upload modal for existing entity
const [showModal, setShowModal] = useState(false);

<button onClick={() => setShowModal(true)}>
    Add Document
</button>

{showModal && (
    <UploadDocumentModal
        entityType="candidate"
        entityId={candidateId}
        onClose={() => setShowModal(false)}
        onSuccess={() => {
            setShowModal(false);
            refreshDocuments();
        }}
    />
)}
```

#### 3. Display and Manage Documents
```typescript
// In detail view or expanded row
<DocumentList
    entityType="candidate"
    entityId={candidateId}
    showUpload={true}
/>
```

#### 4. Download Document
```typescript
// Get signed URL and open in new tab
const handleDownload = async (docId: string) => {
    const response = await client.getDocument(docId);
    if (response.data?.signed_url) {
        window.open(response.data.signed_url, '_blank');
    }
};
```

### File Validation

Client-side validation before upload:

```typescript
const validateFile = (file: File): string | null => {
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'application/rtf'
    ];
    
    if (!allowedTypes.includes(file.type)) {
        return 'Please upload a PDF, DOC, DOCX, TXT, or RTF file';
    }
    
    if (file.size > 10 * 1024 * 1024) {
        return 'File size must be less than 10MB';
    }
    
    return null;
};
```

### Error Handling

```typescript
try {
    await client.uploadDocument(formData);
} catch (err: any) {
    if (err.message.includes('File too large')) {
        setError('File must be under 10MB');
    } else if (err.message.includes('Invalid file type')) {
        setError('Only PDF, DOC, DOCX, TXT, and RTF files are allowed');
    } else {
        setError('Upload failed. Please try again.');
    }
}
```

---

## Security & Access Control

### Row Level Security (RLS)

The `documents.documents` table uses RLS policies:

```sql
-- Users can view documents for entities they have access to
CREATE POLICY "Users can view their documents" ON documents.documents
FOR SELECT USING (
    entity_type = 'candidate' AND entity_id IN (
        SELECT candidate_id FROM ats.applications WHERE recruiter_id = auth.uid()
    )
);

-- Users can upload documents for entities they manage
CREATE POLICY "Users can upload documents" ON documents.documents
FOR INSERT WITH CHECK (
    entity_type = 'candidate' AND entity_id IN (
        SELECT candidate_id FROM ats.applications WHERE recruiter_id = auth.uid()
    )
);
```

### Signed URLs

- Download URLs are signed with 1-hour expiration
- URLs are generated on-demand via `getDocument` endpoint
- No direct Supabase Storage URLs exposed to clients

### File Type Validation

Server-side validation using `file-type` library:

```typescript
const detectedType = await fileType.fromBuffer(buffer);
const allowedTypes = ['application/pdf', 'application/msword', ...];

if (!allowedTypes.includes(detectedType.mime)) {
    throw new Error('Invalid file type');
}
```
