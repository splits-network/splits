export interface SavedJobFilters {
    search?: string;
    job_id?: string;
    candidate_id?: string;
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

export interface CreateSavedJobInput {
    job_id: string;
}
