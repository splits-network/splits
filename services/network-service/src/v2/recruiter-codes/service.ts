/**
 * Recruiter Codes Service - V2
 * Business logic for recruiter referral codes
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { RecruiterCodeRepository } from './repository';
import { EventPublisherV2 } from '../shared/events';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { StandardListParams, StandardListResponse } from '@splits-network/shared-types';
import {
    RecruiterCode,
    RecruiterCodeFilters,
    RecruiterCodeUpdate,
    RecruiterCodeLogEntry,
    RecruiterCodeLookupResult,
    LogCodeUsageRequest,
    CreateRecruiterCodeRequest,
} from './types';

export class RecruiterCodeServiceV2 {
    private accessResolver: AccessContextResolver;

    constructor(
        private repository: RecruiterCodeRepository,
        private supabase: SupabaseClient,
        private eventPublisher?: EventPublisherV2
    ) {
        this.accessResolver = new AccessContextResolver(supabase);
    }

    /**
     * List codes with role-based filtering
     */
    async list(
        clerkUserId: string,
        params: StandardListParams & RecruiterCodeFilters
    ): Promise<StandardListResponse<RecruiterCode>> {
        return await this.repository.list(clerkUserId, params);
    }

    /**
     * Get code by ID (authenticated)
     */
    async getById(id: string, clerkUserId: string): Promise<RecruiterCode> {
        const code = await this.repository.findById(id, clerkUserId);
        if (!code) {
            throw new Error('Referral code not found');
        }
        return code;
    }

    /**
     * Create a new referral code (recruiters only)
     */
    async create(
        request: CreateRecruiterCodeRequest,
        clerkUserId: string
    ): Promise<RecruiterCode> {
        const accessContext = await this.accessResolver.resolve(clerkUserId);

        if (!accessContext.recruiterId) {
            throw new Error('Only recruiters can create referral codes');
        }

        const code = await this.repository.create(accessContext.recruiterId, {
            label: request.label,
        });

        await this.eventPublisher?.publish('recruiter_code.created', {
            code_id: code.id,
            recruiter_id: code.recruiter_id,
            code: code.code,
        });

        return code;
    }

    /**
     * Update code (label, status)
     */
    async update(
        id: string,
        updates: RecruiterCodeUpdate,
        clerkUserId: string
    ): Promise<RecruiterCode> {
        // Verify ownership
        const existing = await this.repository.findById(id, clerkUserId);
        if (!existing) {
            throw new Error('Referral code not found');
        }

        return await this.repository.update(id, updates);
    }

    /**
     * Delete code (soft delete)
     */
    async delete(id: string, clerkUserId: string): Promise<void> {
        const existing = await this.repository.findById(id, clerkUserId);
        if (!existing) {
            throw new Error('Referral code not found');
        }

        await this.repository.delete(id);
    }

    /**
     * Public lookup by code string - validates code is active
     */
    async lookupByCode(code: string): Promise<RecruiterCodeLookupResult> {
        const recruiterCode = await this.repository.findByCode(code);

        if (!recruiterCode) {
            return {
                id: '',
                code,
                recruiter_id: '',
                is_valid: false,
                error_message: 'Referral code not found',
            };
        }

        if (recruiterCode.status !== 'active') {
            return {
                id: recruiterCode.id,
                code: recruiterCode.code,
                recruiter_id: recruiterCode.recruiter_id,
                is_valid: false,
                error_message: 'This referral code is no longer active',
            };
        }

        const rawRecruiter = recruiterCode.recruiter as any;

        return {
            id: recruiterCode.id,
            code: recruiterCode.code,
            recruiter_id: recruiterCode.recruiter_id,
            is_valid: true,
            recruiter: {
                id: rawRecruiter?.id || recruiterCode.recruiter_id,
                name: rawRecruiter?.user?.name || 'Unknown',
                profile_image_url: rawRecruiter?.user?.profile_image_url,
            },
        };
    }

    /**
     * Log code usage at signup time
     */
    async logCodeUsage(
        request: LogCodeUsageRequest,
        clerkUserId: string
    ): Promise<RecruiterCodeLogEntry> {
        const accessContext = await this.accessResolver.resolve(clerkUserId);

        if (!accessContext.identityUserId) {
            throw new Error('User must be authenticated');
        }

        // Look up the code
        const recruiterCode = await this.repository.findByCode(request.code);
        if (!recruiterCode) {
            throw new Error('Referral code not found');
        }

        if (recruiterCode.status !== 'active') {
            throw new Error('Referral code is no longer active');
        }

        // Check if already logged for this user
        const existingLog = await this.repository.findLogByUserId(accessContext.identityUserId);
        if (existingLog) {
            // Already logged, return existing
            return existingLog;
        }

        const logEntry = await this.repository.logUsage(
            recruiterCode.id,
            recruiterCode.recruiter_id,
            accessContext.identityUserId,
            request.signup_type,
            request.ip_address,
            request.user_agent
        );

        await this.eventPublisher?.publish('recruiter_code.used', {
            code_id: recruiterCode.id,
            recruiter_id: recruiterCode.recruiter_id,
            user_id: accessContext.identityUserId,
            code: recruiterCode.code,
        });

        return logEntry;
    }

    /**
     * Get usage log for a recruiter's codes
     */
    async getUsageLog(
        clerkUserId: string,
        params: StandardListParams & { recruiter_code_id?: string }
    ): Promise<StandardListResponse<RecruiterCodeLogEntry>> {
        return await this.repository.getUsageLog(clerkUserId, params);
    }

    /**
     * Update signup type in log entry (called during onboarding)
     */
    async updateLogSignupType(
        userId: string,
        signupType: string
    ): Promise<void> {
        await this.repository.updateLogSignupType(userId, signupType);
    }

    /**
     * Get usage count for a specific code
     */
    async getUsageCount(codeId: string): Promise<number> {
        return await this.repository.getUsageCount(codeId);
    }
}
