import { BaseClient, BaseClientConfig, ApiResponse } from './base-client';
import { Plan, Subscription } from '@splits-network/shared-types';

/**
 * Client for Billing Service
 */
export class BillingClient extends BaseClient {
    constructor(config: BaseClientConfig) {
        super(config);
    }

    // Plans
    async listPlans(): Promise<ApiResponse<Plan[]>> {
        return this.get('/plans');
    }

    async getPlan(planId: string): Promise<ApiResponse<Plan>> {
        return this.get(`/plans/${planId}`);
    }

    // Subscriptions
    async getRecruiterSubscription(recruiterId: string): Promise<ApiResponse<Subscription | null>> {
        return this.get(`/subscriptions/recruiter/${recruiterId}`);
    }

    async createSubscription(data: {
        recruiter_id: string;
        plan_id: string;
    }): Promise<ApiResponse<Subscription>> {
        return this.post('/subscriptions', data);
    }

    async cancelSubscription(subscriptionId: string): Promise<ApiResponse<Subscription>> {
        return this.post(`/subscriptions/${subscriptionId}/cancel`, {});
    }

    // Stripe webhook
    async handleStripeWebhook(payload: any, signature: string): Promise<ApiResponse<{ received: boolean }>> {
        // Note: For webhook handling with custom headers, implement in the service directly
        return this.post('/webhook/stripe', payload);
    }
}
