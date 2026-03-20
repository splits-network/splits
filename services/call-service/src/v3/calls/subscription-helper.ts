/**
 * Subscription Helper — tier lookup for call feature gating
 *
 * Extracted from CRUD repository to keep it pure.
 */

import { SupabaseClient } from '@supabase/supabase-js';

export async function getCreatorTier(
  supabase: SupabaseClient,
  userId: string
): Promise<'starter' | 'pro' | 'partner'> {
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan:plans(tier)')
    .eq('user_id', userId)
    .in('status', ['active', 'trialing'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return (sub?.plan as any)?.tier || 'starter';
}
