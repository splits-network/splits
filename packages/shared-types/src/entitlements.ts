/**
 * Plan Entitlements
 *
 * Structured entitlements that drive feature gating across the platform.
 * Stored as JSONB in plans.entitlements (separate from plans.features which is marketing copy).
 *
 * Convention:
 *   - Boolean fields: feature is enabled/disabled
 *   - Numeric fields: -1 = unlimited, 0+ = limit
 *   - String fields: enum level (e.g., marketplace_priority)
 */

export type MarketplacePriority = 'standard' | 'boosted' | 'featured';

export interface PlanEntitlements {
    messaging_initiations_per_month: number;
    max_saved_candidates: number;
    max_saved_jobs: number;
    max_referral_codes: number;
    email_notifications: boolean;
    email_integration: boolean;
    calendar_integration: boolean;
    early_access_roles: boolean;
    priority_roles: boolean;
    ai_match_scoring: boolean;
    ai_call_summary: boolean;
    call_recording: boolean;
    call_transcription: boolean;
    firm_creation: boolean;
    api_access: boolean;
    advanced_analytics: boolean;
    data_export: boolean;
    marketplace_priority: MarketplacePriority;
}

export type EntitlementKey = keyof PlanEntitlements;

/** Keys whose values are boolean (feature on/off) */
export type BooleanEntitlement = {
    [K in EntitlementKey]: PlanEntitlements[K] extends boolean ? K : never;
}[EntitlementKey];

/** Keys whose values are numeric (limits, -1 = unlimited) */
export type NumericEntitlement = {
    [K in EntitlementKey]: PlanEntitlements[K] extends number ? K : never;
}[EntitlementKey];

/** Default entitlements for unauthenticated or starter-tier users */
export const STARTER_ENTITLEMENTS: PlanEntitlements = {
    messaging_initiations_per_month: 5,
    max_saved_candidates: 10,
    max_saved_jobs: 10,
    max_referral_codes: 1,
    email_notifications: false,
    email_integration: false,
    calendar_integration: false,
    early_access_roles: false,
    priority_roles: false,
    ai_match_scoring: false,
    ai_call_summary: false,
    call_recording: false,
    call_transcription: false,
    firm_creation: false,
    api_access: false,
    advanced_analytics: false,
    data_export: false,
    marketplace_priority: 'standard',
};
