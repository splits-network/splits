/**
 * Subscription Domain Types
 */

import { Subscription as DBSubscription } from '../shared/database-types';

export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing';

// Use the database type as the main Subscription type
export type Subscription = DBSubscription;

export interface SubscriptionFilters {
    user_id?: string;
    plan_id?: string;
    status?: SubscriptionStatus;
}

export interface SubscriptionListFilters extends SubscriptionFilters {
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

export type SubscriptionCreateInput = Partial<Omit<DBSubscription, 'id' | 'created_at' | 'updated_at'>>;
export type SubscriptionUpdateInput = Partial<Omit<DBSubscription, 'id' | 'created_at' | 'updated_at'>>;
