/**
 * Termination Service — Handle recruiter-candidate relationship termination
 */

import { IEventPublisher } from '../../../v2/shared/events';
import { ApplicationRepository } from '../repository';

export class TerminationService {
  constructor(
    private repository: ApplicationRepository,
    private eventPublisher?: IEventPublisher
  ) {}

  /**
   * Find active applications affected by a recruiter-candidate termination.
   */
  async getAffectedByTermination(recruiterId: string, candidateId: string) {
    return this.repository.findAffectedByTermination(recruiterId, candidateId);
  }

  /**
   * Process per-application decisions when terminating a relationship.
   * 'keep' = unassign recruiter, 'withdraw' = set stage to withdrawn.
   */
  async processDecisions(
    decisions: { application_id: string; action: 'keep' | 'withdraw' }[],
    processedBy?: string
  ) {
    await this.repository.processTerminationDecisions(decisions);

    // Publish events for each decision so downstream consumers can react
    for (const decision of decisions) {
      if (decision.action === 'withdraw') {
        await this.eventPublisher?.publish('application.withdrawn', {
          application_id: decision.application_id,
          reason: 'relationship_terminated',
          processed_by: processedBy || 'system',
        }, 'ats-service');
      }
    }

    await this.eventPublisher?.publish('application.termination_processed', {
      decision_count: decisions.length,
      withdrawn_count: decisions.filter(d => d.action === 'withdraw').length,
      kept_count: decisions.filter(d => d.action === 'keep').length,
      processed_by: processedBy || 'system',
    }, 'ats-service');
  }
}
