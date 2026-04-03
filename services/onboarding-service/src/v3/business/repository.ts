/**
 * Business Onboarding Repository
 * Direct Supabase queries for the business onboarding flow.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { BadRequestError } from '@splits-network/shared-fastify';
import {
    OnboardingUser,
    OnboardingOrganization,
    OnboardingMembership,
    OnboardingCompany,
    OnboardingBillingProfile,
} from './types.js';

export class BusinessOnboardingRepository {
    constructor(private supabase: SupabaseClient) {}

    async findUserByClerkId(clerkUserId: string): Promise<OnboardingUser | null> {
        const { data, error } = await this.supabase
            .from('users')
            .select('*')
            .eq('clerk_user_id', clerkUserId)
            .maybeSingle();

        if (error) throw new BadRequestError(`Failed to find user: ${error.message}`);
        return data;
    }

    async createOrganization(input: {
        name: string;
        slug: string;
        now: string;
    }): Promise<OnboardingOrganization> {
        const { data, error } = await this.supabase
            .from('organizations')
            .insert({
                name: input.name,
                type: 'company',
                slug: input.slug,
                created_at: input.now,
                updated_at: input.now,
            })
            .select()
            .single();

        if (error) throw new BadRequestError(`Failed to create organization: ${error.message}`);
        return data;
    }

    async createMembership(input: {
        userId: string;
        organizationId: string;
        now: string;
    }): Promise<OnboardingMembership> {
        const { data, error } = await this.supabase
            .from('memberships')
            .insert({
                user_id: input.userId,
                organization_id: input.organizationId,
                role_name: 'company_admin',
                created_at: input.now,
                updated_at: input.now,
            })
            .select()
            .single();

        if (error) throw new BadRequestError(`Failed to create membership: ${error.message}`);
        return data;
    }

    async createCompany(input: {
        organizationId: string;
        name: string;
        website: string | null;
        industry: string | null;
        companySize: string | null;
        description: string | null;
        headquartersLocation: string | null;
        logoUrl: string | null;
        now: string;
    }): Promise<OnboardingCompany> {
        const { data, error } = await this.supabase
            .from('companies')
            .insert({
                identity_organization_id: input.organizationId,
                name: input.name,
                website: input.website,
                industry: input.industry,
                company_size: input.companySize,
                description: input.description,
                headquarters_location: input.headquartersLocation,
                logo_url: input.logoUrl,
                status: 'active',
                created_at: input.now,
                updated_at: input.now,
            })
            .select()
            .single();

        if (error) throw new BadRequestError(`Failed to create company: ${error.message}`);
        return data;
    }

    async createBillingProfile(input: {
        companyId: string;
        billingTerms: string;
        billingEmail: string;
        invoiceDeliveryMethod: string;
        now: string;
    }): Promise<OnboardingBillingProfile | null> {
        const { data, error } = await this.supabase
            .from('company_billing_profiles')
            .insert({
                company_id: input.companyId,
                billing_terms: input.billingTerms,
                billing_email: input.billingEmail,
                invoice_delivery_method: input.invoiceDeliveryMethod,
                created_at: input.now,
                updated_at: input.now,
            })
            .select()
            .single();

        if (error) return null;
        return data;
    }

    async completeInvitation(invitationId: string, companyId: string, now: string): Promise<boolean> {
        const { error } = await this.supabase
            .from('company_invitations')
            .update({
                status: 'completed',
                company_id: companyId,
                completed_at: now,
            })
            .eq('id', invitationId);

        return !error;
    }

    async createSourcerConnection(recruiterId: string, companyId: string, now: string): Promise<boolean> {
        const { error } = await this.supabase
            .from('recruiter_companies')
            .insert({
                recruiter_id: recruiterId,
                company_id: companyId,
                relationship_type: 'sourcer',
                status: 'pending',
                created_at: now,
                updated_at: now,
            });

        return !error;
    }

    async markOnboardingComplete(userId: string, now: string): Promise<OnboardingUser> {
        const { data, error } = await this.supabase
            .from('users')
            .update({
                onboarding_status: 'completed',
                onboarding_step: 4,
                onboarding_completed_at: now,
            })
            .eq('id', userId)
            .select()
            .single();

        if (error) throw new BadRequestError(`Failed to mark onboarding complete: ${error.message}`);
        return data;
    }
}
