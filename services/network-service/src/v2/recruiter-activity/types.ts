export type RecruiterActivityType =
    | 'placement_created'
    | 'placement_completed'
    | 'company_connected'
    | 'candidate_connected'
    | 'invitation_accepted'
    | 'referral_signup'
    | 'profile_verified'
    | 'profile_updated';

export interface RecruiterActivity {
    id: string;
    recruiter_id: string;
    activity_type: RecruiterActivityType;
    description: string;
    metadata: Record<string, unknown>;
    created_at: string;
}

export interface CreateActivityInput {
    recruiter_id: string;
    activity_type: RecruiterActivityType;
    description: string;
    metadata?: Record<string, unknown>;
}
