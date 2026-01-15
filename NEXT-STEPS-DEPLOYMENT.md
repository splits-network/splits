# Next Steps: Deployment & Testing

**Date**: January 15, 2026  
**Current Status**: ✅ Database Ready | 🚀 Ready for Deployment

---

## Quick Summary

Database migration successfully applied (version 20260115123921):
- ✅ `applications.stage` updated with `ai_reviewed` and `recruiter_request` stages
- ✅ `application_feedback` table created with all columns, indexes, RLS policies
- ✅ TypeScript types generated from updated schema
- ✅ Build passing (all compilation errors fixed)

**What's Left**: Service implementation, deployment, and testing

---

## Immediate Next Steps (Priority Order)

### Step 1: Save Generated TypeScript Types
**Priority**: IMMEDIATE (Required before implementing endpoints)

Save the generated types to one of these locations:
```
packages/shared-types/src/database.types.ts  (recommended - new file)
packages/shared-types/src/supabase.types.ts  (if replacing existing)
```

The generated types include the `application_feedback` table definition needed for endpoint implementation.

### Step 2: Implement Application Feedback CRUD Endpoints
**Priority**: CRITICAL (Blocking deployment)

**Location**: `services/ats-service/src/v2/application-feedback/`

**Required Files**:
1. `types.ts` - Filters, Create, Update DTOs
2. `repository.ts` - Database operations with RLS
3. `service.ts` - Business logic, validation, events
4. `routes.ts` - Fastify route handlers

**Reference Implementation**: See other V2 domains (jobs, candidates) for pattern

**Endpoints to Implement**:
```typescript
GET    /v2/application-feedback?application_id={id}  // List feedback (threaded)
GET    /v2/application-feedback/:id                  // Get single
POST   /v2/application-feedback                      // Create
PATCH  /v2/application-feedback/:id                  // Update (creator only)
DELETE /v2/application-feedback/:id                  // Delete (creator/admin)
```

### Step 3: Update ATS Service - AI Review Handler
**Priority**: CRITICAL (Core Phase 1 functionality)

**File**: `services/ats-service/src/v2/applications/service.ts`

**Required Changes**:
```typescript
// Update handleAIReviewCompleted method
async handleAIReviewCompleted(data: AIReviewCompletedEvent): Promise<void> {
    const application = await this.repository.findById(data.application_id);
    
    // CRITICAL: Set stage to ai_reviewed (NOT submitted)
    await this.repository.update(data.application_id, 'system', {
        stage: 'ai_reviewed',  // ← This is the key change
        assessment_id: data.review_id,
        ai_reviewed: true,
    });
    
    await this.eventPublisher.publish('application.ai_reviewed', {
        applicationId: data.application_id,
        candidateId: application.candidate_id,
        reviewId: data.review_id
    });
}

// Add method to return to draft
async returnToDraft(applicationId: string, clerkUserId: string): Promise<Application> {
    const application = await this.repository.findById(applicationId);
    
    // Validate application is in ai_reviewed stage
    if (application.stage !== 'ai_reviewed') {
        throw new Error('Application must be in ai_reviewed stage');
    }
    
    // Update to draft
    return await this.repository.update(applicationId, clerkUserId, {
        stage: 'draft'
    });
}
```

### Step 4: Add API Gateway Proxy Routes
**Priority**: CRITICAL (Frontend needs these endpoints)

**File**: `services/api-gateway/src/routes/v2/ats.ts`

**Add Routes**:
```typescript
// Application feedback routes
app.get('/api/v2/application-feedback', {
    preHandler: requireRoles(['candidate', 'recruiter', 'platform_admin'], services),
    schema: { /* ... */ }
}, async (request, reply) => {
    const headers = buildAuthHeaders(request);
    const response = await atsService().get('/v2/application-feedback', { 
        params: request.query,
        headers 
    });
    return reply.send(response.data);
});

app.post('/api/v2/application-feedback', {
    preHandler: requireRoles(['candidate', 'recruiter', 'platform_admin'], services),
    schema: { /* ... */ }
}, async (request, reply) => {
    const headers = buildAuthHeaders(request);
    const response = await atsService().post('/v2/application-feedback', request.body, { headers });
    return reply.send(response.data);
});

// Return to draft route
app.post('/api/v2/applications/:id/return-to-draft', {
    preHandler: requireRoles(['candidate'], services),
    schema: { /* ... */ }
}, async (request, reply) => {
    const headers = buildAuthHeaders(request);
    const response = await atsService().post(
        `/v2/applications/${request.params.id}/return-to-draft`,
        {},
        { headers }
    );
    return reply.send(response.data);
});
```

### Step 5: Deploy Services
**Priority**: CRITICAL (Enables testing)

**Services to Deploy**:
```bash
# Terminal 1: API Gateway
cd services/api-gateway
pnpm dev  # Port 3000

# Terminal 2: ATS Service
cd services/ats-service
pnpm dev  # Port 3002

# Terminal 3: AI Service (if not already running)
cd services/ai-service
pnpm dev  # Port 3006

# Terminal 4: Notification Service (optional for feedback notifications)
cd services/notification-service
pnpm dev  # Port 3005
```

**Environment Variables to Verify**:
- `DATABASE_URL` - Supabase connection string
- `RABBITMQ_URL` - RabbitMQ connection
- `CLERK_SECRET_KEY` - Clerk authentication
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`

**Health Checks**:
- `GET http://localhost:3000/health` - API Gateway
- `GET http://localhost:3002/health` - ATS Service
- `GET http://localhost:3006/health` - AI Service

