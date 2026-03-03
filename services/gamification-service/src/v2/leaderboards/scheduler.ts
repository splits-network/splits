import { LeaderboardService } from './service';
import { Logger } from '@splits-network/shared-logging';
import { BadgeEntityType } from '../badges/definitions/types';
import { LeaderboardPeriod } from './types';

interface LeaderboardJob {
    entityType: BadgeEntityType;
    period: LeaderboardPeriod;
    metric: string;
}

const LEADERBOARD_JOBS: LeaderboardJob[] = [
    { entityType: 'recruiter', period: 'weekly', metric: 'total_xp' },
    { entityType: 'recruiter', period: 'monthly', metric: 'total_xp' },
    { entityType: 'recruiter', period: 'all_time', metric: 'total_xp' },
    { entityType: 'recruiter', period: 'monthly', metric: 'placements' },
    { entityType: 'recruiter', period: 'all_time', metric: 'placements' },
    { entityType: 'recruiter', period: 'all_time', metric: 'hire_rate' },
    { entityType: 'candidate', period: 'monthly', metric: 'total_xp' },
    { entityType: 'candidate', period: 'all_time', metric: 'total_xp' },
    { entityType: 'firm', period: 'monthly', metric: 'total_xp' },
    { entityType: 'firm', period: 'all_time', metric: 'total_xp' },
    { entityType: 'company', period: 'monthly', metric: 'total_xp' },
    { entityType: 'company', period: 'all_time', metric: 'total_xp' },
];

export class LeaderboardScheduler {
    private intervalId: NodeJS.Timeout | null = null;

    constructor(
        private leaderboardService: LeaderboardService,
        private logger: Logger,
        private intervalMs = 60 * 60 * 1000 // 1 hour
    ) {}

    start(): void {
        this.logger.info({ intervalMs: this.intervalMs }, 'Leaderboard scheduler starting');
        this.runAll();
        this.intervalId = setInterval(() => this.runAll(), this.intervalMs);
    }

    stop(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            this.logger.info('Leaderboard scheduler stopped');
        }
    }

    private async runAll(): Promise<void> {
        this.logger.info('Running leaderboard computations');

        for (const job of LEADERBOARD_JOBS) {
            try {
                await this.leaderboardService.computeLeaderboard(
                    job.entityType,
                    job.period,
                    job.metric
                );
            } catch (error) {
                this.logger.error({ error, job }, 'Failed to compute leaderboard');
            }
        }

        this.logger.info('Leaderboard computations complete');
    }
}
