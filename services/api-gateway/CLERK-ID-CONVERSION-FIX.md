# Clerk ID to UUID Conversion Fix

## Problem

After the authentication realignment to Clerk, emails stopped sending. Investigation revealed:

1. Frontend now sends Clerk user IDs (format: `user_XXXXX`) in request bodies
2. Backend services expect internal UUIDs in database columns
3. API Gateway was passing Clerk IDs directly to backend services
4. Backend INSERT/UPDATE operations failed with: `invalid input syntax for type uuid: user_37SZvSZQOxPB53owclC4em5NSpE`
5. No records created → No events published → No emails sent

## Solution

Created a conversion layer in API Gateway to translate Clerk IDs to internal UUIDs before forwarding requests to backend services.

## Files Created

### `src/clerk-id-converter.ts`

Utility module with three helper functions:

- `isClerkUserId(value)` - Checks if a value is a Clerk user ID (starts with "user_")
- `convertClerkIdToUuid(identityService, clerkUserId, correlationId)` - Calls identity service to convert single Clerk ID to UUID
- `convertClerkIdsInBody(body, fieldsToConvert[], identityService, correlationId)` - Processes request body and converts specified fields

## Files Modified

### 1. `src/routes/jobs/routes.ts`

**POST /api/jobs** - Converts `job_owner_id`
**PATCH /api/jobs/:id** - Converts `job_owner_id`

```typescript
const body = await convertClerkIdsInBody(
    request.body,
    ['job_owner_id'],
    identityService,
    correlationId
);
```

### 2. `src/routes/candidates/routes.ts`

**POST /api/candidates** - Converts `user_id`, `recruiter_id`, `verified_by_user_id`
**PATCH /api/candidates/:id** - Converts `user_id`, `recruiter_id`, `verified_by_user_id`

```typescript
const body = await convertClerkIdsInBody(
    request.body,
    ['user_id', 'recruiter_id', 'verified_by_user_id'],
    identityService,
    correlationId
);
```

### 3. `src/routes/applications/routes.ts`

**POST /api/applications** - Converts `recruiter_id`

```typescript
const body = await convertClerkIdsInBody(
    request.body,
    ['recruiter_id'],
    identityService,
    correlationId
);
```

### 4. `src/routes/placements/routes.ts`

**POST /api/placements** - Converts `recruiter_id`

```typescript
const body = await convertClerkIdsInBody(
    request.body,
    ['recruiter_id'],
    identityService,
    correlationId
);
```

### 5. `src/routes/assignments/routes.ts`

**POST /api/assignments** - Converts `recruiter_id`

```typescript
const body = await convertClerkIdsInBody(
    request.body,
    ['recruiter_id'],
    identityService,
    correlationId
);
```

## Field Mapping

Based on data models in `packages/shared-types/src/models.ts`:

| Entity | Fields Converted |
|--------|-----------------|
| Job | `job_owner_id` |
| Candidate | `user_id`, `recruiter_id`, `verified_by_user_id` |
| Application | `recruiter_id` |
| ApplicationAuditLog | `performed_by_user_id` (not in API Gateway - backend handles) |
| Placement | `recruiter_id` |
| RoleAssignment | `recruiter_id` |

## Routes NOT Requiring Conversion

These routes use `req.auth.userId` (already internal UUID from identity service lookup):

- Recruiters: `POST /api/recruiters` - Uses `req.auth.userId`
- Recruiter-Candidates: Invitation accept/decline - Uses `req.auth.userId`
- Marketplace Connections: `POST /api/marketplace/connections` - Uses `req.auth.userId`

## Testing Checklist

- [ ] Local testing: Create job with Clerk user ID in `job_owner_id`
- [ ] Local testing: Create candidate with Clerk user ID in `user_id`
- [ ] Local testing: Create application with Clerk user ID in `recruiter_id`
- [ ] Local testing: Create placement with Clerk user ID in `recruiter_id`
- [ ] Production: Deploy API Gateway with fixes
- [ ] Production: Monitor ATS service logs for UUID validation errors (should be gone)
- [ ] Production: Create test application and verify notification email is sent
- [ ] Production: Check RabbitMQ for published events

## Rollback Plan

If issues occur:

1. Revert API Gateway deployment to previous version
2. Check `git log services/api-gateway/` for commit to revert
3. Frontend will continue sending Clerk IDs (no frontend changes needed)
4. Backend services unchanged (still expect UUIDs)

## Next Steps

1. Deploy to production
2. Monitor logs for errors
3. Test email flow end-to-end
4. Consider adding validation in backend services to detect Clerk IDs and provide helpful error messages

## Related Documentation

- `docs/guidance/user-identification-standard.md` - User identification patterns
- `docs/guidance/api-response-format.md` - API response standards
- `.github/copilot-instructions.md` - Section 8 "User Identification Standards"
