/**
 * Termination Service — Handle recruiter-candidate relationship termination
 */

import { ApplicationRepository } from '../repository';

export class TerminationService {
  constructor(private repository: ApplicationRepository) {}

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
    decisions: { application_id: string; action: 'keep' | 'withdraw' }[]
  ) {
    await this.repository.processTerminationDecisions(decisions);
  }
}
