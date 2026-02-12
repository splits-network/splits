// Database types (Supabase-generated, organized by domain)
// These are the source of truth for all table structures
export * from './database';

// DTOs, events, and other non-database types
// NOTE: models.ts, teams.ts, ats-integrations.ts still contain legacy duplicate types
// TODO: Clean those up to remove table type definitions that now exist in ./database
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
} from './models';