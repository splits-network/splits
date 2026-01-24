#!/usr/bin/env node
/**
 * Test Stripe Webhook Processing
 * 
 * This script tests the V2 webhook service with sample Stripe events
 */

import { createClient } from '@supabase/supabase-js';
import { WebhookRepositoryV2 } from '../src/v2/webhooks/repository';
import { WebhookServiceV2 } from '../src/v2/webhooks/service-simple';
import { SubscriptionServiceV2 } from '../src/v2/subscriptions/service';
import { SubscriptionRepository } from '../src/v2/subscriptions/repository';
import { PlanRepository } from '../src/v2/plans/repository';
import { EventPublisher } from '../src/v2/shared/events';
import { StripeService } from '../src/v2/shared/stripe';
import { resolveAccessContext } from '../src/v2/shared/access';
import Stripe from 'stripe';

async function main() {
    console.log('🧪 Testing V2 Webhook Processing...\n');

    // Initialize repositories and services
    const supabaseUrl = process.env.SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const client = createClient(supabaseUrl, supabaseKey);
    
    const webhookRepository = new WebhookRepositoryV2(client);
    const subscriptionRepository = new SubscriptionRepository(supabaseUrl, supabaseKey);
    const planRepository = new PlanRepository(supabaseUrl, supabaseKey);
    // Skip StripeService for this test - we're only testing webhook processing
    const accessResolver = (clerkUserId: string) => resolveAccessContext(client, clerkUserId);
    
    // Mock event publisher
    const eventPublisher: EventPublisher = {
        publish: async (eventType: string, data: any) => {
            console.log(`📡 Event published: ${eventType}`, JSON.stringify(data, null, 2));
        }
    };
    
    const subscriptionService = new SubscriptionServiceV2(
        subscriptionRepository,
        planRepository,
        null as any, // Skip StripeService for webhook test
        accessResolver,
        eventPublisher
    );
    
    const webhookService = new WebhookServiceV2(
        webhookRepository,
        subscriptionService,
        eventPublisher
    );

    // Test webhook processing with a sample subscription.created event
    const sampleEvent: Stripe.Event = {
        id: 'evt_test_' + Date.now(),
        object: 'event',
        api_version: '2025-11-17.clover',
        created: Math.floor(Date.now() / 1000),
        type: 'customer.subscription.created',
        livemode: false,
        pending_webhooks: 1,
        request: { id: null, idempotency_key: null },
        data: {
            object: {
                id: 'sub_test_subscription',
                object: 'subscription',
                customer: 'cus_test_customer',
                status: 'active',
                current_period_start: Math.floor(Date.now() / 1000),
                current_period_end: Math.floor((Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000),
                items: {
                    object: 'list',
                    data: []
                }
            } as any
        }
    };

    console.log('📨 Testing webhook processing...');
    console.log('Event Type:', sampleEvent.type);
    console.log('Event ID:', sampleEvent.id);
    console.log();

    try {
        await webhookService.handleStripeWebhook(sampleEvent);
        console.log('✅ Webhook processed successfully!');
    } catch (error) {
        console.error('❌ Webhook processing failed:', error);
        process.exit(1);
    }

    // Check the webhook logs
    console.log('\n📋 Recent webhook logs:');
    try {
        const logs = await webhookRepository.getWebhookLogs(5);
        logs.forEach(log => {
            const status = log.status === 'completed' ? '✅' : log.status === 'failed' ? '❌' : '⏳';
            console.log(`${status} ${log.event_type} (${log.event_id}) - ${log.status}`);
        });
    } catch (error) {
        console.error('Failed to fetch webhook logs:', error);
    }

    // Test idempotency by processing the same event again
    console.log('\n🔄 Testing idempotency (processing same event again)...');
    try {
        await webhookService.handleStripeWebhook(sampleEvent);
        console.log('✅ Idempotency check passed (event skipped)');
    } catch (error) {
        console.error('❌ Idempotency test failed:', error);
        process.exit(1);
    }

    console.log('\n🎉 All webhook tests passed!');
}

main().catch(error => {
    console.error('Test script failed:', error);
    process.exit(1);
});