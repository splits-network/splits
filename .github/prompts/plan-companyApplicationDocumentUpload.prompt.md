# Company Application Document Upload Support Plan

When a company extends an offer to a candidate, they need to upload documents to the application (offer letters, contracts, etc.). These should be distinguished from candidate documents but reside in our document service, database and Supabase storage.

## Current State Analysis

### ✅ Already Supported
1. **Document Service V2** - Has full CRUD operations for documents
2. **Entity Pattern** - Documents use `entity_type` + `entity_id` pattern
3. **Application Documents** - `entity_type='application'` is already supported
4. **Role-based Access** - Document repository has access control logic
5. **Storage Buckets** - Multiple buckets for different entity types

### 🔍 What We Need to Add

#### 1. Document Type Differentiation
Currently, documents attached to applications don't distinguish between candidate-uploaded vs company-uploaded documents.

**Solution: Enhance `document_type` field**
```typescript
// Current document types
'resume' | 'cover_letter' | 'portfolio' | 'other'

// Add company document types  
'offer_letter' | 'employment_contract' | 'benefits_summary' | 'company_handbook' | 'nda'
```

#### 2. Upload Permission Logic
The document repository needs to allow company users to upload to applications for their company's jobs.

**Current Access Logic** (from `services/document-service/src/v2/documents/repository.ts`):
```typescript
private canModifyEntity(entityType: string, entityId: string, context: AccessContext): boolean {
    // Candidates can upload to their own profile
    if (context.candidateId && entityType === 'candidate' && entityId === context.candidateId) {
        return true;
    }
    
    // Company users can upload to company entities  
    if (context.organizationIds.length > 0 && entityType === 'company') {
        return context.organizationIds.includes(entityId);
    }
    
    // ❌ MISSING: Company users should be able to upload to applications for their jobs
}
```

**Needed Enhancement**:
```typescript
private async canModifyEntity(entityType: string, entityId: string, context: AccessContext): Promise<boolean> {
    // ... existing logic ...
    
    // Company users can upload documents to applications for their company's jobs
    if (context.organizationIds.length > 0 && entityType === 'application') {
        const { data: application } = await this.supabase
            .from('applications')
            .select('job_id, jobs!inner(company_id)')
            .eq('id', entityId)
            .maybeSingle();
            
        if (application?.jobs?.company_id && context.organizationIds.includes(application.jobs.company_id)) {
            return true;
        }
    }
    
    return false;
}
```

#### 3. Frontend Upload Component
Add document upload capability to the application detail page for company users.

**Implementation Location**: 
`apps/portal/src/app/portal/applications/[id]/components/application-detail-client.tsx`

**New Component Needed**:
```tsx
// CompanyDocumentUpload component
interface CompanyDocumentUploadProps {
    applicationId: string;
    onUploadSuccess: () => void;
    disabled?: boolean;
}

function CompanyDocumentUpload({ applicationId, onUploadSuccess, disabled }: CompanyDocumentUploadProps) {
    // Upload form specifically for company documents
    // Document types: offer_letter, employment_contract, benefits_summary, etc.
}
```

#### 4. Document Display Logic
Separate candidate documents from company documents in the UI.

**Current Display** (shows all documents together):
```tsx
{documents && documents.length > 0 && (
    <div className="card bg-base-200 shadow">
        <div className="card-body">
            <h2 className="card-title text-lg mb-4">
                <i className="fa-duotone fa-regular fa-file"></i>
                Documents
            </h2>
            {/* All documents mixed together */}
        </div>
    </div>
)}
```

**Enhanced Display** (separate sections):
```tsx
// Candidate Documents Section
<div className="card bg-base-200 shadow">
    <div className="card-body">
        <h2 className="card-title text-lg mb-4">
            <i className="fa-duotone fa-regular fa-user-tie"></i>
            Candidate Documents
        </h2>
        {candidateDocuments.map(doc => ...)}
    </div>
</div>

// Company Documents Section  
<div className="card bg-base-200 shadow">
    <div className="card-body">
        <h2 className="card-title text-lg mb-4">
            <i className="fa-duotone fa-regular fa-building"></i>
            Company Documents
            {isCompanyUser && (
                <button onClick={() => setShowCompanyUpload(true)} className="btn btn-sm btn-primary">
                    <i className="fa-duotone fa-regular fa-upload"></i>
                    Upload
                </button>
            )}
        </h2>
        {companyDocuments.map(doc => ...)}
    </div>
</div>
```

