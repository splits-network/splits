import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../../../.env') });

import { createClient } from '@supabase/supabase-js';
import { loadDatabaseConfig } from '@splits-network/shared-config';

async function checkPlans() {
    try {
        const dbConfig = loadDatabaseConfig();
        const supabase = createClient(dbConfig.supabaseUrl, dbConfig.supabaseServiceRoleKey!);
        
        const { data, error } = await supabase
            .from('plans')
            .select('id, name, slug, price_monthly, stripe_product_id, stripe_price_id')
            .order('created_at');
        
        if (error) {
            console.error('Error:', error);
            return;
        }
        
        console.log('✅ Plans with Stripe integration:');
        console.table(data);
        
        // Show Stripe IDs specifically
        console.log('\n📋 Stripe IDs:');
        data?.forEach(plan => {
            console.log(`${plan.name} (${plan.slug}):`);
            console.log(`  Product ID: ${plan.stripe_product_id}`);
            console.log(`  Price ID: ${plan.stripe_price_id}`);
            console.log('');
        });
    } catch (error) {
        console.error('Failed:', error);
    }
}

checkPlans();