/**
 * Preference Categories
 *
 * Maps 90+ notification event types into ~12 user-facing preference categories.
 * Used by both the backend (preference gate) and frontend (UI grouping).
 */

export const PREFERENCE_CATEGORIES = {
    applications: {
        label: 'Applications',
        description: 'Application submissions, status changes, and recruiter proposals',
        icon: 'fa-duotone fa-regular fa-file-lines',
        dbCategories: ['application', 'proposal'],
        unsubscribable: false,
    },
    interviews: {
        label: 'Interviews',
        description: 'Interview scheduling, updates, and feedback',
        icon: 'fa-duotone fa-regular fa-calendar-check',
        dbCategories: ['interview'],
        unsubscribable: false,
    },
    offers_hires: {
        label: 'Offers & Hires',
        description: 'Offer notifications and hire confirmations',
        icon: 'fa-duotone fa-regular fa-handshake',
        dbCategories: ['offer', 'success'],
        unsubscribable: false,
    },
    placements: {
        label: 'Placements',
        description: 'Placement lifecycle and guarantee milestones',
        icon: 'fa-duotone fa-regular fa-badge-check',
        dbCategories: ['placement', 'milestone'],
        unsubscribable: false,
    },
    candidates: {
        label: 'Candidates',
        description: 'Sourcing activity, consent, and ownership updates',
        icon: 'fa-duotone fa-regular fa-users',
        dbCategories: ['candidate'],
        unsubscribable: false,
    },
    jobs_matches: {
        label: 'Jobs & Matches',
        description: 'New job postings and AI match invitations',
        icon: 'fa-duotone fa-regular fa-bullseye-arrow',
        dbCategories: ['jobs', 'matches'],
        unsubscribable: false,
    },
    calls: {
        label: 'Calls',
        description: 'Call scheduling, reminders, and recording availability',
        icon: 'fa-duotone fa-regular fa-phone',
        dbCategories: ['calls'],
        unsubscribable: false,
    },
    messaging: {
        label: 'Messages',
        description: 'Chat messages and conversation activity',
        icon: 'fa-duotone fa-regular fa-comments',
        dbCategories: ['chat'],
        unsubscribable: false,
    },
    billing: {
        label: 'Billing & Payments',
        description: 'Invoices, payouts, and subscription changes',
        icon: 'fa-duotone fa-regular fa-credit-card',
        dbCategories: ['billing'],
        unsubscribable: true,
    },
    security: {
        label: 'Security & Account',
        description: 'Security alerts and account-critical notifications',
        icon: 'fa-duotone fa-regular fa-shield-exclamation',
        dbCategories: ['security'],
        unsubscribable: true,
    },
    invitations: {
        label: 'Invitations & Connections',
        description: 'Team invites, connection requests, and referral activity',
        icon: 'fa-duotone fa-regular fa-user-plus',
        dbCategories: ['invitation', 'collaboration', 'relationships', 'referral'],
        unsubscribable: false,
    },
    engagement: {
        label: 'Digests & Reminders',
        description: 'Weekly digests, onboarding steps, and document processing',
        icon: 'fa-duotone fa-regular fa-envelope-open-text',
        dbCategories: ['engagement', 'onboarding', 'documents', 'support'],
        unsubscribable: false,
    },
} as const;

export type PreferenceCategory = keyof typeof PREFERENCE_CATEGORIES;

export const ALL_PREFERENCE_CATEGORIES = Object.keys(PREFERENCE_CATEGORIES) as PreferenceCategory[];

/** Reverse lookup: given a notification_log category, find the preference category */
export function resolvePreferenceCategory(dbCategory: string | null | undefined): PreferenceCategory | null {
    if (!dbCategory) return null;
    for (const [prefCat, config] of Object.entries(PREFERENCE_CATEGORIES)) {
        if ((config.dbCategories as readonly string[]).includes(dbCategory)) {
            return prefCat as PreferenceCategory;
        }
    }
    return null;
}
