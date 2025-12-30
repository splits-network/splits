/**
 * Fraud Signal Domain Types
 */

export interface FraudSignal {
    id: string;
    event_id: string;
    event_type: string;
    entity_type: 'recruiter' | 'candidate' | 'application' | 'placement';
    entity_id: string;
    signal_type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    details: Record<string, any>;
    status: 'open' | 'reviewing' | 'resolved' | 'false_positive';
    reviewed_by: string | null;
    reviewed_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface FraudSignalFilters {
    entity_type?: string;
    entity_id?: string;
    severity?: string;
    status?: string;
    signal_type?: string;
    page?: number;
    limit?: number;
}

export type FraudSignalUpdate = Partial<Omit<FraudSignal, 'id' | 'created_at' | 'updated_at'>>;
