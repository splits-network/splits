# Technical Specification
## Custom GPT with Actions
Date: 2026-02-13

## 1. Required Artifacts
- OpenAPI 3.0 schema (YAML)
- OAuth2 configuration
- GPT Instructions document
- Privacy Policy & Terms URL

## 2. Required Endpoints

### Applicant.Network
GET /api/jobs  
POST /api/resume/analyze  
GET /api/applications  
POST /api/applications  

### Splits.Network
GET /api/recruiters  
GET /api/candidates  
GET /api/splits/opportunities  
POST /api/outreach/draft  
GET /api/splits/:id/summary  

## 3. Error Contract
{
  "errorCode": "CONFIRMATION_REQUIRED",
  "message": "User must confirm before executing this action."
}

## 4. Rate Limiting
- Per-user limits  
- GPT-specific throttle policies  

## 5. Versioning
- /api/v1/gpt namespace  
- Backwards-compatible updates  
