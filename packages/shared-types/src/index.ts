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

// Candidate role assignment business logic types (re-uses database type)
export * from './candidate-role-assignments';

// Application feedback types (enums and interfaces)
export type {
    ApplicationFeedbackType,
    ApplicationFeedbackCreatorType,
    MarketplaceProfile,
    ApplicationStage,
    RecruiterCandidateWithCandidate,
} from './models';