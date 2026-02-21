/**
 * V2 Webhooks Repository - Identity Service
 * Data access layer for webhook operations
 */

import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { User } from '@splits-network/shared-types';

export class WebhookRepositoryV2 {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey, {
            db: { schema: 'public' }
        });
    }

    /**
     * Find user by Clerk user ID
     */
    async findUserByClerkId(clerkUserId: string): Promise<User | null> {
        const { data, error } = await this.supabase
            .from('users')
            .select('*')
            .eq('clerk_user_id', clerkUserId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw error;
        }
        return data;
    }

    /**
     * Create new user
     */
    async createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
        const { data, error } = await this.supabase
            .from('users')
            .insert(userData)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Update existing user
     */
    async updateUser(id: string, updates: Partial<User>): Promise<User> {
        const { data, error } = await this.supabase
            .from('users')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Delete user by Clerk user ID
     */
    async deleteUser(clerkUserId: string): Promise<void> {
        const { error } = await this.supabase
            .from('users')
            .delete()
            .eq('clerk_user_id', clerkUserId);

        if (error) throw error;
    }

    /**
     * Find candidate by user_id
     */
    async findCandidateByUserId(userId: string): Promise<{ id: string } | null> {
        const { data, error } = await this.supabase
            .from('candidates')
            .select('id')
            .eq('user_id', userId)
            .maybeSingle();

        if (error) throw error;
        return data;
    }

    /**
     * Find candidate by email (for claiming recruiter-created candidates)
     */
    async findCandidateByEmail(email: string): Promise<{ id: string; user_id: string | null } | null> {
        const { data, error } = await this.supabase
            .from('candidates')
            .select('id, user_id')
            .eq('email', email)
            .maybeSingle();

        if (error) throw error;
        return data;
    }

    /**
     * Claim a candidate by updating its user_id.
     * Used when a recruiter-created candidate (user_id IS NULL) signs up.
     */
    async claimCandidateForUser(candidateId: string, userId: string): Promise<void> {
        const { error } = await this.supabase
            .from('candidates')
            .update({ user_id: userId, updated_at: new Date().toISOString() })
            .eq('id', candidateId);

        if (error) throw error;
    }

    /**
     * Create a candidate record linked to a user
     */
    async createCandidate(userId: string, email: string, fullName: string): Promise<{ id: string }> {
        const { data, error } = await this.supabase
            .from('candidates')
            .insert({
                user_id: userId,
                email,
                full_name: fullName,
                verification_status: 'unverified',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .select('id')
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Create user_role entry linking user to candidate
     */
    async createCandidateUserRole(userId: string, candidateId: string): Promise<void> {
        const { error } = await this.supabase
            .from('user_roles')
            .insert({
                user_id: userId,
                role_name: 'candidate',
                role_entity_id: candidateId,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            });

        // Ignore duplicate (role already exists)
        if (error && !error.message?.includes('duplicate') && error.code !== '23505') {
            throw error;
        }
    }
}