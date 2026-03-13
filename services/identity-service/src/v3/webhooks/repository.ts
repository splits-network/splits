/**
 * Webhooks V3 Repository — Pure data layer
 *
 * Handles user sync, candidate creation/claiming for webhook events.
 */

import { SupabaseClient } from '@supabase/supabase-js';

export class WebhookRepository {
  constructor(private supabase: SupabaseClient) {}

  async findUserByClerkId(clerkUserId: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async createUser(userData: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase
      .from('users')
      .insert(userData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateUser(id: string, updates: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteUser(clerkUserId: string): Promise<void> {
    const { error } = await this.supabase
      .from('users')
      .delete()
      .eq('clerk_user_id', clerkUserId);

    if (error) throw error;
  }

  async findCandidateByUserId(userId: string): Promise<{ id: string } | null> {
    const { data, error } = await this.supabase
      .from('candidates')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async findCandidateByEmail(email: string): Promise<{ id: string; user_id: string | null } | null> {
    const { data, error } = await this.supabase
      .from('candidates')
      .select('id, user_id')
      .eq('email', email)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async claimCandidateForUser(candidateId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('candidates')
      .update({ user_id: userId, updated_at: new Date().toISOString() })
      .eq('id', candidateId);

    if (error) throw error;
  }

  async createCandidate(userId: string, email: string, fullName: string): Promise<{ id: string }> {
    const now = new Date().toISOString();
    const { data, error } = await this.supabase
      .from('candidates')
      .insert({
        user_id: userId,
        email,
        full_name: fullName,
        verification_status: 'unverified',
        created_at: now,
        updated_at: now,
      })
      .select('id')
      .single();

    if (error) throw error;
    return data;
  }

  async createCandidateUserRole(userId: string, candidateId: string): Promise<void> {
    const now = new Date().toISOString();
    const { error } = await this.supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role_name: 'candidate',
        role_entity_id: candidateId,
        created_at: now,
        updated_at: now,
      });

    if (error && !error.message?.includes('duplicate') && error.code !== '23505') {
      throw error;
    }
  }
}
