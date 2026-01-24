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

async function testPortalFlow() {
    console.log('🧪 Testing Stripe Customer Portal Flow...\n');

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

        // Step 1: Check existing subscriptions
        console.log('📋 Step 1: Checking existing subscriptions...');
        const { data: subscriptions } = await supabase
            .from('subscriptions')
            .select('*')
            .limit(3);
            
        console.log(`Found ${subscriptions?.length || 0} subscriptions in database`);
        
        if (subscriptions && subscriptions.length > 0) {
            console.table(subscriptions.map(s => ({
                user_id: s.user_id,
                status: s.status,
                stripe_customer_id: s.stripe_customer_id,
            })));
            
            // Try to create portal session for first user with active subscription
            const activeSubscription = subscriptions.find(s => 
                s.status === 'active' && s.stripe_customer_id
            );
            
            if (activeSubscription) {
                console.log('\n💻 Step 2: Creating Customer Portal session...');
                
                // Get user's clerk_user_id
                const { data: user } = await supabase
                    .from('users')
                    .select('clerk_user_id')
                    .eq('id', activeSubscription.user_id)
                    .single();
                
                if (user) {
                    try {
                        const portalSession = await subscriptionService.createPortalSession(
                            user.clerk_user_id,
                            'http://localhost:3000/billing'
                        );
                        
                        console.log('✅ Customer Portal session created successfully!');
                        console.log('📍 Portal URL:', portalSession.portal_url);
                        
                    } catch (error: any) {
                        console.error('❌ Portal session creation failed:', error.message);
                    }
                } else {
                    console.log('⚠️  User not found for subscription');
                }
            } else {
                console.log('⚠️  No active subscriptions with Stripe customer ID found');
                console.log('💡 User would need to complete checkout first to create portal session');
            }
        } else {
            console.log('⚠️  No subscriptions found in database');
            console.log('💡 Users would need to complete checkout first to access portal');
        }

        console.log('\n🎉 Portal flow test completed!');

    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

testPortalFlow();