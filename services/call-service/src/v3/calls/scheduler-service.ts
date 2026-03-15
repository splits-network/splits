/**
 * Call Scheduler Service — V3
 * Processes reminders, instant call timeouts, and no-shows on an interval.
 */

import { IEventPublisher } from '../../v2/shared/events';
import { SchedulerRepository } from './scheduler-repository';

interface Logger {
  info(msg: string, ...args: unknown[]): void;
  error(msg: string, ...args: unknown[]): void;
}

export class CallSchedulerService {
  private intervalHandle: ReturnType<typeof setInterval> | null = null;
  private running = false;

  constructor(
    private repository: SchedulerRepository,
    private eventPublisher: IEventPublisher,
    private logger: Logger,
    private intervalMs: number = 60_000,
  ) {}

  start(): void {
    if (this.intervalHandle) return;
    this.logger.info(`Call scheduler starting (interval: ${this.intervalMs}ms)`);
    this.intervalHandle = setInterval(() => this.tick(), this.intervalMs);
    this.tick();
  }

  stop(): void {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
      this.logger.info('Call scheduler stopped');
    }
  }

  private async tick(): Promise<void> {
    if (this.running) return;
    this.running = true;
    try {
      await Promise.all([
        this.processReminders(),
        this.processInstantCallTimeouts(),
        this.processNoShows(),
      ]);
    } catch (error) {
      this.logger.error('Scheduler tick failed', error);
    } finally {
      this.running = false;
    }
  }

  async processReminders(): Promise<void> {
    const types: Array<'24h' | '1h' | '5min'> = ['24h', '1h', '5min'];
    for (const type of types) {
      await this.processReminderType(type);
    }
  }

  async processInstantCallTimeouts(): Promise<void> {
    try {
      const callIds = await this.repository.getTimedOutInstantCalls();
      for (const callId of callIds) {
        try {
          await this.repository.markStatus(callId, 'missed');
          await this.eventPublisher.publish('call.missed', {
            call_id: callId,
            reason: 'instant_call_timeout',
            timeout_minutes: 5,
          }, 'call-service');
          this.logger.info(`Marked instant call ${callId} as missed (5min timeout)`);
        } catch (error) {
          this.logger.error(`Failed to mark instant call ${callId} as missed`, error);
        }
      }
    } catch (error) {
      this.logger.error('Failed to process instant call timeouts', error);
    }
  }

  async processNoShows(): Promise<void> {
    try {
      const callIds = await this.repository.getNoShowScheduledCalls();
      for (const callId of callIds) {
        try {
          await this.repository.markStatus(callId, 'no_show');
          await this.eventPublisher.publish('call.no_show', {
            call_id: callId,
            reason: 'scheduled_call_no_show',
            grace_period_minutes: 15,
          }, 'call-service');
          this.logger.info(`Marked scheduled call ${callId} as no_show (15min grace)`);
        } catch (error) {
          this.logger.error(`Failed to mark scheduled call ${callId} as no_show`, error);
        }
      }
    } catch (error) {
      this.logger.error('Failed to process no-show calls', error);
    }
  }

  // ── Private ───────────────────────────────────────────────────────────

  private async processReminderType(type: '24h' | '1h' | '5min'): Promise<void> {
    try {
      const calls = await this.repository.getCallsNeedingReminder(type);
      for (const call of calls) {
        try {
          const event = type === '5min' ? 'call.starting_soon' : 'call.reminder';
          const payload: Record<string, any> = {
            call_id: call.id,
            call_type: call.call_type,
            title: call.title,
            scheduled_at: call.scheduled_at,
            participants: call.participants,
          };
          if (type !== '5min') payload.reminder_type = type;

          await this.eventPublisher.publish(event, payload, 'call-service');
          await this.repository.markReminderSent(call.id, type);
          this.logger.info(`Sent ${type} reminder for call ${call.id}`);
        } catch (error) {
          this.logger.error(`Failed to send ${type} reminder for call ${call.id}`, error);
        }
      }
    } catch (error) {
      this.logger.error(`Failed to query ${type} reminders`, error);
    }
  }
}
