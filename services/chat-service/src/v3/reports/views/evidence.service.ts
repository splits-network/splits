/**
 * Evidence View Service
 *
 * Admin-only. Fetches a report and its associated evidence messages.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { EvidenceViewRepository, ReportWithEvidence } from './evidence.repository';

export class EvidenceViewService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: EvidenceViewRepository,
    supabase: SupabaseClient,
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getEvidence(reportId: string, clerkUserId: string): Promise<ReportWithEvidence> {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.identityUserId || !context.isPlatformAdmin) {
      throw new ForbiddenError('Admin privileges required');
    }

    const report = await this.repository.findReportById(reportId);
    if (!report) throw new NotFoundError('Report', reportId);

    let messageIds: string[] = [];
    if (report.evidence_pointer) {
      try {
        const parsed = JSON.parse(report.evidence_pointer);
        if (Array.isArray(parsed?.message_ids)) {
          messageIds = parsed.message_ids.filter((id: any) => typeof id === 'string');
        }
      } catch {
        messageIds = [];
      }
    }

    const messages = await this.repository.findMessagesByIds(messageIds);

    return { report, messages };
  }
}