### Step 6: End-to-End Testing
**Priority**: CRITICAL (Validates Phase 1 complete)

**Test Scenario 1: AI Review Loop**
```bash
# 1. Create draft application as candidate
POST http://localhost:3000/api/v2/applications
{
  "job_id": "...",
  "candidate_id": "...",
  "cover_letter": "...",
  "stage": "draft"
}

# 2. Trigger AI review
POST http://localhost:3000/api/v2/applications/{id}/trigger-ai-review

# 3. Wait for AI processing (monitor RabbitMQ or AI service logs)
# Expected: application.ai_review_requested → AI processes → application.ai_reviewed

# 4. Verify stage is ai_reviewed (NOT submitted)
GET http://localhost:3000/api/v2/applications/{id}
# Expected: { "stage": "ai_reviewed", "ai_reviewed": true }

# 5. Get AI review results
GET http://localhost:3000/api/v2/ai-reviews?application_id={id}
# Expected: AI review with fit_score, recommendation, concerns, strengths

# 6. Test edit flow - return to draft
POST http://localhost:3000/api/v2/applications/{id}/return-to-draft
# Expected: { "stage": "draft" }

# 7. Make edits
PATCH http://localhost:3000/api/v2/applications/{id}
{ "cover_letter": "Updated content..." }

# 8. Trigger AI review again
POST http://localhost:3000/api/v2/applications/{id}/trigger-ai-review
# Expected: Second AI review completes → stage=ai_reviewed again

# 9. Submit application
POST http://localhost:3000/api/v2/applications/{id}/submit
# Expected: stage=submitted, CRA created
```

**Test Scenario 2: Application Feedback**
```bash
# 1. Recruiter creates info request
POST http://localhost:3000/api/v2/application-feedback
{
  "application_id": "...",
  "feedback_type": "info_request",
  "message_text": "Please add more details about your leadership experience"
}

# 2. Verify application moves to recruiter_request stage
GET http://localhost:3000/api/v2/applications/{id}
# Expected: { "stage": "recruiter_request" }

# 3. Candidate creates response (threaded)
POST http://localhost:3000/api/v2/application-feedback
{
  "application_id": "...",
  "feedback_type": "info_response",
  "message_text": "I led a team of 5 engineers...",
  "in_response_to_id": "{request_id}"
}

# 4. List feedback (verify threading)
GET http://localhost:3000/api/v2/application-feedback?application_id={id}
# Expected: Array with both messages, parent-child relationship visible
```

**Test Scenario 3: RLS Policy Verification**
```bash
# Test as candidate (can only see own feedback)
GET http://localhost:3000/api/v2/application-feedback?application_id={id}
Authorization: Bearer {candidate_clerk_jwt}

# Test as recruiter (can see candidates' feedback only)
GET http://localhost:3000/api/v2/application-feedback?application_id={id}
Authorization: Bearer {recruiter_clerk_jwt}

# Test as admin (can see all feedback)
GET http://localhost:3000/api/v2/application-feedback?application_id={id}
Authorization: Bearer {admin_clerk_jwt}
```

---

## Success Criteria

Phase 1 is complete when:
- [x] Database migration applied
- [x] TypeScript types updated
- [x] Build passing
- [ ] Application feedback endpoints implemented
- [ ] AI review handler updated to use ai_reviewed stage
- [ ] Services deployed and healthy
- [ ] AI review loop tested (draft → ai_review → ai_reviewed → edit/submit)
- [ ] Application feedback tested (create, read, threading)
- [ ] Recruiter request flow tested (info_request → recruiter_request stage)
- [ ] RLS policies verified (proper access control)

**Current Status**: 3/10 complete (database work done, implementation and testing pending)

---

## Common Issues & Solutions

### Issue: "Type 'application_stage' does not exist"
**Solution**: This database uses TEXT columns with CHECK constraints, not PostgreSQL enums. Migration has been corrected.

### Issue: Migration shows CHECK constraint but queries don't return it
**Solution**: PostgreSQL limitation - information_schema doesn't always show CHECK constraints. Use `list_tables` MCP tool instead.

### Issue: RLS policy blocking access
**Solution**: Verify user has correct role and relationship (e.g., recruiter must have active recruiter_candidates relationship).

### Issue: TypeScript errors after adding new endpoints
**Solution**: Ensure generated types are saved and imported correctly. Run `pnpm build` to verify.

---

## Resources

**Documentation**:
- [Implementation Plan](PHASE-1-AI-REVIEW-LOOP-IMPLEMENTATION-COMPLETE.md)
- [Implementation Alignment](docs/flows/plan-applicationProposalFlowImplementationAlignment.prompt.md)
- [V2 Architecture Guide](docs/migration/v2/V2-ARCHITECTURE-IMPLEMENTATION-GUIDE.md)

**Migration File**:
- [Migration 028](services/ats-service/migrations/028_add_application_feedback_and_stages.sql)

**Supabase**:
- Project: einhgkqmxbkgdohwfayv
- Schema: public
- Migration Version: 20260115123921

---

**Ready to Deploy!** 🚀

Follow the steps above in order. Start with saving the generated TypeScript types, then implement the endpoints, deploy, and test.
