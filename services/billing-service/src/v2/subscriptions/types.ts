import { Subscription, SubscriptionFilters, SubscriptionUpdate } from '../types';

export interface SubscriptionListFilters extends SubscriptionFilters {
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

export type SubscriptionCreateInput = Omit<Subscription, 'id' | 'created_at' | 'updated_at'>;
export type SubscriptionUpdateInput = SubscriptionUpdate;