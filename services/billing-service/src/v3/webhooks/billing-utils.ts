/**
 * Billing Webhook Utilities - Shared helpers for billing webhook handlers
 *
 * Contains revertJobsToDraft which is used by payment method detach and customer delete handlers.
 * Publishes: jobs.billing_reverted_to_draft
 */

import { WebhookHandlerDeps } from './types.js';

export async function revertJobsToDraft(
  deps: WebhookHandlerDeps,
  params: { companyId?: string; firmId?: string }
): Promise<void> {
  const { companyId, firmId } = params;
  const now = new Date().toISOString();
  const activeStatuses = ['pending', 'active', 'paused'];

  try {
    let query = deps.supabase
      .from('jobs')
      .update({ status: 'draft', updated_at: now })
      .in('status', activeStatuses);

    if (companyId) {
      query = query.eq('company_id', companyId);
    } else if (firmId) {
      query = query.eq('source_firm_id', firmId);
    } else {
      return;
    }

    const { data, error } = await query.select('id');

    if (error) {
      deps.logger.error({ err: error, companyId, firmId }, 'Failed to revert jobs to draft after billing invalidation');
      return;
    }

    const revertedCount = data?.length || 0;
    if (revertedCount > 0) {
      const entityType = companyId ? 'company' : 'firm';
      const entityId = companyId || firmId;
      deps.logger.info(
        { entityType, entityId, revertedCount, jobIds: data?.map(j => j.id) },
        `Reverted ${revertedCount} jobs to draft: billing invalidated`
      );

      await deps.eventPublisher.publish('jobs.billing_reverted_to_draft', {
        entity_type: entityType,
        entity_id: entityId,
        reverted_count: revertedCount,
        job_ids: data?.map(j => j.id) || [],
      });
    }
  } catch (err) {
    deps.logger.error({ err, companyId, firmId }, 'Failed to revert jobs to draft');
  }
}
