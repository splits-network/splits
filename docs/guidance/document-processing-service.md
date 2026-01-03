# Document Processing Service - Architecture Guidance

This document outlines the architecture and implementation plan for the **Document Processing Service**, a critical component for extracting text and metadata from candidate documents to enable AI-powered candidate-job matching.

## Current Problem

- Documents are uploaded to `document-service` but no text extraction occurs
- All documents have `processing_status='pending'` with no `extracted_text`
- AI service cannot analyze resumes because there's no text content
- 99+ existing documents need retroactive processing

## Architecture Overview

### Service Separation Principle

**Document Service** (existing):
- ✅ File upload and storage (Supabase Storage)
- ✅ Document metadata management
- ✅ Access control and permissions
- ✅ Pre-signed URL generation for downloads

**Document Processing Service** (new):
- 🆕 Text extraction from PDFs and Word documents
- 🆕 AI-powered content analysis and structured data extraction
- 🆕 Semantic embedding generation for vector search
- 🆕 Skill recognition and normalization
- 🆕 Asynchronous processing via RabbitMQ events

### Event-Driven Flow

```
1. User uploads document → document-service
2. document-service stores file → Supabase Storage
3. document-service publishes → document.uploaded event
4. document-processing-service consumes event
5. Processing service downloads file for analysis
6. Processing service extracts text + AI analysis
7. Processing service updates database with results
8. Processing service publishes → document.processed event
9. AI service / other services react to processed documents
```

---

## Technology Stack

### Text Extraction Libraries

**PDFs**: `pdf-parse` v1.1.1
- ✅ Excellent for text-based PDFs (95% of resumes)
- ✅ Lightweight, no system dependencies
- ✅ Handles complex layouts reasonably well
- ❌ Cannot handle scanned/image PDFs (need OCR for that)

**Word Documents**: `mammoth` v1.8.0
- ✅ Excellent for `.docx` files (modern Word format)
- ✅ Produces clean HTML/text output
- ✅ Preserves formatting context
- ❌ Does not support legacy `.doc` format

**Fallback for Legacy**: `textract` (if needed)
- ✅ Supports both PDF and DOC/DOCX
- ❌ Requires additional system dependencies
- ❌ More complex setup in Docker

**Recommended**: Start with `pdf-parse` + `mammoth` (covers 98% of use cases)

### AI Enhancement

**Embeddings**: OpenAI `text-embedding-3-small`
- Generate semantic vectors for document content
- Enable similarity search beyond keyword matching
- Store vectors in Supabase with `pgvector` extension

**Structured Extraction**: GPT-4 for parsing resume sections
- Extract: Skills, Experience, Education, Contact Info
- Normalize skill names and experience calculations
- Generate structured metadata for precise matching

---

## Database Schema Updates

### Documents Table (existing)
```sql
-- services/document-service/migrations/
ALTER TABLE documents.documents 
ADD COLUMN IF NOT EXISTS processing_started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS processing_completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS processing_error TEXT,
ADD COLUMN IF NOT EXISTS text_length INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS embedding VECTOR(1536); -- OpenAI embedding dimension
```

### Metadata Structure (JSONB)
```json
{
  "extracted_text": "Full text content...",
  "structured_data": {
    "contact": {
      "email": "candidate@example.com",
      "phone": "+1-555-0123",
      "location": "San Francisco, CA"
    },
    "skills": [
      {"name": "JavaScript", "normalized": "javascript", "confidence": 0.95},
      {"name": "Node.js", "normalized": "nodejs", "confidence": 0.90}
    ],
    "experience": {
      "total_years": 5.5,
      "positions": [
        {
          "title": "Senior Developer", 
          "company": "Tech Corp",
          "duration": "2020-2023",
          "years": 3
        }
      ]
    },
    "education": [
      {
        "degree": "Bachelor of Science",
        "field": "Computer Science", 
        "school": "Stanford University",
        "year": 2018
      }
    ]
  },
  "ai_analysis": {
    "summary": "Experienced full-stack developer...",
    "key_strengths": ["JavaScript", "Leadership", "Agile"],
    "seniority_level": "senior",
    "primary_domain": "web_development"
  }
}
```

---

## Service Implementation

### 1. Document Processing Service Structure

