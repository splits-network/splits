import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { EventPublisher } from './shared/events';
import { requireUserContext, validatePaginationParams } from './shared/helpers';
import {
    CandidateMatchRepository,
    CreateMatchInput,
} from './matches/repository';
import { CandidateMatchServiceV2 } from './matches/service';
import {
    CreateFraudSignalInput,
    FraudSignalRepository,
} from './fraud-signals/repository';
import { FraudSignalServiceV2 } from './fraud-signals/service';
import {
    AutomationRuleRepository,
    CreateRuleInput,
} from './rules/repository';
import { AutomationRuleServiceV2 } from './rules/service';
import {
    CreateMetricInput,
    MarketplaceMetricsRepository,
} from './metrics/repository';
import { MarketplaceMetricsServiceV2 } from './metrics/service';
import {
    MatchFilters,
    MatchUpdate,
    FraudSignalFilters,
    FraudSignalUpdate,
    RuleFilters,
    RuleUpdate,
    MetricFilters,
    MetricUpdate,
} from './types';

interface RegisterConfig {
    supabaseUrl: string;
    supabaseKey: string;
    eventPublisher?: EventPublisher;
}

export async function registerV2Routes(app: FastifyInstance, config: RegisterConfig) {
    const matchRepository = new CandidateMatchRepository(config.supabaseUrl, config.supabaseKey);
    const matchService = new CandidateMatchServiceV2(matchRepository, config.eventPublisher);

    const fraudRepository = new FraudSignalRepository(config.supabaseUrl, config.supabaseKey);
    const fraudService = new FraudSignalServiceV2(fraudRepository, config.eventPublisher);

    const ruleRepository = new AutomationRuleRepository(config.supabaseUrl, config.supabaseKey);
    const ruleService = new AutomationRuleServiceV2(ruleRepository, config.eventPublisher);

    const metricsRepository = new MarketplaceMetricsRepository(config.supabaseUrl, config.supabaseKey);
    const metricsService = new MarketplaceMetricsServiceV2(metricsRepository, config.eventPublisher);

    // ============================================
    // MATCHES
    // ============================================

    app.get('/v2/matches', async (request, reply) => {
        try {
            requireUserContext(request);
            const query = request.query as Record<string, any>;
            const pagination = validatePaginationParams(query);
            const filters: MatchFilters = {
                candidate_id: query.candidate_id,
                job_id: query.job_id,
                status: query.status,
                min_score: query.min_score ? Number(query.min_score) : undefined,
                page: pagination.page,
                limit: pagination.limit,
            };
            const result = await matchService.listMatches(filters);
            return reply.send(result);
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message || 'Failed to fetch matches' } });
        }
    });

    app.get('/v2/matches/:id', async (request, reply) => {
        try {
            requireUserContext(request);
            const { id } = request.params as { id: string };
            const match = await matchService.getMatch(id);
            return reply.send({ data: match });
        } catch (error: any) {
            return reply.code(404).send({ error: { message: error.message || 'Match not found' } });
        }
    });

    app.post('/v2/matches', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            requireUserContext(request);
            const body = request.body as CreateMatchInput;
            if (!body?.candidate_id || !body.job_id || typeof body.match_score === 'undefined' || !body.match_reason) {
                return reply.code(400).send({
                    error: { message: 'candidate_id, job_id, match_score, and match_reason are required' },
                });
            }
            const match = await matchService.createMatch(body);
            return reply.code(201).send({ data: match });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message || 'Failed to create match' } });
        }
    });

    app.patch('/v2/matches/:id', async (request, reply) => {
        try {
            requireUserContext(request);
            const { id } = request.params as { id: string };
            const updates = request.body as MatchUpdate;
            const match = await matchService.updateMatch(id, updates);
            return reply.send({ data: match });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message || 'Failed to update match' } });
        }
    });

    app.delete('/v2/matches/:id', async (request, reply) => {
        try {
            requireUserContext(request);
            const { id } = request.params as { id: string };
            await matchService.deleteMatch(id);
            return reply.code(204).send();
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message || 'Failed to delete match' } });
        }
    });

    // ============================================
    // FRAUD SIGNALS
    // ============================================

    app.get('/v2/fraud-signals', async (request, reply) => {
        try {
            requireUserContext(request);
            const query = request.query as Record<string, any>;
            const pagination = validatePaginationParams(query);
            const filters: FraudSignalFilters = {
                entity_type: query.entity_type,
                entity_id: query.entity_id,
                severity: query.severity,
                status: query.status,
                signal_type: query.signal_type,
                page: pagination.page,
                limit: pagination.limit,
            };
            const result = await fraudService.listSignals(filters);
            return reply.send(result);
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message || 'Failed to fetch fraud signals' } });
        }
    });

    app.get('/v2/fraud-signals/:id', async (request, reply) => {
        try {
            requireUserContext(request);
            const { id } = request.params as { id: string };
            const signal = await fraudService.getSignal(id);
            return reply.send({ data: signal });
        } catch (error: any) {
            return reply.code(404).send({ error: { message: error.message || 'Fraud signal not found' } });
        }
    });

    app.post('/v2/fraud-signals', async (request, reply) => {
        try {
            requireUserContext(request);
            const body = request.body as CreateFraudSignalInput;
            if (
                !body?.event_id ||
                !body.event_type ||
                !body.entity_type ||
                !body.entity_id ||
                !body.signal_type ||
                !body.severity ||
                !body.details
            ) {
                return reply.code(400).send({
                    error: { message: 'event_id, event_type, entity info, signal_type, severity, and details are required' },
                });
            }
            const signal = await fraudService.createSignal(body);
            return reply.code(201).send({ data: signal });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message || 'Failed to create fraud signal' } });
        }
    });

    app.patch('/v2/fraud-signals/:id', async (request, reply) => {
        try {
            requireUserContext(request);
            const { id } = request.params as { id: string };
            const updates = request.body as FraudSignalUpdate;
            const signal = await fraudService.updateSignal(id, updates);
            return reply.send({ data: signal });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message || 'Failed to update fraud signal' } });
        }
    });

    app.delete('/v2/fraud-signals/:id', async (request, reply) => {
        try {
            requireUserContext(request);
            const { id } = request.params as { id: string };
            await fraudService.deleteSignal(id);
            return reply.code(204).send();
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message || 'Failed to delete fraud signal' } });
        }
    });

    // ============================================
    // AUTOMATION RULES
    // ============================================

    app.get('/v2/automation-rules', async (request, reply) => {
        try {
            requireUserContext(request);
            const query = request.query as Record<string, any>;
            const pagination = validatePaginationParams(query);
            const filters: RuleFilters = {
                trigger_type: query.trigger_type,
                status: query.status,
                page: pagination.page,
                limit: pagination.limit,
            };
            const result = await ruleService.listRules(filters);
            return reply.send(result);
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message || 'Failed to fetch automation rules' } });
        }
    });

    app.get('/v2/automation-rules/:id', async (request, reply) => {
        try {
            requireUserContext(request);
            const { id } = request.params as { id: string };
            const rule = await ruleService.getRule(id);
            return reply.send({ data: rule });
        } catch (error: any) {
            return reply.code(404).send({ error: { message: error.message || 'Automation rule not found' } });
        }
    });

    app.post('/v2/automation-rules', async (request, reply) => {
        try {
            requireUserContext(request);
            const body = request.body as CreateRuleInput;
            if (!body?.name || !body.trigger_type || !body.condition || !body.action) {
                return reply.code(400).send({
                    error: { message: 'name, trigger_type, condition, and action are required' },
                });
            }
            const rule = await ruleService.createRule(body);
            return reply.code(201).send({ data: rule });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message || 'Failed to create automation rule' } });
        }
    });

    app.patch('/v2/automation-rules/:id', async (request, reply) => {
        try {
            requireUserContext(request);
            const { id } = request.params as { id: string };
            const updates = request.body as RuleUpdate;
            const rule = await ruleService.updateRule(id, updates);
            return reply.send({ data: rule });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message || 'Failed to update automation rule' } });
        }
    });

    app.delete('/v2/automation-rules/:id', async (request, reply) => {
        try {
            requireUserContext(request);
            const { id } = request.params as { id: string };
            await ruleService.deleteRule(id);
            return reply.code(204).send();
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message || 'Failed to delete automation rule' } });
        }
    });

    // ============================================
    // MARKETPLACE METRICS
    // ============================================

    app.get('/v2/marketplace-metrics', async (request, reply) => {
        try {
            requireUserContext(request);
            const query = request.query as Record<string, any>;
            const pagination = validatePaginationParams(query);
            const filters: MetricFilters = {
                date_from: query.date_from,
                date_to: query.date_to,
                page: pagination.page,
                limit: pagination.limit,
            };
            const result = await metricsService.listMetrics(filters);
            return reply.send(result);
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message || 'Failed to fetch marketplace metrics' } });
        }
    });

    app.get('/v2/marketplace-metrics/:id', async (request, reply) => {
        try {
            requireUserContext(request);
            const { id } = request.params as { id: string };
            const metric = await metricsService.getMetric(id);
            return reply.send({ data: metric });
        } catch (error: any) {
            return reply.code(404).send({ error: { message: error.message || 'Marketplace metric not found' } });
        }
    });

    app.post('/v2/marketplace-metrics', async (request, reply) => {
        try {
            requireUserContext(request);
            const body = request.body as CreateMetricInput;
            if (
                !body?.date ||
                typeof body.total_placements === 'undefined' ||
                typeof body.total_applications === 'undefined' ||
                typeof body.total_earnings_cents === 'undefined' ||
                typeof body.active_recruiters === 'undefined' ||
                typeof body.active_jobs === 'undefined' ||
                typeof body.health_score === 'undefined'
            ) {
                return reply.code(400).send({
                    error: { message: 'date, totals, activity, and health_score are required' },
                });
            }
            const metric = await metricsService.createMetric(body);
            return reply.code(201).send({ data: metric });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message || 'Failed to create marketplace metric' } });
        }
    });

    app.patch('/v2/marketplace-metrics/:id', async (request, reply) => {
        try {
            requireUserContext(request);
            const { id } = request.params as { id: string };
            const updates = request.body as MetricUpdate;
            const metric = await metricsService.updateMetric(id, updates);
            return reply.send({ data: metric });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message || 'Failed to update marketplace metric' } });
        }
    });

    app.delete('/v2/marketplace-metrics/:id', async (request, reply) => {
        try {
            requireUserContext(request);
            const { id } = request.params as { id: string };
            await metricsService.deleteMetric(id);
            return reply.code(204).send();
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message || 'Failed to delete marketplace metric' } });
        }
    });
}
