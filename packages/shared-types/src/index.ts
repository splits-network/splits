// Database types (Supabase-generated, organized by domain)
// These are the source of truth for all table structures
export * from './database';

// DTOs, events, and other non-database types
// models.ts contains enriched DTO types (with joined fields like candidate?, job?) that extend beyond raw DB types.
// ats-integrations.ts contains ATS platform-specific types (Greenhouse, Lever, etc.) used by integration-service.
export * from './dtos';
export * from './events';
export * from './list-params';
export * from './list-response';

// Commission structure (five-role model, tier rates, breakdown calculations)
export * from './commission';

// Candidate role assignment business logic types (re-uses database type)
export * from './candidate-role-assignments';

// Application notes types (and legacy feedback aliases)
export type {
    // New application notes types
    ApplicationNote,
    ApplicationNoteType,
    ApplicationNoteCreatorType,
    ApplicationNoteVisibility,
    // Legacy aliases for backwards compatibility
    ApplicationFeedbackType,
    ApplicationFeedbackCreatorType,
    ApplicationFeedback,
    // Core model types
    Application,
    Candidate,
    Job,
    Company,
    AIReview,
    // Other model types
    MarketplaceProfile,
    ApplicationStage,
    RecruiterCandidateWithCandidate,
    OnboardingMetadata,
    User,
    SelectedPlan,
    StripePaymentInfo,
    PersonalInfo,
    CompanyInfo,
    // Role system types
    RoleName,
    RoleDefinition,
    UserRole,
    Membership,
    // Job attribute types
    CommuteType,
    JobLevel,
    // Resume metadata types
    ResumeMetadata,
    ResumeExperience,
    ResumeEducation,
    ResumeSkill,
    ResumeCertification,
    SkillProficiency,
    DegreeLevel,
    JobPreScreenQuestion,
    PreScreenQuestionType,
    // Application resume data types
    ApplicationResumeData,
    ApplicationResumeContact,
    ApplicationResumeSource,
} from './models';

// Content CMS block types and page structure
export * from './content';

// Integration & OAuth connection types
export * from './integrations';

// ATS integration types
export * from './ats-integrations';