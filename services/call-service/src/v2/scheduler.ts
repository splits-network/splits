import { SchedulerRepository, CallWithParticipantsForReminder } from './scheduler-repository';
import { IEventPublisher } from './shared/events';

interface Logger {
    info(msg: string, ...args: unknown[]): void;
    error(msg: string, ...args: unknown[]): void;
    warn(msg: string, ...args: unknown[]): void;
}

export class CallScheduler {
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

        // Run immediately on start
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
        if (this.running) return; // Skip if previous tick is still processing
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

    private async processReminders(): Promise<void> {
        const reminderTypes: Array<'24h' | '1h' | '5min'> = ['24h', '1h', '5min'];

        for (const reminderType of reminderTypes) {
            try {
                const calls = await this.repository.getCallsNeedingReminder(reminderType);

                for (const call of calls) {
                    try {
                        if (reminderType === '5min') {
                            await this.eventPublisher.publish('call.starting_soon', {
                                call_id: call.id,
                                call_type: call.call_type,
                                title: call.title,
                                scheduled_at: call.scheduled_at,
                                participants: this.mapParticipants(call),
                            });
                        } else {
                            await this.eventPublisher.publish('call.reminder', {
                                call_id: call.id,
                                reminder_type: reminderType,
                                call_type: call.call_type,
                                title: call.title,
                                scheduled_at: call.scheduled_at,
                                participants: this.mapParticipants(call),
                            });
                        }

                        await this.repository.markReminderSent(call.id, reminderType);
                        this.logger.info(
                            `Sent ${reminderType} reminder for call ${call.id}`,
                        );
                    } catch (error) {
                        this.logger.error(
                            `Failed to send ${reminderType} reminder for call ${call.id}`,
                            error,
                        );
                    }
                }
            } catch (error) {
                this.logger.error(
                    `Failed to query ${reminderType} reminders`,
                    error,
                );
            }
        }
    }

    private async processInstantCallTimeouts(): Promise<void> {
        try {
            const callIds = await this.repository.getTimedOutInstantCalls();

            for (const callId of callIds) {
                try {
                    await this.repository.markCallMissed(callId);
                    await this.eventPublisher.publish('call.missed', {
                        call_id: callId,
                        reason: 'instant_call_timeout',
                        timeout_minutes: 5,
                    });
                    this.logger.info(`Marked instant call ${callId} as missed (5min timeout)`);
                } catch (error) {
                    this.logger.error(
                        `Failed to mark instant call ${callId} as missed`,
                        error,
                    );
                }
            }
        } catch (error) {
            this.logger.error('Failed to process instant call timeouts', error);
        }
    }

    private async processNoShows(): Promise<void> {
        try {
            const callIds = await this.repository.getNoShowScheduledCalls();

            for (const callId of callIds) {
                try {
                    await this.repository.markCallNoShow(callId);
                    await this.eventPublisher.publish('call.no_show', {
                        call_id: callId,
                        reason: 'scheduled_call_no_show',
                        grace_period_minutes: 15,
                    });
                    this.logger.info(`Marked scheduled call ${callId} as no_show (15min grace)`);
                } catch (error) {
                    this.logger.error(
                        `Failed to mark scheduled call ${callId} as no_show`,
                        error,
                    );
                }
            }
        } catch (error) {
            this.logger.error('Failed to process no-show calls', error);
        }
    }

    private mapParticipants(call: CallWithParticipantsForReminder) {
        return call.participants.map((p) => ({
            user_id: p.user_id,
            role: p.role,
            email: p.user.email,
            name: p.user.name,
        }));
    }
}