```
services/document-processing-service/
├── package.json                    # Dependencies: pdf-parse, mammoth, openai
├── Dockerfile                      # Node.js container
├── src/
│   ├── index.ts                    # Server setup, RabbitMQ consumer
│   ├── domain-consumer.ts          # Listen for document.uploaded events
│   ├── processors/
│   │   ├── text-extractor.ts       # PDF/Word text extraction
│   │   ├── ai-analyzer.ts          # AI-powered content analysis
│   │   └── embedding-generator.ts  # OpenAI embeddings
│   ├── services/
│   │   └── document-service.ts     # Download files from Supabase Storage
│   └── repository.ts               # Update document metadata
```

### 2. Event Definitions

**document.uploaded** (published by document-service):
```json
{
  "document_id": "uuid",
  "entity_type": "application|candidate|job",
  "entity_id": "uuid", 
  "file_path": "storage/path/file.pdf",
  "mime_type": "application/pdf",
  "file_size": 1024000,
  "uploaded_at": "2026-01-02T13:00:00Z",
  "uploaded_by": "clerk_user_id"
}
```

**document.processed** (published by document-processing-service):
```json
{
  "document_id": "uuid",
  "entity_type": "application", 
  "entity_id": "uuid",
  "processing_status": "processed|failed",
  "text_length": 5420,
  "structured_data_available": true,
  "embedding_generated": true,
  "processed_at": "2026-01-02T13:05:00Z",
  "processing_time_ms": 3200,
  "error": null
}
```

### 3. Processing Pipeline

```typescript
async function processDocument(event: DocumentUploadedEvent) {
  try {
    // 1. Update status to 'processing'
    await updateDocumentStatus(event.document_id, 'processing');
    
    // 2. Download file from Supabase Storage
    const fileBuffer = await downloadDocument(event.file_path);
    
    // 3. Extract text based on MIME type
    const extractedText = await extractText(fileBuffer, event.mime_type);
    
    // 4. Generate AI analysis and structured data
    const aiAnalysis = await analyzeDocument(extractedText);
    
    // 5. Generate semantic embeddings
    const embedding = await generateEmbedding(extractedText);
    
    // 6. Update document with all extracted data
    await updateDocumentMetadata(event.document_id, {
      metadata: {
        extracted_text: extractedText,
        structured_data: aiAnalysis.structured_data,
        ai_analysis: aiAnalysis.summary
      },
      embedding: embedding,
      processing_status: 'processed',
      text_length: extractedText.length
    });
    
    // 7. Publish completion event
    await publishEvent('document.processed', {
      document_id: event.document_id,
      processing_status: 'processed',
      text_length: extractedText.length
    });
    
  } catch (error) {
    await handleProcessingError(event.document_id, error);
  }
}
```

---

## Implementation Phases

### Phase 1: Basic Text Extraction (Week 1)
**Goal**: Fix AI review blocking issue by extracting basic text

- ✅ Create `document-processing-service` with basic structure
- ✅ Add `pdf-parse` and `mammoth` dependencies
- ✅ Implement RabbitMQ consumer for `document.uploaded` events
- ✅ Extract text and save to `metadata.extracted_text`
- ✅ Update `processing_status` to `processed`
- ✅ Process existing 99+ pending documents retroactively
- ✅ Test AI reviews work with extracted text

**Success Metric**: AI reviews generate meaningful fit scores using actual resume text

### Phase 2: AI Enhancement (Week 2-3)
**Goal**: Improve AI matching quality with structured data

- ✅ Add OpenAI client for embeddings generation
- ✅ Store semantic vectors in Supabase with `pgvector`
- ✅ Implement basic structured data extraction (skills, experience)
- ✅ Enhance AI service to use structured data for better matching
- ✅ Add similarity search capabilities for candidate matching

**Success Metric**: AI can match candidates based on semantic similarity and structured skills

### Phase 3: Advanced Analysis (Week 4+)
**Goal**: Production-ready document intelligence

- ✅ Skill normalization and industry taxonomy
- ✅ Experience calculation algorithms
- ✅ Education and certification recognition
- ✅ Company and role title standardization
- ✅ Performance optimization and caching
- ✅ OCR support for scanned documents (if needed)

**Success Metric**: Document processing rivals commercial ATS platforms in accuracy

