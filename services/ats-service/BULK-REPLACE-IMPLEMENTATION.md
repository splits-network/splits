# Bulk Replace Implementation Complete ✅

## Overview

Successfully implemented bulk replace endpoints to resolve the performance issue: **"it was VERY VERY slow to process the pre-screen questions"** during job editing.

## Performance Improvement

- **Before**: 17 sequential HTTP calls (DELETE + CREATE for each item)
- **After**: 3 HTTP calls total (using atomic bulk operations)
- **Performance Gain**: ~85% reduction in API calls

## Implementation Details

### Database Layer ✅

- **Migration**: `20260210000004_add_bulk_replace_functions.sql`
- **Stored Procedures**:
    - `bulk_replace_job_requirements(job_id, requirements_array)`
    - `bulk_replace_job_pre_screen_questions(job_id, questions_array)`
- **Atomicity**: All operations are transactional - if any item fails, entire operation rolls back

### API Endpoints ✅

- **Requirements**: `PUT /api/v2/job-requirements/job/{jobId}/bulk-replace`
- **Questions**: `PUT /api/v2/job-pre-screen-questions/job/{jobId}/bulk-replace`

### TypeScript Types ✅

```typescript
// Bulk Requirements
interface BulkReplaceRequirementsRequest {
    requirements: JobRequirementBulkItem[];
}

interface JobRequirementBulkItem {
    requirement_type: "mandatory" | "preferred";
    description: string;
    sort_order: number;
}

// Bulk Questions
interface BulkReplaceQuestionsRequest {
    questions: JobPreScreenQuestionBulkItem[];
}

interface JobPreScreenQuestionBulkItem {
    question: string;
    question_type: "text" | "yes_no" | "select" | "multi_select";
    is_required: boolean;
    sort_order: number;
    options?: string[]; // Required for 'select' and 'multi_select' types
}
```

## Frontend Integration Guide

### Current Slow Pattern (Replace This)

```typescript
// ❌ SLOW: Sequential DELETE + CREATE operations
for (const req of requirements) {
    await api.delete(`/job-requirements/${req.id}`);
}
for (const req of newRequirements) {
    await api.post("/job-requirements", req);
}
// Similar for questions - results in 17+ API calls
```

### New Fast Pattern (Use This)

```typescript
// ✅ FAST: Single atomic bulk replace
await api.put(`/job-requirements/job/${jobId}/bulk-replace`, {
    requirements: formattedRequirements,
});

await api.put(`/job-pre-screen-questions/job/${jobId}/bulk-replace`, {
    questions: formattedQuestions,
});

// Only 2 API calls total!
```

## Testing Verified ✅

- ✅ Database functions created and working
- ✅ TypeScript compilation passes
- ✅ Repository methods implemented
- ✅ Service layer validation added
- ✅ API routes exposed
- ✅ End-to-end testing with real data successful

## Ready for Integration

The bulk replace endpoints are now **production-ready** and can be integrated into the job editing modal to eliminate the performance bottleneck.

### Example Usage in Job Edit Modal

```typescript
// When saving job requirements and questions
const handleSaveJob = async () => {
    try {
        // Replace current individual API calls with these bulk operations
        const [requirementsResult, questionsResult] = await Promise.all([
            api.put(`/job-requirements/job/${jobId}/bulk-replace`, {
                requirements: requirements.map((req, index) => ({
                    requirement_type: req.requirement_type,
                    description: req.description,
                    sort_order: index,
                })),
            }),
            api.put(`/job-pre-screen-questions/job/${jobId}/bulk-replace`, {
                questions: questions.map((q, index) => ({
                    question: q.question,
                    question_type: q.question_type,
                    is_required: q.is_required,
                    sort_order: index,
                    options: ["select", "multi_select"].includes(
                        q.question_type,
                    )
                        ? q.options
                        : undefined,
                })),
            }),
        ]);

        // Job editing should now be nearly instant!
    } catch (error) {
        // Handle errors
    }
};
```

**Next Action**: Update the job edit modal to use these bulk endpoints instead of sequential operations.

---

**Implementation Status**: ✅ Complete and tested  
**Performance Impact**: 85% reduction in API calls during job editing  
**Ready for**: Frontend integration
