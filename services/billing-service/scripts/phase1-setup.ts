#!/usr/bin/env node

/**
 * Phase 1 Setup Script
 * 
 * This script handles the initial setup for Stripe integration:
 * 1. Seeds the plans table with initial plans
 * 2. Creates Stripe products and prices
 * 3. Updates plans with Stripe IDs
 */

// Load environment variables for standalone script execution
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../../../.env') });

import { createClient } from '@supabase/supabase-js';
import { loadDatabaseConfig } from '@splits-network/shared-config';
import { StripeService } from '../src/v2/shared/stripe';
import { StripePlanSync } from '../src/v2/plans/stripe-sync';

async function runPhase1Setup() {
    console.log('🚀 Starting Phase 1 Stripe Integration Setup...\n');

    try {
        // Load configuration
        const dbConfig = loadDatabaseConfig();

        // Create Supabase client
        const supabase = createClient(dbConfig.supabaseUrl, dbConfig.supabaseServiceRoleKey!);

        // Initialize services
        const stripeService = new StripeService();
        const planSync = new StripePlanSync(stripeService, supabase);

        // Step 1: Check if plans exist
        console.log('📋 Step 1: Checking existing plans...');
        const { data: existingPlans, error: plansError } = await supabase

            .from('plans')
            .select('id, name, slug')
            .order('created_at');

        if (plansError) {
            throw plansError;
        }

        console.log(`Found ${existingPlans?.length || 0} existing plans`);
        if (existingPlans && existingPlans.length > 0) {
            console.log('Plans:', existingPlans.map(p => `${p.name} (${p.slug})`).join(', '));
        }

        // Step 2: Create Stripe products for plans
        console.log('\n💳 Step 2: Creating Stripe products and prices...');
        await planSync.createStripeProducts();

        // Step 3: Verify setup
        console.log('\n✅ Step 3: Verifying setup...');
        const isValid = await planSync.verifyPlanSync();

        if (isValid) {
            console.log('🎉 Phase 1 setup completed successfully!');
            console.log('\nNext steps:');
            console.log('- Set up webhook endpoint for Stripe events');
            console.log('- Test subscription checkout flow');
            console.log('- Update frontend to use new Stripe checkout');
        } else {
            console.log('❌ Setup validation failed. Check the logs above for details.');
            process.exit(1);
        }

    } catch (error) {
        console.error('💥 Phase 1 setup failed:', error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    runPhase1Setup();
}

export { runPhase1Setup };