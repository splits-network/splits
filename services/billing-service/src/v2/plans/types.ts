/**
 * Plan Domain Types
 */

import { Plan as DBPlan } from '../shared/database-types';

export type BillingInterval = 'monthly' | 'annual';
export type PlanStatus = 'active' | 'archived';

// Use the database type as the main Plan type
export type Plan = DBPlan;

export interface PlanFilters {
    search?: string;
    status?: PlanStatus;
    billing_interval?: BillingInterval;
}

export interface PlanListFilters extends PlanFilters {
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

export type PlanCreateInput = Partial<Omit<DBPlan, 'id' | 'created_at' | 'updated_at'>>;
export type PlanUpdateInput = Partial<Omit<DBPlan, 'id' | 'created_at' | 'updated_at'>>;
