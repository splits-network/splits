/**
 * Link Session Action Service
 *
 * Cross-table operation: resolves user identity via access context,
 * fetches user details from users table, updates support_conversations.
 * Properly separated from core CRUD repository.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { resolveAccessContext } from '@splits-network/shared-access-context';

export class LinkSessionService {
  constructor(private supabase: SupabaseClient) {}

  async linkSession(sessionId: string, clerkUserId: string): Promise<void> {
    const ctx = await resolveAccessContext(this.supabase, clerkUserId);
    const userId = ctx.identityUserId || null;

    const updates: Record<string, any> = {
      clerk_user_id: clerkUserId,
      user_id: userId,
    };

    if (userId) {
      const { data: user } = await this.supabase
        .from('users')
        .select('name, email')
        .eq('id', userId)
        .single();

      if (user) {
        if (user.name) updates.visitor_name = user.name;
        if (user.email) updates.visitor_email = user.email;
      }
    }

    await this.supabase
      .from('support_conversations')
      .update(updates)
      .eq('visitor_session_id', sessionId)
      .is('clerk_user_id', null);
  }
}
