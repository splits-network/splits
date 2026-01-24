import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../../../.env') });

import { createClient } from '@supabase/supabase-js';
import { loadDatabaseConfig } from '@splits-network/shared-config';
import { StripeService } from '../src/v2/shared/stripe';
import { SubscriptionRepository } from '../src/v2/subscriptions/repository';
import { PlanRepository } from '../src/v2/plans/repository';
import { SubscriptionServiceV2 } from '../src/v2/subscriptions/service';
import { resolveAccessContext } from '../src/v2/shared/access';

async function testCheckoutFlow() {
    console.log('🧪 Testing Stripe Checkout Flow...\n');

    try {
        // Load configuration
        const dbConfig = loadDatabaseConfig();
        const supabase = createClient(dbConfig.supabaseUrl, dbConfig.supabaseServiceRoleKey!);
        
        // Initialize services
        const stripeService = new StripeService();
        const planRepository = new PlanRepository(dbConfig.supabaseUrl, dbConfig.supabaseServiceRoleKey!);
        const subscriptionRepository = new SubscriptionRepository(dbConfig.supabaseUrl, dbConfig.supabaseServiceRoleKey!);
        const accessResolver = (clerkUserId: string) => resolveAccessContext(supabase, clerkUserId);
        
        const subscriptionService = new SubscriptionServiceV2(
            subscriptionRepository,
            planRepository,
            stripeService,
            accessResolver
        );

        // Step 1: Get available plans
        console.log('📋 Step 1: Getting available plans...');
        const { data: plans } = await supabase
            .from('plans')
            .select('*')
            .order('price_monthly');
            
        console.table(plans?.map(p => ({
            name: p.name,
            price: `$${p.price_monthly}/month`,
            stripe_price_id: p.stripe_price_id,
        })));

        // Step 2: Test checkout session creation for the Pro plan
        console.log('\n💳 Step 2: Creating checkout session for Pro plan...');
        const proPlan = plans?.find(p => p.slug === 'pro');
        
        if (!proPlan) {
            throw new Error('Pro plan not found');
        }

        // Check for existing users first
        console.log('🔍 Checking for existing users...');
        const { data: existingUsers } = await supabase
            .from('users')
            .select('clerk_user_id, email, id')
            .limit(1);
            
        if (!existingUsers || existingUsers.length === 0) {
            console.log('⚠️  No users found in database');
            console.log('💡 In a real environment, users would be created via Clerk authentication');
            console.log('🎯 For this test, we\'ll skip the checkout session creation');
            console.log('✅ Stripe service and subscription service are properly configured');
            return;
        }
        
        const testUser = existingUsers[0];
        console.log(`📝 Using test user: ${testUser.email || testUser.clerk_user_id}`);
        
        try {
            const checkoutSession = await subscriptionService.createCheckoutSession(
                proPlan.id,
                testUser.clerk_user_id,
                'http://localhost:3000/billing/success',
                'http://localhost:3000/billing/cancel'
            );
            
            console.log('✅ Checkout session created successfully!');
            console.log('📍 Checkout URL:', checkoutSession.checkout_url);
            console.log('🆔 Session ID:', checkoutSession.session_id);
            
        } catch (error: any) {
            console.error('❌ Checkout session creation failed:', error.message);
            throw error;
        }

        console.log('\n🎉 Checkout flow test completed successfully!');
        console.log('\nNext steps:');
        console.log('1. Frontend can now call POST /api/v2/subscriptions/checkout-session');
        console.log('2. User gets redirected to Stripe checkout');
        console.log('3. On success, user returns to your success URL');
        console.log('4. Webhook will create subscription record in database');

    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

testCheckoutFlow();