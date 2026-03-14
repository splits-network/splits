export interface Job {
    id: string;
    title: string;
    company_id: string;
    company_name?: string;
    location?: string;
    salary_min?: number;
    salary_max?: number;
    fee_percentage: number;
    status: string;
    description?: string;
    requirements?: string[];
}

export interface Candidate {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
    location?: string;
    current_title?: string;
    current_company?: string;
    linkedin_url?: string;
}

export interface CandidateDocument {
    id: string;
    file_name: string;
    filename?: string;
    file_type: string;
    document_type?: string;
}

export type StepId = "find-role" | "select-candidate" | "build-case" | "review";

export const STEP_LABELS: Record<StepId, string> = {
    "find-role": "Find a Role",
    "select-candidate": "Select Candidate",
    "build-case": "Build Your Case",
    "review": "Review & Submit",
};

export const STATUS_BADGE_MAP: Record<string, string> = {
    active: "badge-success",
    paused: "badge-warning",
    closed: "badge-neutral",
};
