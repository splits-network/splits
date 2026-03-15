/**
 * V3 Rollup Scheduler
 *
 * Manages interval-based background jobs for metric aggregation:
 *   - Hourly rollup   (events -> metrics_hourly)
 *   - Daily rollup    (metrics_hourly -> metrics_daily)
 *   - Monthly rollup  (metrics_daily -> metrics_monthly)
 *   - Marketplace health computation
 *   - Activity snapshot persistence
 *
 * Uses setInterval scheduling (same cadence as V2 cron jobs).
 * All intervals are cleared on stop() for graceful shutdown.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import Redis from 'ioredis';
import { createLogger } from '@splits-network/shared-logging';
import { CacheManager } from '../../cache/cache-manager';
import { rollupHourlyMetrics } from '../../jobs/rollup-hourly';
import { rollupDailyMetrics } from '../../jobs/rollup-daily';
import { rollupMonthlyMetrics } from '../../jobs/rollup-monthly';
import { computeMarketplaceHealth } from '../../jobs/marketplace-health';
import { rollupActivitySnapshot } from '../../jobs/rollup-activity';

const logger = createLogger('v3:RollupScheduler');

/** Interval durations (ms) */
const ONE_HOUR = 60 * 60 * 1000;
const ONE_DAY = 24 * ONE_HOUR;
const FIVE_MINUTES = 5 * 60 * 1000;

export class RollupScheduler {
  private intervals: ReturnType<typeof setInterval>[] = [];
  private running = false;

  constructor(
    private supabase: SupabaseClient,
    private cache: CacheManager,
    private redis?: Redis,
  ) {}

  /**
   * Start all rollup jobs. Safe to call multiple times (no-ops if already running).
   */
  start(): void {
    if (this.running) return;
    this.running = true;

    logger.info('Starting V3 rollup scheduler...');

    // Hourly rollup — runs every hour
    this.schedule('hourly-rollup', ONE_HOUR, async () => {
      await rollupHourlyMetrics(this.supabase);
    });

    // Daily rollup — runs every 24 hours
    this.schedule('daily-rollup', ONE_DAY, async () => {
      await rollupDailyMetrics(this.supabase);
      await this.cache.invalidatePattern('analytics:*');
    });

    // Monthly rollup — runs every 24 hours, the job itself
    // only processes when a new month boundary is crossed
    this.schedule('monthly-rollup', ONE_DAY, async () => {
      const today = new Date();
      if (today.getDate() === 1) {
        await rollupMonthlyMetrics(this.supabase);
      }
    });

    // Marketplace health — runs every 24 hours
    this.schedule('marketplace-health', ONE_DAY, async () => {
      await computeMarketplaceHealth(this.supabase);
    });

    // Activity snapshot — runs every 5 minutes (only if Redis is available)
    if (this.redis) {
      this.schedule('activity-snapshot', FIVE_MINUTES, async () => {
        await rollupActivitySnapshot(this.redis!, this.supabase);
      });
    }

    logger.info('V3 rollup scheduler started');
  }

  /**
   * Stop all scheduled jobs. Safe to call multiple times.
   */
  stop(): void {
    if (!this.running) return;

    for (const interval of this.intervals) {
      clearInterval(interval);
    }
    this.intervals = [];
    this.running = false;
    logger.info('V3 rollup scheduler stopped');
  }

  /**
   * Run a single rollup on demand (useful for tests or admin triggers).
   */
  async runOnce(jobName: string): Promise<void> {
    logger.info({ jobName }, 'Running rollup on demand');

    switch (jobName) {
      case 'hourly-rollup':
        await rollupHourlyMetrics(this.supabase);
        break;
      case 'daily-rollup':
        await rollupDailyMetrics(this.supabase);
        await this.cache.invalidatePattern('analytics:*');
        break;
      case 'monthly-rollup':
        await rollupMonthlyMetrics(this.supabase);
        break;
      case 'marketplace-health':
        await computeMarketplaceHealth(this.supabase);
        break;
      case 'activity-snapshot':
        if (this.redis) await rollupActivitySnapshot(this.redis, this.supabase);
        break;
      default:
        logger.warn({ jobName }, 'Unknown rollup job name');
    }
  }

  private schedule(name: string, intervalMs: number, fn: () => Promise<void>): void {
    const wrapped = async () => {
      try {
        await fn();
        logger.info({ job: name }, 'Rollup job completed');
      } catch (error) {
        logger.error({ error, job: name }, 'Rollup job failed');
      }
    };

    const id = setInterval(wrapped, intervalMs);
    this.intervals.push(id);
    logger.info({ job: name, intervalMs }, 'Scheduled rollup job');
  }
}