---

## Performance Considerations

### Asynchronous Processing
- All document processing happens asynchronously via events
- No blocking of document upload flow
- Processing service can scale independently
- Failed processing doesn't affect document storage

### Resource Management
- Text extraction is CPU-intensive (PDF parsing)
- AI analysis requires OpenAI API calls (rate limits)
- Large documents (10MB) may take 30-60 seconds to process
- Consider processing queue with priority (resume > cover letter)

### Caching and Storage
- Cache extracted text in database (don't re-extract)
- Store embeddings for fast similarity search
- Consider archiving old extracted text for cost optimization
- Implement retry logic for failed API calls

### Error Handling
- Graceful degradation: partial extraction better than none
- Detailed error logging for debugging
- Dead letter queue for permanently failed documents
- User notification for processing failures

---

## Integration Points

### Document Service Changes
- Add `document.uploaded` event publishing after successful upload
- Update status tracking in database
- Expose processing status in API responses

### AI Service Updates  
- Listen for `document.processed` events
- Use structured data for enhanced matching algorithms
- Implement vector similarity search for candidate recommendations

### API Gateway
- Proxy document processing status endpoints
- Handle user queries about document processing state

---

## Monitoring and Observability

### Metrics to Track
- Document processing success/failure rates
- Average processing time by file type and size
- AI analysis accuracy (manual spot checking)
- Queue depth and processing lag
- OpenAI API usage and costs

### Logging Requirements
- Processing start/completion with timing
- Extraction quality metrics (text length, structure found)
- AI analysis confidence scores
- Error details for failed processing

---

## Security Considerations

### Data Privacy
- Process documents in-memory only (don't persist locally)
- Ensure proper access control for document downloads
- Audit log for document processing events
- GDPR compliance for text extraction and AI analysis

### API Security
- Service-to-service authentication for document downloads
- Rate limiting on processing endpoints
- Input validation for file types and sizes

---

## Future Enhancements

### Advanced AI Features
- Resume quality scoring and suggestions
- Duplicate candidate detection via embeddings
- Automated candidate sourcing based on job embeddings
- Multi-language document support

### Enterprise Features
- Bulk document processing APIs
- Custom extraction templates per company
- Integration with external HR systems
- Advanced analytics and reporting

---

## Migration Plan for Existing Documents

### Retroactive Processing
```sql
-- Find all pending documents
SELECT id, file_path, mime_type 
FROM documents.documents 
WHERE processing_status = 'pending'
ORDER BY created_at ASC;
```

**Strategy**:
1. Create processing service with event consumer
2. Publish synthetic `document.uploaded` events for existing documents
3. Process in batches of 10-20 to avoid overwhelming system
4. Monitor processing success rate and adjust batch size
5. Prioritize application documents over other types

**Timeline**: 99 documents × 30 seconds avg = 50 minutes total processing time

---

## Implementation Checklist

### Pre-Development
- [ ] Review and approve this architecture document
- [ ] Estimate development timeline (1-2 weeks for Phase 1)
- [ ] Allocate OpenAI API budget for embeddings/analysis
- [ ] Plan database migration for new columns

### Phase 1 Development  
- [ ] Create `document-processing-service` directory structure
- [ ] Add dependencies: `pdf-parse`, `mammoth`, `@openai/api`
- [ ] Implement RabbitMQ event consumer
- [ ] Create text extraction processors
- [ ] Add database update methods
- [ ] Create Docker configuration
- [ ] Add service to docker-compose.yml
- [ ] Test with sample PDF and DOCX files

### Phase 1 Testing
- [ ] Test text extraction quality on various resume formats
- [ ] Verify event flow: upload → processing → completion
- [ ] Test AI service uses extracted text successfully
- [ ] Process existing pending documents
- [ ] Monitor processing performance and error rates

### Phase 1 Deployment
- [ ] Deploy to development environment
- [ ] Run retroactive processing on staging data
- [ ] Performance testing with realistic document volumes
- [ ] Production deployment
- [ ] Monitor production processing metrics

---

**Next Steps**: 
1. Get approval for this architecture
2. Create `document-processing-service` scaffolding
3. Implement Phase 1 basic text extraction
4. Test end-to-end flow with AI service
