# Document Storage - Implementation Summary

## ✅ What Was Built

A complete universal document storage system for the Splits Network platform, enabling resume uploads during candidate submission and document management throughout the application lifecycle.

## 🏗️ Architecture

### Backend (document-service)
- **Port**: 3006
- **Framework**: Fastify + TypeScript
- **Storage**: Supabase Storage (S3-compatible)
- **Database**: PostgreSQL with `documents` schema

### Frontend Components
- **SubmitCandidateModal**: Upload resumes during candidate creation
- **DocumentList**: Display/download/delete documents for any entity
- **UploadDocumentModal**: Add documents to existing entities
- **CandidatePipeline**: Expandable rows showing candidate documents

## 📦 What Was Created

### Backend Services
1. `services/document-service/`
   - `src/index.ts` - Fastify server setup
   - `src/storage.ts` - Supabase Storage client wrapper
   - `src/repository.ts` - Database operations
   - `src/service.ts` - Business logic & validation
   - `src/routes.ts` - REST API endpoints
   - `package.json` - Dependencies (file-type, @fastify/multipart)

2. `infra/migrations/007_create_storage_schema.sql`
   - `documents` schema (renamed from 'storage' - Supabase reserved name)
   - `documents.documents` table with metadata
   - 3 enums: entity_type, document_type, processing_status
   - Indexes for performance
   - RLS policies for security
   - Trigger for updated_at

3. API Gateway Integration
   - Service registration in `api-gateway/src/index.ts`
   - Routes added in `api-gateway/src/routes.ts`
   - RBAC protection on document endpoints

4. Infrastructure
   - Docker Compose: document-service on port 3006
   - Kubernetes: deployment, service, env config maps

### Frontend Components
1. **API Client** (`apps/portal/src/lib/api-client.ts`)
   - `uploadDocument()` - Multipart form upload
   - `getDocument()` - Get metadata + signed URL
   - `getDocumentsByEntity()` - List entity documents
   - `deleteDocument()` - Soft delete

2. **SubmitCandidateModal** (`apps/portal/src/app/(authenticated)/roles/[id]/components/SubmitCandidateModal.tsx`)
   - File input with validation
   - Uploads resume after candidate creation
   - 10MB size limit, PDF/DOC/DOCX/TXT only

3. **DocumentList** (`apps/portal/src/components/DocumentList.tsx`)
   - Lists documents with icons (PDF, Word, Text)
   - Download button (signed URL)
   - Delete button with confirmation
   - File size and date display
   - Processing status badges
   - Optional upload button

4. **UploadDocumentModal** (`apps/portal/src/components/UploadDocumentModal.tsx`)
   - Document type selection
   - File validation
   - Upload progress
   - Error handling

5. **CandidatePipeline** (`apps/portal/src/app/(authenticated)/roles/[id]/components/CandidatePipeline.tsx`)
   - Expandable candidate rows
   - Shows DocumentList when expanded
   - Upload capability enabled

### Documentation
1. `docs/DOCUMENT-SERVICE.md` - Complete service documentation
2. `services/document-service/README.md` - Quick start guide
3. Frontend integration examples added to main doc

## 🔑 Key Features

### File Upload
- ✅ Multipart form data handling
- ✅ Client & server-side validation
- ✅ 10MB file size limit
- ✅ Allowed types: PDF, DOC, DOCX, TXT, RTF
- ✅ MIME type detection with file-type library

### Storage
- ✅ Three buckets: candidate-documents, company-documents, system-documents
- ✅ Organized paths: `{entity_type}/{entity_id}/{timestamp}-{uuid}-{filename}`
- ✅ Automatic bucket creation in dev mode

### Security
- ✅ Row Level Security (RLS) policies
- ✅ Signed URLs with 1-hour expiration
- ✅ Authentication via Clerk JWT
- ✅ RBAC at API Gateway level

### Database
- ✅ Full metadata tracking
- ✅ Soft deletes (deleted_at)
- ✅ Processing status tracking
- ✅ JSONB metadata for extensibility
- ✅ Indexes on entity lookups

## 🔄 Upload Flow

### Candidate Submission with Resume
```
1. User fills candidate form + selects resume file
2. Portal validates file (size, type)
3. Submit candidate to API Gateway → ATS Service
4. ATS Service creates candidate, returns candidate_id
5. Portal uploads resume to API Gateway → Document Service
6. Document Service validates, uploads to Supabase Storage
7. Document Service creates metadata record in DB
8. Success: candidate created with resume attached
```

