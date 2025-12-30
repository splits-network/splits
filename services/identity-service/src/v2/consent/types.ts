export interface ConsentPreferences {
    necessary: boolean;
    functional: boolean;
    analytics: boolean;
    marketing: boolean;
}

export interface ConsentRecord extends ConsentPreferences {
    id: string;
    user_id: string;
    ip_address?: string | null;
    user_agent?: string | null;
    consent_source: string;
    created_at: string;
    updated_at: string;
}

export interface SaveConsentRequest {
    preferences: {
        functional: boolean;
        analytics: boolean;
        marketing: boolean;
    };
    ip_address?: string;
    user_agent?: string;
    consent_source?: string;
}
