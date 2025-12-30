import { Plan, PlanFilters, PlanUpdate } from '../types';

export interface PlanListFilters extends PlanFilters {
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

export type PlanCreateInput = Omit<Plan, 'id' | 'created_at' | 'updated_at'>;
export type PlanUpdateInput = PlanUpdate;