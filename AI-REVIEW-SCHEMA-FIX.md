# AI Review Schema Transformation Fix

## Problem

The AI review data wasn't loading in the frontend because of a schema mismatch between the database and TypeScript interfaces.

### Database Schema (Flat Structure)
The `ai_reviews` table stores data in a flat structure:
```sql
- matched_skills: text[]
- missing_skills: text[]
- skills_match_percentage: integer (0-100)
- candidate_years: numeric
- required_years: integer
- meets_experience_requirement: boolean
```

### TypeScript Interface (Nested Structure)
The `AIReview` interface in `@splits-network/shared-types` expects nested objects:
```typescript
interface AIReview {
    skills_match: {
        match_percentage: number;
        matched_skills: string[];
        missing_skills: string[];
    };
    experience_analysis: {
        candidate_years: number;
        required_years: number;
        meets_requirement: boolean;
    };
}
```

### Frontend Code
The `ai-review-panel.tsx` component was accessing nested properties:
```typescript
aiReview.skills_match.match_percentage  // ❌ undefined (API returned flat structure)
aiReview.skills_match.matched_skills    // ❌ undefined
```

## Solution

Added a transformation layer in the AI service repository to convert flat database structure to nested API structure when reading data.

### Changes Made

**File**: `services/ai-service/src/v2/reviews/repository.ts`

1. **Added transformation function**:
```typescript
function transformAIReviewFromDB(dbRow: any): any {
    if (!dbRow) return null;
    
    const {
        skills_match_percentage,
        matched_skills,
        missing_skills,
        candidate_years,
        required_years,
        meets_experience_requirement,
        ...rest
    } = dbRow;
    
    return {
        ...rest,
        skills_match: {
            match_percentage: skills_match_percentage ?? 0,
            matched_skills: matched_skills ?? [],
            missing_skills: missing_skills ?? [],
        },
        experience_analysis: {
            candidate_years: candidate_years ? Number(candidate_years) : 0,
            required_years: required_years ?? 0,
            meets_requirement: meets_experience_requirement ?? false,
        },
    };
}
```

2. **Updated repository methods to transform data**:
- `findById()`: Returns transformed single review
- `findByApplicationId()`: Returns transformed single review
- `findReviews()`: Returns array of transformed reviews

### Data Flow

```
Database (Flat)
    ↓
Repository.findById() 
    ↓
transformAIReviewFromDB()
    ↓
API Response (Nested)
    ↓
Frontend (ai-review-panel.tsx)
    ✅ aiReview.skills_match.match_percentage
    ✅ aiReview.experience_analysis.candidate_years
```

## Testing

To verify the fix works:

1. Start the AI service: `pnpm --filter ai-service dev`
2. Start the candidate app: `pnpm --filter candidate dev`
3. Navigate to an application with AI review data
4. Verify the Skills Analysis and Experience sections display correctly:
   - Matched Skills list
   - Missing Skills list
   - Match Percentage
   - Years of Experience comparison

## Related Files

- **AI Service Repository**: `services/ai-service/src/v2/reviews/repository.ts`
- **Shared Types**: `packages/shared-types/src/models.ts`
- **Frontend Component**: `apps/candidate/src/app/(authenticated)/applications/[id]/components/ai-review-panel.tsx`
- **Database Table**: `ai_reviews`

## Notes

- The database schema remains unchanged (flat structure)
- The transformation happens at the repository layer when reading data
- When writing data, the AI service still uses the flat structure (no changes needed)
- The TypeScript interface correctly describes the API response shape (nested)
- Frontend code correctly accesses nested properties

---

**Status**: ✅ Fixed  
**Date**: January 2, 2026  
**Author**: GitHub Copilot
