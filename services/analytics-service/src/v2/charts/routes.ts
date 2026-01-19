/**
 * Chart Routes V2
 * 
 * REST API endpoints for chart data visualization.
 * Provides Chart.js-compatible time series data.
 */

import { FastifyInstance } from 'fastify';
import { requireUserContext } from '../shared/access';
import { ChartServiceV2 } from './service';
import { ChartType, ChartFilters } from './types';

interface ChartServices {
    chartService: ChartServiceV2;
}

export async function registerChartRoutes(
    app: FastifyInstance,
    services: ChartServices
) {
    const { chartService } = services;

    /**
     * GET /v2/charts/:type - Get chart data for visualization
     */
    app.get<{
        Params: { type: ChartType };
        Querystring: {
            months?: string;
            start_date?: string;
            end_date?: string;
            recruiter_id?: string;
            company_id?: string;
            scope?: string;
        };
    }>(
        '/api/v2/charts/:type',
        {
            schema: {
                description: 'Get chart data for a specific chart type',
                tags: ['charts'],
                params: {
                    type: 'object',
                    properties: {
                        type: {
                            type: 'string',
                            enum: [
                                'recruiter-activity',
                                'application-trends',
                                'placement-trends',
                                'role-trends',
                                'candidate-trends',
                                'time-to-hire-trends',
                            ],
                        },
                    },
                    required: ['type'],
                },
                querystring: {
                    type: 'object',
                    properties: {
                        months: { type: 'number', minimum: 1, maximum: 24, default: 12 },
                        start_date: { type: 'string', format: 'date' },
                        end_date: { type: 'string', format: 'date' },
                        recruiter_id: { type: 'string', format: 'uuid' },
                        company_id: { type: 'string', format: 'uuid' },
                        scope: { type: 'string', enum: ['recruiter', 'candidate', 'company', 'platform'] },
                    },
                },
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            data: {
                                type: 'object',
                                properties: {
                                    chart_type: { type: 'string' },
                                    time_range: {
                                        type: 'object',
                                        properties: {
                                            start: { type: 'string' },
                                            end: { type: 'string' },
                                        },
                                    },
                                    data: {
                                        type: 'object',
                                        properties: {
                                            labels: {
                                                type: 'array',
                                                items: { type: 'string' },
                                            },
                                            datasets: {
                                                type: 'array',
                                                items: {
                                                    type: 'object',
                                                    properties: {
                                                        label: { type: 'string' },
                                                        data: {
                                                            type: 'array',
                                                            items: { type: 'number' }
                                                        },
                                                        backgroundColor: { type: 'string' },
                                                        borderColor: { type: 'string' },
                                                        borderWidth: { type: 'number' },
                                                        fill: { type: 'boolean' },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        async (request, reply) => {
            try {
                const { clerkUserId } = requireUserContext(request);
                const { type } = request.params;
                const query = request.query;

                // Calculate months from date range if provided, otherwise use months param
                let months = 12; // default
                if (query.start_date && query.end_date) {
                    const start = new Date(query.start_date);
                    const end = new Date(query.end_date);
                    const daysDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
                    months = Math.round(daysDiff / 30); // Convert days to approximate months
                } else if (query.months) {
                    months = parseInt(query.months, 10);
                }

                const filters: ChartFilters = {
                    months,
                    recruiter_id: query.recruiter_id,
                    company_id: query.company_id,
                    scope: query.scope as 'recruiter' | 'candidate' | 'company' | 'platform' | undefined,
                };

                const chartData = await chartService.getChartData(
                    clerkUserId,
                    type,
                    filters
                );

                return reply.send({ data: chartData });
            } catch (error: any) {
                const statusCode = error.message.includes('Invalid chart type') ? 400 : 500;
                return reply.code(statusCode as any).send({
                    error: { message: error.message || 'Failed to fetch chart data' },
                });
            }
        }
    );
}
