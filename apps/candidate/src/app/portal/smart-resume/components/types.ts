export type SmartResumeTab =
    | "experience"
    | "projects"
    | "tasks"
    | "skills"
    | "education"
    | "certifications"
    | "publications";

export interface SmartResumeProfile {
    id: string;
    candidate_id: string;
    headline?: string;
    professional_summary?: string;
    created_at?: string;
    updated_at?: string;
}

export interface Experience {
    id: string;
    profile_id: string;
    company: string;
    title: string;
    location?: string;
    start_date?: string;
    end_date?: string;
    is_current?: boolean;
    description?: string;
    achievements?: string[];
    visible_to_matching?: boolean;
}

export interface Project {
    id: string;
    profile_id: string;
    name: string;
    description?: string;
    outcomes?: string;
    url?: string;
    start_date?: string;
    end_date?: string;
    skills_used?: string[];
    experience_id?: string;
    visible_to_matching?: boolean;
}

export interface Task {
    id: string;
    profile_id: string;
    description: string;
    impact?: string;
    skills_used?: string[];
    experience_id?: string;
    project_id?: string;
    visible_to_matching?: boolean;
}

export interface Skill {
    id: string;
    profile_id: string;
    name: string;
    category?: string;
    proficiency?: "expert" | "advanced" | "intermediate" | "beginner";
    years_used?: number;
    visible_to_matching?: boolean;
}

export interface Education {
    id: string;
    profile_id: string;
    institution: string;
    degree?: string;
    field_of_study?: string;
    start_date?: string;
    end_date?: string;
    gpa?: string;
    honors?: string;
    visible_to_matching?: boolean;
}

export interface Certification {
    id: string;
    profile_id: string;
    name: string;
    issuer?: string;
    date_obtained?: string;
    expiry_date?: string;
    credential_url?: string;
    visible_to_matching?: boolean;
}

export interface Publication {
    id: string;
    profile_id: string;
    title: string;
    publication_type?: string;
    publisher?: string;
    url?: string;
    published_date?: string;
    description?: string;
    visible_to_matching?: boolean;
}

export interface FieldConfig {
    name: string;
    label: string;
    type: "text" | "textarea" | "date" | "select" | "boolean" | "tags" | "list" | "number";
    required?: boolean;
    placeholder?: string;
    options?: { value: string; label: string }[];
}

export interface SmartResumeData {
    profile: SmartResumeProfile | null;
    experiences: Experience[];
    projects: Project[];
    tasks: Task[];
    skills: Skill[];
    education: Education[];
    certifications: Certification[];
    publications: Publication[];
}

export const SKILL_CATEGORIES = [
    { value: "technical", label: "Technical" },
    { value: "language", label: "Language" },
    { value: "soft", label: "Soft Skill" },
    { value: "tool", label: "Tool / Platform" },
    { value: "industry", label: "Industry Knowledge" },
    { value: "other", label: "Other" },
];

export const PROFICIENCY_LEVELS = [
    { value: "expert", label: "Expert" },
    { value: "advanced", label: "Advanced" },
    { value: "intermediate", label: "Intermediate" },
    { value: "beginner", label: "Beginner" },
];

export const PUBLICATION_TYPES = [
    { value: "journal", label: "Journal Article" },
    { value: "conference", label: "Conference Paper" },
    { value: "book", label: "Book" },
    { value: "blog", label: "Blog Post" },
    { value: "whitepaper", label: "Whitepaper" },
    { value: "patent", label: "Patent" },
    { value: "other", label: "Other" },
];
