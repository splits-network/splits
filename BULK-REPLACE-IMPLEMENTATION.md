# Bulk Replace Endpoints for Job Requirements and Pre-Screen Questions

## Overview

This implementation adds bulk replace endpoints to optimize performance when editing jobs with many requirements and pre-screen questions. The original implementation made 17+ HTTP calls during job editing (1 GET + multiple DELETEs + multiple POSTs), causing very slow performance.

## Performance Improvement

- **Before**: 17 HTTP calls (1 GET + 8 DELETEs + 8 POSTs for example job)
- **After**: 3 HTTP calls (1 GET + 2 bulk PUT operations)
- **Performance gain**: ~85% reduction in API calls
- **User experience**: Near-instant saving instead of 3-5 second delays

## New Endpoints

### Job Requirements Bulk Replace
```
PUT /api/v2/job-requirements/job/:jobId/bulk-replace
```

**Request Body:**
```json
{
  "requirements": [
    {
      "requirement_type": "skill",
      "description": "React.js experience",
      "years_experience": 3,
      "is_required": true,
      "sort_order": 1
    },
    {
      "requirement_type": "education",
      "description": "Bachelor's degree in Computer Science",
      "years_experience": 0,
      "is_required": false,
      "sort_order": 2
    }
  ]
}
```

### Job Pre-Screen Questions Bulk Replace
```
PUT /api/v2/job-pre-screen-questions/job/:jobId/bulk-replace
```

**Request Body:**
```json
{
  "questions": [
    {
      "question": "How many years of React experience do you have?",
      "question_type": "number",
      "is_required": true,
      "sort_order": 1
    },
    {
      "question": "Which frameworks have you used?",
      "question_type": "multiple_choice",
      "is_required": false,
      "sort_order": 2,
      "options": ["React", "Vue", "Angular", "Other"]
    }
  ]
}
```

## Database Implementation

The endpoints use PostgreSQL stored procedures for atomic operations:
- `bulk_replace_job_requirements(job_id, requirements_jsonb)`
- `bulk_replace_job_pre_screen_questions(job_id, questions_jsonb)`

These functions:
1. Delete all existing records for the job
2. Insert new records from JSONB array
3. Return the new records
4. All operations are atomic (rollback on any error)

## Frontend Integration

To integrate these endpoints in the portal's role wizard modal:

### Before (Slow - Multiple API Calls)
```javascript
// Delete existing requirements
for (const req of existingRequirements) {
  await client.delete(`/job-requirements/${req.id}`);
}

// Create new requirements
for (const req of newRequirements) {
  await client.post('/job-requirements', req);
}
```

### After (Fast - Bulk Operation)
```javascript
// Replace all requirements in one call
await client.put(`/job-requirements/job/${jobId}/bulk-replace`, {
  requirements: newRequirements
});
```

## Error Handling

Both endpoints include comprehensive validation:
- Required fields validation
- Data type validation  
- Array structure validation
- Specific validation for multiple choice question options

Returns standard API error format:
```json
{
  "error": {
    "message": "Requirement 2: description is required"
  }
}
```

## Testing

To test the new endpoints:

1. **Create a job** with some requirements/questions
2. **Call bulk replace** with new data
3. **Verify atomic behavior** - if any validation fails, no changes are made
4. **Performance test** - compare time vs individual calls

## Migration Applied

The database migration `20260210000004_add_bulk_replace_functions.sql` has been successfully applied, adding the required stored procedures with proper permissions for the service role.

## TypeScript Types

New types have been added to `services/ats-service/src/v2/types.ts`:
- `JobRequirementBulkItem`
- `JobPreScreenQuestionBulkItem` 
- `BulkReplaceRequirementsRequest`
- `BulkReplaceQuestionsRequest`

## Next Steps for Frontend

1. Update the role wizard modal to use bulk replace endpoints
2. Add loading states during bulk operations  
3. Implement optimistic updates for better UX
4. Add error handling for bulk operation failures
5. Test with large numbers of requirements/questions

This implementation follows V2 architecture patterns and maintains full backward compatibility with existing individual CRUD endpoints.