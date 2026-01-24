import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../../../.env') });

import Stripe from 'stripe';
import { loadStripeConfig } from '@splits-network/shared-config';

async function verifyStripeProducts() {
    try {
        const stripeConfig = loadStripeConfig();
        console.log('🔐 Using Stripe key:', stripeConfig.secretKey?.substring(0, 20) + '...');
        
        const stripe = new Stripe(stripeConfig.secretKey!, { apiVersion: '2024-12-18.acacia' });
        
        // Fetch products from Stripe
        console.log('\n🔍 Fetching products from Stripe...');
        const products = await stripe.products.list({ limit: 10 });
        
        console.log(`✅ Found ${products.data.length} Stripe products:`);
        products.data.forEach(product => {
            console.log(`- ${product.name} (ID: ${product.id})`);
        });
        
        // Check database product and price IDs
        console.log('\n🔍 Verifying current database IDs exist in Stripe...');
        
        // Get current IDs from database
        const { createClient } = await import('@supabase/supabase-js');
        const { loadDatabaseConfig } = await import('@splits-network/shared-config');
        
        const dbConfig = loadDatabaseConfig();
        const supabase = createClient(dbConfig.supabaseUrl, dbConfig.supabaseServiceRoleKey!);
        
        const { data: dbPlans, error } = await supabase
            .from('plans')
            .select('name, slug, stripe_product_id, stripe_price_id, price_monthly')
            .order('created_at');
        
        if (error) {
            console.error('Failed to fetch plans from database:', error);
            return;
        }
        
        for (const plan of dbPlans || []) {
            console.log(`\n📋 Checking ${plan.name} (${plan.slug}):`);
            
            // Verify product
            try {
                const product = await stripe.products.retrieve(plan.stripe_product_id);
                console.log(`  ✅ Product: ${product.name} (${product.id})`);
            } catch (error) {
                console.log(`  ❌ Product ${plan.stripe_product_id}: Not found`);
                continue;
            }
            
            // Verify price
            try {
                const price = await stripe.prices.retrieve(plan.stripe_price_id);
                console.log(`  ✅ Price: $${(price.unit_amount! / 100)} ${price.currency}/${price.recurring?.interval}`);
                
                // Verify price matches database
                const expectedCents = Math.round(parseFloat(plan.price_monthly) * 100);
                if (price.unit_amount === expectedCents) {
                    console.log(`  ✅ Price matches database: $${plan.price_monthly}/month`);
                } else {
                    console.log(`  ⚠️  Price mismatch: Stripe=$${price.unit_amount! / 100}, DB=$${plan.price_monthly}`);
                }
            } catch (error) {
                console.log(`  ❌ Price ${plan.stripe_price_id}: Not found`);
            }
        }
        
    } catch (error) {
        console.error('❌ Failed to verify Stripe products:', error);
    }
}

verifyStripeProducts();