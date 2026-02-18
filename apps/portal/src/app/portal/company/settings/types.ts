export type SettingsTab = "company" | "billing" | "team";

export interface Company {
    id: string;
    name: string;
    identity_organization_id?: string;
    website?: string;
    industry?: string;
    company_size?: string;
    headquarters_location?: string;
    description?: string;
    logo_url?: string;
    created_at: string;
    updated_at: string;
}

export interface TeamMember {
    id: string;
    user_id: string;
    organization_id: string;
    role_name: string;
    users?: {
        id: string;
        name?: string;
        email: string;
    };
    created_at: string;
}

export interface Invitation {
    id: string;
    email: string;
    role: string;
    status: string;
    company_id: string | null;
    created_at: string;
    expires_at: string;
}
