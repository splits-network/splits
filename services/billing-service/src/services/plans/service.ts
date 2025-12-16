import { BillingRepository } from '../../repository';
import { Plan } from '@splits-network/shared-types';

/**
 * Plan Service
 * Handles subscription plan management
 */
export class PlanService {
    constructor(private repository: BillingRepository) {}

    async getPlanById(id: string): Promise<Plan> {
        const plan = await this.repository.findPlanById(id);
        if (!plan) {
            throw new Error(`Plan ${id} not found`);
        }
        return plan;
    }

    async getAllPlans(): Promise<Plan[]> {
        return await this.repository.findAllPlans();
    }

    async createPlan(
        name: string,
        priceMonthly: number,
        stripePriceId?: string,
        features: Record<string, any> = {}
    ): Promise<Plan> {
        return await this.repository.createPlan({
            name,
            price_monthly: priceMonthly,
            stripe_price_id: stripePriceId,
            features,
        });
    }
}