#### 5. Storage Bucket Strategy
Company documents should go to the appropriate bucket.

**Current Bucket Logic** (`services/document-service/src/storage.ts`):
```typescript
getBucketName(entityType: string): string {
    switch (entityType) {
        case 'candidate':
        case 'application':  // ❌ All application docs go to candidate bucket
            return this.buckets.candidates;
        case 'job':
        case 'company':
            return this.buckets.companies;
        default:
            return this.buckets.system;
    }
}
```

**Enhanced Logic** (consider document type):
```typescript
getBucketName(entityType: string, documentType?: string): string {
    switch (entityType) {
        case 'candidate':
            return this.buckets.candidates;
        case 'application':
            // Company documents go to company bucket, candidate docs go to candidate bucket
            const companyDocTypes = ['offer_letter', 'employment_contract', 'benefits_summary', 'company_handbook', 'nda'];
            return companyDocTypes.includes(documentType || '') 
                ? this.buckets.companies 
                : this.buckets.candidates;
        case 'job':
        case 'company':
            return this.buckets.companies;
        default:
            return this.buckets.system;
    }
}
```

## Implementation Plan

### Phase 1: Backend Support ✅ (Already Mostly Done)
1. **Document Types** - Add new company document types to shared types
2. **Access Control** - Enhance `canModifyEntity` in document repository  
3. **Bucket Logic** - Update bucket selection logic

### Phase 2: Frontend Integration
1. **Upload Component** - Create company document upload component
2. **Display Logic** - Separate candidate vs company documents in UI
3. **Permissions** - Show upload button only for company users at appropriate stages

### Phase 3: Business Logic Integration  
1. **Stage-based Upload** - Only allow company uploads at `offer` stage and beyond
2. **Notifications** - Notify candidate when company uploads documents
3. **Audit Trail** - Log company document uploads in application timeline

## Security Considerations

1. **Role-based Access**: Only company users from the same organization can upload
2. **Stage Restrictions**: Company uploads only allowed at appropriate stages
3. **Document Types**: Restrict company users to company-specific document types
4. **File Validation**: Same file size/type restrictions as candidate documents

## Questions for Clarification

1. **Stage Restrictions**: Should company document uploads be limited to `offer` stage and beyond, or allow earlier?
2. **Document Types**: What specific company document types do we need beyond `offer_letter` and `employment_contract`?
3. **Notifications**: Should candidates be notified when companies upload documents?
4. **Visibility**: Should company documents be visible to recruiters, or only to company users and candidates?

## Implementation Notes

The good news is that most of the infrastructure is already in place - we mainly need to enhance the access control logic and add the frontend components. The V2 architecture supports this use case well with its role-based access patterns.

### Key Files to Modify

1. **Backend**:
   - `services/document-service/src/v2/documents/repository.ts` - Access control enhancement
   - `services/document-service/src/storage.ts` - Bucket selection logic
   - `packages/shared-types/src/documents.ts` - Document type definitions

2. **Frontend**:
   - `apps/portal/src/app/portal/applications/[id]/components/application-detail-client.tsx` - Main application detail view
   - New component: `apps/portal/src/components/documents/CompanyDocumentUpload.tsx`
   - New component: `apps/portal/src/components/documents/DocumentSectionDisplay.tsx`

3. **API Gateway**:
   - No changes needed - proxies to document service V2 endpoints

### Database Schema

No schema changes needed. The existing documents table structure supports this use case:
- `entity_type = 'application'`
- `entity_id = application.id`
- `document_type` field distinguishes candidate vs company document types
- `uploaded_by` tracks who uploaded (candidate vs company user)
