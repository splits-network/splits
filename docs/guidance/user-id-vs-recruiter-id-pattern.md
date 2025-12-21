# User ID vs Recruiter ID Pattern

**CRITICAL:** This document explains the difference between `user_id` and `recruiter_id` and how to use them correctly.

## The Pattern

We have two different ID types for recruiters:

1. **`user_id`** (from `identity.users.id`) - The identity/authentication ID for the user
2. **`recruiter_id`** (from `network.recruiters.id`) - The recruiter profile/business entity ID

**THE GOLDEN RULE:** When a field is named `recruiter_id`, it should ALWAYS reference `network.recruiters.id`, NOT `identity.users.id`.

---

## Database Schema

### identity.users
```sql
CREATE TABLE identity.users (
    id UUID PRIMARY KEY,              -- User identity ID (for auth)
    clerk_user_id TEXT,
    email TEXT,
    ...
);
```

### network.recruiters
```sql
CREATE TABLE network.recruiters (
    id UUID PRIMARY KEY,              -- Recruiter business entity ID
    user_id UUID NOT NULL,            -- FK to identity.users.id
    status TEXT,
    ...
    FOREIGN KEY (user_id) REFERENCES identity.users(id)
);
```

### ats.applications
```sql
CREATE TABLE ats.applications (
    id UUID PRIMARY KEY,
    job_id UUID NOT NULL,
    candidate_id UUID NOT NULL,
    recruiter_id UUID,                             -- FK to network.recruiters.id ✅
    ...
    FOREIGN KEY (recruiter_id) REFERENCES network.recruiters(id)  -- CORRECT!
);
```

### ats.placements
```sql
CREATE TABLE ats.placements (
    id UUID PRIMARY KEY,
    application_id UUID NOT NULL,
    recruiter_id UUID NOT NULL,                    -- FK to network.recruiters.id ✅
    ...
    FOREIGN KEY (recruiter_id) REFERENCES network.recruiters(id)  -- CORRECT!
);
```

---

## The Golden Rule

**When storing a recruiter reference, use the correct ID based on the field name:**

- Field named `recruiter_id` → Use `network.recruiters.id`
- Field named `user_id` → Use `identity.users.id`

### Example: applications.recruiter_id

```typescript
// ✅ CORRECT - Use recruiter_id from network.recruiters
const recruiterRelationship = await repository.findActiveRecruiterForCandidate(candidateId);
await repository.createApplication({
    recruiter_id: recruiterRelationship.recruiter_id  // network.recruiters.id ✅
});

// ❌ WRONG - Don't use user_id for recruiter_id field
const recruiterRelationship = await repository.findActiveRecruiterForCandidate(candidateId);
await repository.createApplication({
    recruiter_id: recruiterRelationship.recruiter_user_id  // identity.users.id ❌ WRONG!
});
```

---

## Common Scenarios

### 1. Creating an Application with Recruiter

```typescript
// Query returns BOTH IDs
const recruiterRelationship = await this.repository.findActiveRecruiterForCandidate(candidateId);
// Returns: { recruiter_id: UUID, recruiter_user_id: UUID }

// Use recruiter_id for the FK constraint
const application = await this.repository.createApplication({
    job_id: jobId,
    candidate_id: candidateId,
    recruiter_id: recruiterRelationship.recruiter_id, // ✅ network.recruiters.id
    stage: 'screen',
});
```

### 2. Querying Applications by Recruiter

```typescript
// If you have the recruiter_id from network.recruiters
const applications = await atsService.getApplications({
    recruiter_id: recruiterId  // ✅ network.recruiters.id
});

// If you only have user_id (e.g., from auth context), look up the recruiter first
const recruiter = await networkService.getRecruiterByUserId(req.auth.userId);
const applications = await atsService.getApplications({
    recruiter_id: recruiter.id  // ✅ network.recruiters.id
});
```

### 3. Repository Method Naming

When a repository method returns recruiter information, it should clearly indicate which ID is which:

```typescript
// ✅ GOOD - Clear naming
interface RecruiterRelationship {
    recruiter_id: string;       // network.recruiters.id
    recruiter_user_id: string;  // identity.users.id
}

async findActiveRecruiterForCandidate(candidateId: string): Promise<RecruiterRelationship | null> {
    const { data } = await this.supabase
        .from('recruiter_candidates')
        .select('recruiter_id, recruiters!inner(id, user_id)')
        .single();
    
    return {
        recruiter_id: data.recruiter_id,           // Use this for recruiter_id fields
        recruiter_user_id: data.recruiters.user_id  // Use this for user_id fields
    };
}
```

---

## Foreign Key Constraints Reference

### Tables with FK to network.recruiters.id

These tables have fields named `recruiter_id` that reference the recruiter business entity:

- `ats.applications.recruiter_id` → `network.recruiters.id` ✅
- `ats.placements.recruiter_id` → `network.recruiters.id` ✅
- `network.recruiter_candidates.recruiter_id` → `network.recruiters.id` ✅
- `network.role_assignments.recruiter_id` → `network.recruiters.id` ✅

### Tables with FK to identity.users.id

These tables have fields named `user_id` that reference the user identity:

- `network.recruiters.user_id` → `identity.users.id` ✅
- `billing.subscriptions.user_id` → `identity.users.id` ✅
- `identity.memberships.user_id` → `identity.users.id` ✅

---

## Quick Reference Decision Tree

```
Need to reference a recruiter?
│
├─ Is the field named "recruiter_id"?
│  └─ Use network.recruiters.id ✅
│
├─ Is the field named "user_id"?
│  └─ Use identity.users.id ✅
│
├─ Not sure? Check the FK constraint:
│  └─ SELECT pg_get_constraintdef(oid) FROM pg_constraint 
│     WHERE conrelid = 'your_table'::regclass 
│     AND conname LIKE '%recruiter%';
│
└─ Follow the naming convention: recruiter_id = recruiters table
```

---

## Testing Checklist

When working with recruiter references:

- [ ] Check the field name (recruiter_id vs user_id)
- [ ] Verify the FK constraint points to the right table
- [ ] Use the correct ID type from the query result
- [ ] Add a comment explaining which ID you're using
- [ ] Test with actual data to ensure no FK violations

---

## Common Error Messages

### FK Constraint Violation

```
insert or update on table "applications" violates foreign key constraint "applications_recruiter_id_fkey"
Key (recruiter_id)=(41a7e453-e648-4368-aab0-1ee48eedf5b9) is not present in table "recruiters".
```

**Cause:** You used `identity.users.id` instead of `network.recruiters.id`

**Fix:** Use `recruiter_id` instead of `recruiter_user_id` from your query result

---

## Summary

- **`user_id`** = Identity/auth ID from `identity.users.id`
- **`recruiter_id`** = Recruiter business entity ID from `network.recruiters.id`
- **Follow the field name:** If it's called `recruiter_id`, use `network.recruiters.id`
- **Be explicit in code:** Always comment which ID type you're using
- **Network service owns recruiters:** The `network.recruiters` table is the source of truth for recruiter business entities

---

**Last Updated:** December 20, 2025  
**Version:** 2.0 (Corrected FK constraints and documentation)
