/**
 * Analyze Action Service
 *
 * Delegates to the V2 AIReviewServiceV2 for the actual AI analysis.
 * This action enriches minimal input, calls OpenAI, saves results,
 * and publishes domain events.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { AIReviewRepository } from '../../../v2/reviews/repository.js';
import { AIReviewServiceV2 } from '../../../v2/reviews/service.js';
import { IEventPublisher } from '../../../v2/shared/events.js';
import { createLogger } from '@splits-network/shared-logging';

export class AnalyzeService {
  private aiReviewService: AIReviewServiceV2;
  private accessResolver: AccessContextResolver;

  constructor(
    private supabase: SupabaseClient,
    eventPublisher?: IEventPublisher,
  ) {
    const logger = createLogger({ serviceName: 'ai-service', level: 'info' });
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
    const repository = new AIReviewRepository(supabaseUrl, supabaseKey);
    this.aiReviewService = new AIReviewServiceV2(repository, eventPublisher, logger);
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async analyze(input: Record<string, any>, clerkUserId?: string) {
    if (clerkUserId) {
      await this.accessResolver.resolve(clerkUserId);
    }

    const enrichedInput = await this.aiReviewService.enrichApplicationData(input);
    return this.aiReviewService.createReview(enrichedInput);
  }
}
