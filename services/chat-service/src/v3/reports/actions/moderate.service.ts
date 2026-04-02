/**
 * Moderate Action Service
 *
 * Admin-only. Takes a moderation action on a report: updates the report
 * status and creates an audit record.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { NotFoundError, ForbiddenError, BadRequestError } from '@splits-network/shared-fastify';
import { ModerateActionRepository, ChatModerationAudit } from './moderate.repository.js';
import { ChatReport } from '../types.js';
import { IEventPublisher } from '../../../v2/shared/events.js';

export interface ModerateInput {
  action: ChatModerationAudit['action'];
  status?: ChatReport['status'];
  details?: Record<string, any> | null;
}

const VALID_ACTIONS: ChatModerationAudit['action'][] = ['warn', 'mute_user', 'suspend_messaging', 'ban_user'];
const VALID_STATUSES: ChatReport['status'][] = ['new', 'in_review', 'resolved', 'dismissed'];

export class ModerateActionService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: ModerateActionRepository,
    supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher,
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async moderate(
    reportId: string,
    input: ModerateInput,
    clerkUserId: string,
  ): Promise<{ report: ChatReport; audit: ChatModerationAudit }> {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.identityUserId || !context.isPlatformAdmin) {
      throw new ForbiddenError('Admin privileges required');
    }

    if (!VALID_ACTIONS.includes(input.action)) {
      throw new BadRequestError(`Invalid action: ${input.action}`);
    }

    const status = input.status ?? 'resolved';
    if (!VALID_STATUSES.includes(status)) {
      throw new BadRequestError(`Invalid status: ${status}`);
    }

    const report = await this.repository.findReportById(reportId);
    if (!report) throw new NotFoundError('Report', reportId);

    const audit = await this.repository.createModerationAudit({
      actor_user_id: context.identityUserId,
      target_user_id: report.reported_user_id,
      action: input.action,
      details: input.details ?? null,
    });

    const updatedReport = await this.repository.updateReportStatus(reportId, status);

    await this.eventPublisher?.publish('report.moderated', {
      report_id: reportId,
      action: input.action,
      new_status: status,
      actor_user_id: context.identityUserId,
      target_user_id: report.reported_user_id,
    });

    return { report: updatedReport, audit };
  }
}
