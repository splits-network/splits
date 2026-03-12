export interface NotificationPreference {
    id: string;
    user_id: string;
    category: string;
    email_enabled: boolean;
    in_app_enabled: boolean;
    created_at: string;
    updated_at: string;
}

export interface PreferenceUpdate {
    email_enabled?: boolean;
    in_app_enabled?: boolean;
}

export interface BulkPreferenceUpdate {
    preferences: Array<{
        category: string;
        email_enabled: boolean;
        in_app_enabled: boolean;
    }>;
}

export interface EffectivePreference {
    category: string;
    label: string;
    description: string;
    icon: string;
    email_enabled: boolean;
    in_app_enabled: boolean;
    unsubscribable: boolean;
    email_entitled: boolean;
}
