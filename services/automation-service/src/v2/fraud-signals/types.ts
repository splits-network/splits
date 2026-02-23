/**
 * Fraud Signal Domain Types
 * Matches the fraud_signals table schema
 */

export interface FraudSignal {
    id: string;
    signal_type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: 'active' | 'resolved' | 'false_positive';
    recruiter_id: string | null;
    job_id: string | null;
    candidate_id: string | null;
    application_id: string | null;
    placement_id: string | null;
    signal_data: Record<string, any>;
    confidence_score: number;
    reviewed_by: string | null;
    reviewed_at: string | null;
    resolution_notes: string | null;
    action_taken: string | null;
    created_at: string;
    updated_at: string;
}

export interface FraudSignalFilters {
    recruiter_id?: string;
    candidate_id?: string;
    application_id?: string;
    severity?: string;
    status?: string;
    signal_type?: string;
    page?: number;
    limit?: number;
}

export type FraudSignalUpdate = Partial<Omit<FraudSignal, 'id' | 'created_at' | 'updated_at'>>;
