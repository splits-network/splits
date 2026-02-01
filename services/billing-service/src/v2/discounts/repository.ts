import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { resolveAccessContext, AccessContext } from '../shared/access';
import { 
    SubscriptionDiscount,
    ApplyDiscountRequest 
} from './types';

export class DiscountRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    /**
     * Find discount applied to a subscription
     */
    async findBySubscriptionId(subscriptionId: string): Promise<SubscriptionDiscount | null> {
        const { data, error } = await this.supabase
            
            .from('subscription_discounts')
            .select('*')
            .eq('subscription_id', subscriptionId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return null; // No discount found
            }
            throw error;
        }

        return data;
    }

    /**
     * Apply discount to subscription
     */
    async create(clerkUserId: string, request: ApplyDiscountRequest & {
        stripe_promotion_code_id: string;
        stripe_discount_id?: string;
        discount_type: 'percentage' | 'amount';
        discount_value: number;
        discount_duration: 'once' | 'repeating' | 'forever';
        discount_duration_in_months?: number;
    }): Promise<SubscriptionDiscount> {
        const context = await resolveAccessContext(this.supabase, clerkUserId);
        
        if (!context.identityUserId) {
            throw new Error('Unable to resolve user for discount application');
        }

        const { data, error } = await this.supabase
            
            .from('subscription_discounts')
            .insert({
                subscription_id: request.subscription_id,
                stripe_promotion_code_id: request.stripe_promotion_code_id,
                stripe_discount_id: request.stripe_discount_id || null,
                promotion_code: request.promotion_code,
                discount_type: request.discount_type,
                discount_value: request.discount_value,
                discount_duration: request.discount_duration,
                discount_duration_in_months: request.discount_duration_in_months || null,
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        return data;
    }

    /**
     * Remove discount from subscription
     */
    async remove(clerkUserId: string, subscriptionId: string): Promise<void> {
        const context = await resolveAccessContext(this.supabase, clerkUserId);
        
        if (!context.identityUserId) {
            throw new Error('Unable to resolve user for discount removal');
        }

        const { error } = await this.supabase
            
            .from('subscription_discounts')
            .delete()
            .eq('subscription_id', subscriptionId);

        if (error) {
            throw error;
        }
    }

    /**
     * Check if promotion code was already used by user
     */
    async isPromotionCodeUsedByUser(clerkUserId: string, promotionCodeId: string): Promise<boolean> {
        const context = await resolveAccessContext(this.supabase, clerkUserId);
        
        if (!context.identityUserId) {
            return false;
        }

        // Get user's subscriptions first
        const { data: subscriptions } = await this.supabase
            
            .from('subscriptions')
            .select('id')
            .eq('user_id', context.identityUserId);

        if (!subscriptions || subscriptions.length === 0) {
            return false;
        }

        const subscriptionIds = subscriptions.map(s => s.id);

        const { data, error } = await this.supabase
            
            .from('subscription_discounts')
            .select('id')
            .in('subscription_id', subscriptionIds)
            .eq('stripe_promotion_code_id', promotionCodeId)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        return !!data;
    }
}