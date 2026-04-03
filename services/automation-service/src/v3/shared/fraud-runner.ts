/**
 * V3 Fraud Detection Runner
 *
 * Runs fraud analysis against domain events, persists detected signals,
 * and publishes fraud_signal.created events.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { Logger } from '@splits-network/shared-logging';
import { DomainEvent } from '@splits-network/shared-types';
import { IEventPublisher } from '../../v2/shared/events.js';
import { FraudSignalRepository } from '../fraud-signals/repository.js';
import { runFraudAnalysis } from '../fraud-signals/analyzers/index.js';

export class FraudRunner {
  private fraudRepository: FraudSignalRepository;

  constructor(
    private supabase: SupabaseClient,
    private eventPublisher: IEventPublisher | undefined,
    private logger: Logger,
  ) {
    this.fraudRepository = new FraudSignalRepository(supabase);
  }

  async runFraudDetection(event: DomainEvent): Promise<void> {
    try {
      const signals = await runFraudAnalysis(
        this.supabase,
        event.event_type,
        (event.payload as Record<string, any>) || {},
      );

      for (const signal of signals) {
        try {
          const created = await this.fraudRepository.create(signal);
          this.logger.info(
            { signalId: created.id, signalType: signal.signal_type, severity: signal.severity },
            'Fraud signal detected and created',
          );
          await this.eventPublisher?.publish(
            'fraud_signal.created',
            {
              fraud_signal_id: created.id,
              signal_type: created.signal_type,
              severity: created.severity,
              confidence_score: created.confidence_score,
            },
            'automation-service',
          );
        } catch (err) {
          this.logger.error({ err, signalType: signal.signal_type }, 'Failed to create fraud signal');
        }
      }
    } catch (err) {
      this.logger.error({ err, eventType: event.event_type }, 'Failed to run fraud detection');
    }
  }
}
