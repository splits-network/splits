import { RecruiterCompany } from '@splits-network/shared-types';

export interface CompanySourcerFilters {
    company_id?: string;
    recruiter_id?: string;
    status?: 'pending' | 'active' | 'declined' | 'terminated';
}

export interface CompanySourcerCreate {
    company_id: string;
    recruiter_id: string;
    relationship_start_date?: string;
    notes?: string;
}

export interface CompanySourcerUpdate {
    status?: 'pending' | 'active' | 'declined' | 'terminated';
    relationship_end_date?: string;
    termination_reason?: string;
}

export { RecruiterCompany };
