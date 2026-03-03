import { MarketplaceProfile } from "@splits-network/shared-types";

export interface CandidateSettings {
    id: string;
    phone?: string;
    location?: string;
    current_title?: string;
    current_company?: string;
    linkedin_url?: string;
    github_url?: string;
    portfolio_url?: string;
    skills?: string[];
    bio?: string;
    marketplace_profile?: MarketplaceProfile;
    marketplace_visibility?: "public" | "limited" | "hidden";
    show_email?: boolean;
    show_phone?: boolean;
    show_location?: boolean;
    show_current_company?: boolean;
    show_salary_expectations?: boolean;
    desired_salary_min?: number;
    desired_salary_max?: number;
    desired_job_type?: string;
    open_to_remote?: boolean;
    open_to_relocation?: boolean;
    availability?: string;
    user?: {
        id: string;
        email: string;
        name: string;
    };
}

export const JOB_TYPE_OPTIONS = [
    { value: "full_time", label: "Full-time" },
    { value: "part_time", label: "Part-time" },
    { value: "contract", label: "Contract" },
    { value: "freelance", label: "Freelance" },
    { value: "internship", label: "Internship" },
];

export const AVAILABILITY_OPTIONS = [
    { value: "immediately", label: "Immediately" },
    { value: "2_weeks", label: "Within 2 weeks" },
    { value: "1_month", label: "Within 1 month" },
    { value: "2_months", label: "Within 2 months" },
    { value: "3_months", label: "Within 3 months" },
    { value: "not_looking", label: "Not actively looking" },
];

export const INDUSTRY_OPTIONS = [
    "Technology",
    "Healthcare",
    "Finance",
    "Manufacturing",
    "Retail",
    "Education",
    "Consulting",
    "Professional Services",
    "Real Estate",
    "Construction",
    "Energy",
    "Telecommunications",
    "Media & Entertainment",
    "Transportation",
    "Other",
];

export const SPECIALTY_OPTIONS = [
    "Executive",
    "Engineering",
    "Product Management",
    "Design",
    "Data Science",
    "Marketing",
    "Sales",
    "Operations",
    "Finance",
    "Legal",
    "Human Resources",
    "Customer Success",
    "Administrative",
];

export interface RecruiterRelationship {
    id: string;
    recruiter_name: string;
    recruiter_email: string;
    status: string;
    relationship_start_date: string;
    relationship_end_date: string;
    days_until_expiry?: number;
}

export interface GptSession {
    id: string;
    created_at: string;
    last_active: string;
    scopes: string[];
    refresh_token_expires_at: string;
}

export type ProfileSection =
    | "profile"
    | "marketplace"
    | "online"
    | "career"
    | "skills"
    | "privacy"
    | "connections"
    | "achievements";
