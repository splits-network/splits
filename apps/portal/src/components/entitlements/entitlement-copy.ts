import type { BooleanEntitlement } from "@splits-network/shared-types";
import type { PlanTier } from "@/contexts/user-profile-context";

export interface EntitlementCopyEntry {
    icon: string;
    title: string;
    description: string;
    requiredTier: PlanTier;
    ctaText: string;
}

/**
 * Static mapping from entitlement key to upsell copy.
 * Used by UpgradePrompt to show contextual upgrade messaging.
 */
export const ENTITLEMENT_COPY: Record<BooleanEntitlement, EntitlementCopyEntry> = {
    email_notifications: {
        icon: "fa-duotone fa-regular fa-envelope",
        title: "Get Email Notifications",
        description: "Stay informed with email alerts for matches, messages, and updates",
        requiredTier: "pro",
        ctaText: "Upgrade to Pro",
    },
    email_integration: {
        icon: "fa-duotone fa-regular fa-inbox",
        title: "Connect Your Email",
        description: "Send and receive emails directly from the platform",
        requiredTier: "pro",
        ctaText: "Upgrade to Pro",
    },
    calendar_integration: {
        icon: "fa-duotone fa-regular fa-calendar",
        title: "Connect Your Calendar",
        description: "Schedule interviews and sync with Google Calendar or Outlook",
        requiredTier: "pro",
        ctaText: "Upgrade to Pro",
    },
    early_access_roles: {
        icon: "fa-duotone fa-regular fa-clock",
        title: "See Roles First",
        description: "Get 24-48 hour early access to new roles before other recruiters",
        requiredTier: "pro",
        ctaText: "Upgrade to Pro",
    },
    priority_roles: {
        icon: "fa-duotone fa-regular fa-star",
        title: "Get Priority Role Access",
        description: "Featured placement on high-value priority roles",
        requiredTier: "partner",
        ctaText: "Upgrade to Partner",
    },
    ai_match_scoring: {
        icon: "fa-duotone fa-regular fa-brain-circuit",
        title: "Unlock AI Match Scoring",
        description: "Get AI-powered candidate fit analysis with True Score",
        requiredTier: "partner",
        ctaText: "Upgrade to Partner",
    },
    ai_call_summary: {
        icon: "fa-duotone fa-regular fa-sparkles",
        title: "Unlock AI Call Summaries",
        description: "Get AI-generated summaries and key takeaways from your calls",
        requiredTier: "partner",
        ctaText: "Upgrade to Partner",
    },
    call_recording: {
        icon: "fa-duotone fa-regular fa-video",
        title: "Record Your Calls",
        description: "Automatically record interview calls for review and compliance",
        requiredTier: "pro",
        ctaText: "Upgrade to Pro",
    },
    call_transcription: {
        icon: "fa-duotone fa-regular fa-closed-captioning",
        title: "Unlock Call Transcripts",
        description: "Get automatic transcriptions of your interview calls",
        requiredTier: "pro",
        ctaText: "Upgrade to Pro",
    },
    firm_creation: {
        icon: "fa-duotone fa-regular fa-building",
        title: "Build Your Recruiting Firm",
        description: "Create and manage your recruiting firm with team features",
        requiredTier: "partner",
        ctaText: "Upgrade to Partner",
    },
    api_access: {
        icon: "fa-duotone fa-regular fa-code",
        title: "Unlock API Access",
        description: "Integrate your tools with the Splits Network API",
        requiredTier: "partner",
        ctaText: "Upgrade to Partner",
    },
    advanced_analytics: {
        icon: "fa-duotone fa-regular fa-chart-mixed",
        title: "Unlock Advanced Analytics",
        description: "Deep-dive into your performance with advanced charts and insights",
        requiredTier: "pro",
        ctaText: "Upgrade to Pro",
    },
    data_export: {
        icon: "fa-duotone fa-regular fa-file-export",
        title: "Export Your Data",
        description: "Download your data as CSV for external analysis",
        requiredTier: "pro",
        ctaText: "Upgrade to Pro",
    },
};
