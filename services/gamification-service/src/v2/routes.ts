import { FastifyInstance } from 'fastify';
import { IEventPublisher } from './shared/events';
import { Logger } from '@splits-network/shared-logging';
import { BadgeDefinitionRepository } from './badges/definitions/repository';
import { BadgeDefinitionService } from './badges/definitions/service';
import { registerBadgeDefinitionRoutes } from './badges/definitions/routes';
import { BadgeAwardRepository } from './badges/awards/repository';
import { BadgeAwardService } from './badges/awards/service';
import { registerBadgeAwardRoutes } from './badges/awards/routes';
import { BadgeProgressRepository } from './badges/progress/repository';
import { BadgeProgressService } from './badges/progress/service';
import { registerBadgeProgressRoutes } from './badges/progress/routes';
import { XpRepository } from './xp/repository';
import { XpService } from './xp/service';
import { registerXpRoutes } from './xp/routes';
import { StreakRepository } from './streaks/repository';
import { StreakService } from './streaks/service';
import { registerStreakRoutes } from './streaks/routes';
import { LeaderboardRepository } from './leaderboards/repository';
import { LeaderboardService } from './leaderboards/service';
import { registerLeaderboardRoutes } from './leaderboards/routes';
import { LeaderboardScheduler } from './leaderboards/scheduler';
import { GamificationConsumer } from './consumer';

interface V2Config {
    supabaseUrl: string;
    supabaseKey: string;
    eventPublisher: IEventPublisher;
    rabbitMqUrl: string;
    logger: Logger;
}

export interface V2Services {
    consumer: GamificationConsumer;
    leaderboardScheduler: LeaderboardScheduler;
}

export async function registerV2Routes(app: FastifyInstance, config: V2Config): Promise<V2Services> {
    // Repositories
    const definitionRepo = new BadgeDefinitionRepository(config.supabaseUrl, config.supabaseKey);
    const awardRepo = new BadgeAwardRepository(config.supabaseUrl, config.supabaseKey);
    const progressRepo = new BadgeProgressRepository(config.supabaseUrl, config.supabaseKey);
    const xpRepo = new XpRepository(config.supabaseUrl, config.supabaseKey);
    const streakRepo = new StreakRepository(config.supabaseUrl, config.supabaseKey);
    const leaderboardRepo = new LeaderboardRepository(config.supabaseUrl, config.supabaseKey);

    // Services
    const definitionService = new BadgeDefinitionService(definitionRepo);
    const awardService = new BadgeAwardService(awardRepo, config.eventPublisher);
    const progressService = new BadgeProgressService(progressRepo);
    const xpService = new XpService(xpRepo, config.eventPublisher);
    const streakService = new StreakService(streakRepo, config.eventPublisher);
    const leaderboardService = new LeaderboardService(
        leaderboardRepo, config.supabaseUrl, config.supabaseKey, config.logger
    );

    // Routes
    registerBadgeDefinitionRoutes(app, { definitionService });
    registerBadgeAwardRoutes(app, { awardService });
    registerBadgeProgressRoutes(app, { progressService });
    registerXpRoutes(app, { xpService });
    registerStreakRoutes(app, { streakService });
    registerLeaderboardRoutes(app, { leaderboardService });

    // Consumer (event-driven badge/xp processing)
    const consumer = new GamificationConsumer(
        config.rabbitMqUrl,
        config.supabaseUrl,
        config.supabaseKey,
        definitionService,
        awardService,
        progressService,
        xpService,
        streakService,
        config.logger
    );

    // Leaderboard scheduler
    const leaderboardScheduler = new LeaderboardScheduler(leaderboardService, config.logger);

    return { consumer, leaderboardScheduler };
}
