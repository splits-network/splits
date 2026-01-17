import { CandidateSourcer } from '@splits-network/shared-types';

export interface CandidateSourcerFilters {
    candidate_id?: string;
    sourcer_recruiter_id?: string;
    sourcer_type?: 'recruiter' | 'tsn';
    active_protection?: boolean; // Filter by protection_expires_at > now
}

export interface CandidateSourcerCreate {
    candidate_id: string;
    sourcer_recruiter_id: string;
    sourcer_type: 'recruiter' | 'tsn';
    sourced_at?: Date;
    protection_window_days?: number;
    protection_expires_at: Date;
    notes?: string;
}

export interface CandidateSourcerUpdate {
    notes?: string;
    protection_window_days?: number;
    protection_expires_at?: Date;
}

export { CandidateSourcer };
