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
}