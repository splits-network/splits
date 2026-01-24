import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../../../.env') });

import { createClient } from '@supabase/supabase-js';
import { loadDatabaseConfig } from '@splits-network/shared-config';
import { StripeService } from '../src/v2/shared/stripe';

async function forceSyncStripeProducts() {
    console.log('🚀 Force syncing Stripe products with live account...\n');

    try {
        // Load configuration
        const dbConfig = loadDatabaseConfig();
        const supabase = createClient(dbConfig.supabaseUrl, dbConfig.supabaseServiceRoleKey!);
        const stripeService = new StripeService();

        // Step 1: Get all plans
        console.log('📋 Step 1: Fetching existing plans...');
        const { data: plans, error: plansError } = await supabase
            .from('plans')
            .select('*')
            .order('created_at');

        if (plansError) {
            throw plansError;
        }

        console.log(`Found ${plans?.length || 0} plans`);

        // Step 2: For each plan, check if product exists in Stripe
        for (const plan of plans || []) {
            console.log(`\n🔍 Checking plan: ${plan.name} (${plan.slug})`);
            
            let productExists = false;
            let priceExists = false;
            
            // Check if product exists in Stripe
            if (plan.stripe_product_id) {
                try {
                    const stripe = stripeService.getStripe();
                    await stripe.products.retrieve(plan.stripe_product_id);
                    productExists = true;
                    console.log(`✅ Product ${plan.stripe_product_id} exists in Stripe`);
                } catch (error) {
                    console.log(`❌ Product ${plan.stripe_product_id} NOT found in Stripe`);
                }
            }

            // Check if price exists in Stripe  
            if (plan.stripe_price_id && productExists) {
                try {
                    const stripe = stripeService.getStripe();
                    await stripe.prices.retrieve(plan.stripe_price_id);
                    priceExists = true;
                    console.log(`✅ Price ${plan.stripe_price_id} exists in Stripe`);
                } catch (error) {
                    console.log(`❌ Price ${plan.stripe_price_id} NOT found in Stripe`);
                }
            }

            // If product or price doesn't exist, create new ones
            if (!productExists || !priceExists) {
                console.log(`🔨 Creating new Stripe product for ${plan.name}...`);
                
                // Create product
                const product = await stripeService.createProduct(
                    plan.name,
                    `${plan.name} subscription plan`
                );
                
                // Create price
                const priceInCents = Math.round(parseFloat(plan.price_monthly) * 100);
                const price = await stripeService.createPrice(
                    product.id,
                    priceInCents,
                    'usd',
                    'month'
                );
                
                // Update plan with new IDs
                const { error: updateError } = await supabase
                    .from('plans')
                    .update({
                        stripe_product_id: product.id,
                        stripe_price_id: price.id,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', plan.id);

                if (updateError) {
                    console.error(`Failed to update plan ${plan.id}:`, updateError);
                    throw updateError;
                }

                console.log(`✅ Created product ${product.id} and price ${price.id} for ${plan.name}`);
                console.log(`💰 Price: $${(priceInCents / 100)} per month`);
            }
        }

        console.log('\n🎉 Force sync completed successfully!');
        
        // Final verification
        console.log('\n🔍 Final verification...');
        const { data: updatedPlans } = await supabase
            .from('plans')
            .select('name, slug, price_monthly, stripe_product_id, stripe_price_id')
            .order('created_at');

        console.table(updatedPlans);

    } catch (error) {
        console.error('💥 Force sync failed:', error);
        process.exit(1);
    }
}

forceSyncStripeProducts();