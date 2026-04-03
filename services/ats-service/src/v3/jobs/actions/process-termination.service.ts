/**
 * Process Termination Action Service
 * Validates decisions and publishes events
 */

import { BadRequestError } from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../../v2/shared/events.js';
import { ProcessTerminationRepository, TerminationDecision } from './process-termination.repository.js';

export class ProcessTerminationService {
  constructor(
    private repository: ProcessTerminationRepository,
    private eventPublisher?: IEventPublisher
  ) {}

  async process(
    recruiterId: string,
    decisions: TerminationDecision[]
  ) {
    if (!recruiterId) {
      throw new BadRequestError('recruiter_id is required');
    }
    if (!Array.isArray(decisions) || decisions.length === 0) {
      throw new BadRequestError('decisions array is required and must not be empty');
    }

    const validActions = ['keep', 'pause', 'close'];
    for (const d of decisions) {
      if (!d.job_id) throw new BadRequestError('Each decision must have a job_id');
      if (!validActions.includes(d.action)) {
        throw new BadRequestError(`Invalid action "${d.action}". Must be keep, pause, or close`);
      }
    }

    for (const decision of decisions) {
      await this.repository.processDecision(decision, recruiterId);

      await this.eventPublisher?.publish('job.termination_processed', {
        jobId: decision.job_id,
        recruiterId,
        action: decision.action,
      }, 'ats-service');
    }
  }
}
