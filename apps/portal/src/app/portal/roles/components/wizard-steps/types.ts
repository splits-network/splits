export interface Company {
    id: string;
    name: string;
    identity_organization_id?: string;
}

export interface PreScreenQuestion {
    question: string;
    question_type: 'text' | 'yes_no' | 'select' | 'multi_select';
    is_required: boolean;
    options?: string[];
}

export interface FormData {
    // Step 1: Basic Info
    title: string;
    company_id: string;
    location: string;
    department: string;
    status: 'active' | 'paused' | 'closed';

    // Step 2: Compensation
    salary_min: string;
    salary_max: string;
    show_salary_range: boolean;
    fee_percentage: number;
    guarantee_days: number;
    employment_type: 'full_time' | 'contract' | 'temporary';
    open_to_relocation: boolean;

    // Step 3: Descriptions
    recruiter_description: string;
    candidate_description: string;

    // Step 4: Requirements
    mandatory_requirements: string[];
    preferred_requirements: string[];

    // Step 5: Pre-Screen Questions
    pre_screen_questions: PreScreenQuestion[];
}
