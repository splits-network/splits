/**
 * Charts V3 Repository
 *
 * Delegates to V2 ChartRepository + ChartServiceV2 for data.
 * Charts use analytics schema RPCs and real-time fallback queries.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { ChartType, ChartFilters } from './types.js';

export class ChartV3Repository {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Call analytics.get_chart_metrics RPC for pre-aggregated data.
   * Falls back to null if RPC not available.
   */
  async getChartMetrics(
    chartType: string,
    months: number,
    filters: Record<string, any>,
  ): Promise<any[] | null> {
    const { data, error } = await this.supabase.rpc('get_chart_metrics', {
      p_chart_type: chartType,
      p_months: months,
      p_filters: filters,
    });

    if (error) return null;
    return data;
  }
}