### Additional Document Upload
```
1. User expands candidate row in pipeline
2. DocumentList component loads existing documents
3. User clicks "Add Document" button
4. UploadDocumentModal opens
5. User selects document type and file
6. Upload to Document Service
7. DocumentList refreshes to show new document
```

### Document Download
```
1. User clicks download button
2. Frontend calls API Gateway /documents/:id
3. Document Service generates signed URL (1hr expiry)
4. Returns signed URL to frontend
5. Frontend opens URL in new tab
6. Browser downloads directly from Supabase Storage
```

## 🐛 Issues Fixed

1. **Package Versioning**
   - file-type v19 doesn't exist → Changed to v21.1.1
   - @fastify/multipart was missing → Added v9.3.0

2. **Schema Conflict**
   - 'storage' schema is reserved by Supabase
   - Permission denied error on migration
   - Solution: Renamed to 'documents' schema

3. **Migration Application**
   - Used mcp_supabase_apply_migration tool
   - Successfully created schema and tables
   - Applied 2024-12-14

## 📊 Database Schema

### documents.documents Table
```sql
CREATE TABLE documents.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type documents.entity_type NOT NULL,
    entity_id UUID NOT NULL,
    document_type documents.document_type NOT NULL,
    original_filename VARCHAR(500) NOT NULL,
    storage_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    processing_status documents.processing_status DEFAULT 'pending',
    uploaded_by_user_id UUID,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
```

### Indexes
- `idx_documents_entity` - Fast entity lookups
- `idx_documents_type` - Filter by document type
- `idx_documents_uploader` - User's uploads
- `idx_documents_created` - Chronological sorting

## 🚀 Usage Examples

### Upload Resume During Candidate Submission
```tsx
const [resumeFile, setResumeFile] = useState<File | null>(null);

// In form
<input 
    type="file"
    accept=".pdf,.doc,.docx,.txt"
    onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
/>

// After candidate created
if (resumeFile && candidate.id) {
    const formData = new FormData();
    formData.append('file', resumeFile);
    formData.append('entity_type', 'candidate');
    formData.append('entity_id', candidate.id);
    formData.append('document_type', 'resume');
    await client.uploadDocument(formData);
}
```

### Display Documents
```tsx
<DocumentList
    entityType="candidate"
    entityId={candidateId}
    showUpload={true}
/>
```

### Upload Additional Documents
```tsx
<UploadDocumentModal
    entityType="candidate"
    entityId={candidateId}
    onClose={() => setShowModal(false)}
    onSuccess={refreshDocuments}
/>
```

## 🔮 Future Enhancements

### Phase 2
- Text extraction from PDFs for search
- OCR for scanned documents
- Thumbnail generation
- Virus scanning integration

### Phase 3
- Version control for documents
- Shareable links with expiration
- Format conversion (DOC → PDF)
- Automatic compression

## ✅ Testing Checklist

- [ ] Start document-service: `pnpm --filter document-service dev`
- [ ] Start portal: `pnpm --filter portal dev`
- [ ] Submit candidate with resume
- [ ] View candidate in pipeline
- [ ] Expand candidate row
- [ ] See resume in DocumentList
- [ ] Download resume (opens in new tab)
- [ ] Upload additional document
- [ ] Delete document
- [ ] Check database: `SELECT * FROM documents.documents;`
- [ ] Check Supabase Storage buckets

## 📝 Notes

- Resume upload is **optional** during candidate submission
- Documents can be added anytime after entity creation
- Download URLs expire after 1 hour (regenerate on demand)
- Soft deletes preserve audit trail (deleted_at)
- Supabase Storage has 1GB free tier (expandable)

## 🎯 Success Criteria

✅ Recruiters can upload resumes when submitting candidates
✅ Resumes are stored securely in Supabase Storage
✅ Documents can be viewed and downloaded
✅ Documents can be deleted (soft delete)
✅ System supports multiple document types
✅ Architecture is universal (works for any entity type)
✅ Frontend is integrated with candidate pipeline
✅ Error handling and validation in place

---

**Status**: ✅ Complete and ready for testing
**Date**: December 14, 2024
**Migration Applied**: Yes (007_create_storage_schema.sql)
**Frontend Integrated**: Yes
