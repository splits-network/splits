import { SupabaseClient } from '@supabase/supabase-js';
import { StripeService } from '../shared/stripe';
import { Plan } from '../shared/database-types';

export class StripePlanSync {
    constructor(
        private stripe: StripeService,
        private supabase: SupabaseClient
    ) { }

    /**
     * Create Stripe products and prices for existing plans
     * Updates the plans table with stripe_product_id and stripe_price_id
     */
    async createStripeProducts(): Promise<void> {
        console.log('Starting Stripe product sync...');

        // Get all plans that don't have Stripe products yet
        const { data: plans, error } = await this.supabase

            .from('plans')
            .select('*')
            .is('stripe_product_id', null);

        if (error) {
            throw error;
        }

        if (!plans || plans.length === 0) {
            console.log('No plans need Stripe product creation');
            return;
        }

        for (const plan of plans) {
            await this.createProductForPlan(plan);
        }

        console.log('Stripe product sync completed');
    }

    /**
     * Create Stripe product and price for a single plan
     */
    private async createProductForPlan(plan: Plan): Promise<void> {
        console.log(`Creating Stripe product for plan: ${plan.name}`);

        try {
            console.log(`Creating Stripe product for ${plan.name}...`);

            // Create product
            const product = await this.stripe.createProduct(
                plan.name,
                `${plan.name} plan` // Use plan name as description
            );

            // Create price (handle free plan)
            let price;
            const priceInCents = Math.round(parseFloat(plan.price_monthly) * 100);

            if (priceInCents === 0) {
                // For free plans, create a price of $0
                price = await this.stripe.createPrice(
                    product.id,
                    0,
                    'usd', // Default currency
                    'month' // Default interval
                );
            } else {
                price = await this.stripe.createPrice(
                    product.id,
                    priceInCents,
                    'usd', // Default currency 
                    'month' // Default interval
                );
            }

            // Update the plan with Stripe IDs
            const { error: updateError } = await this.supabase

                .from('plans')
                .update({
                    stripe_product_id: product.id,
                    stripe_price_id: price.id,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', plan.id);

            if (updateError) {
                console.error(`Failed to update plan ${plan.id} with Stripe IDs:`, updateError);
                throw updateError;
            }

            console.log(`✅ Created Stripe product ${product.id} and price ${price.id} for plan ${plan.name}`);

        } catch (error) {
            console.error(`Failed to create Stripe product for plan ${plan.name}:`, error);
            throw error;
        }
    }

    /**
     * Verify that all plans have Stripe products
     */
    async verifyPlanSync(): Promise<boolean> {
        const { data: plans, error } = await this.supabase

            .from('plans')
            .select('id, name, stripe_product_id, stripe_price_id');

        if (error) {
            throw error;
        }

        const missingProducts = plans?.filter(plan =>
            !plan.stripe_product_id || !plan.stripe_price_id
        ) || [];

        if (missingProducts.length > 0) {
            console.warn('Plans missing Stripe products:', missingProducts);
            return false;
        }

        console.log('✅ All plans have Stripe products');
        return true;
    }
}