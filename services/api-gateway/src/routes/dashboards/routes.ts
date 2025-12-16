import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { requireRoles, AuthenticatedRequest, isRecruiter, isCompanyUser } from '../../rbac';

/**
 * Dashboard Routes
 * - Persona-specific dashboard stats and insights
 */
export function registerDashboardsRoutes(app: FastifyInstance, services: ServiceRegistry) {
    const networkService = () => services.get('network');
    const atsService = () => services.get('ats');
    const billingService = () => services.get('billing');
    const getCorrelationId = (request: FastifyRequest) => (request as any).correlationId;

    // ========================================================================
    // Recruiter Dashboard
    // ========================================================================

    app.get('/api/recruiter/dashboard/stats', {
        preHandler: requireRoles(['recruiter']),
        schema: {
            description: 'Get recruiter dashboard stats',
            tags: ['dashboards'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const req = request as AuthenticatedRequest;
        const correlationId = getCorrelationId(request);

        try {
            // Get recruiter profile
            const recruiterResponse: any = await networkService().get(
                `/recruiters/by-user/${req.auth.userId}`,
                undefined,
                correlationId
            );
            const recruiterId = recruiterResponse.data?.id;

            if (!recruiterId) {
                return reply.send({
                    data: {
                        active_roles: 0,
                        candidates_in_process: 0,
                        offers_pending: 0,
                        placements_this_month: 0,
                        placements_this_year: 0,
                        total_earnings_ytd: 0,
                        pending_payouts: 0,
                    }
                });
            }

            // Get assigned job IDs
            const jobsResponse: any = await networkService().get(
                `/recruiters/${recruiterId}/jobs`,
                undefined,
                correlationId
            );
            const jobIds = jobsResponse.data || [];

            // TODO: Add recruiter-specific stats endpoint in ATS service
            const stats = {
                active_roles: jobIds.length,
                candidates_in_process: 0,
                offers_pending: 0,
                placements_this_month: 0,
                placements_this_year: 0,
                total_earnings_ytd: 0,
                pending_payouts: 0,
            };

            return reply.send({ data: stats });
        } catch (error) {
            request.log.error({ error }, 'Error fetching recruiter dashboard stats');
            return reply.status(500).send({ error: 'Failed to load dashboard stats' });
        }
    });

    app.get('/api/recruiter/dashboard/activity', {
        preHandler: requireRoles(['recruiter']),
        schema: {
            description: 'Get recruiter dashboard activity feed',
            tags: ['dashboards'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        // TODO: Implement activity feed for recruiter
        return reply.send({ data: [] });
    });

    // ========================================================================
    // Company Dashboard
    // ========================================================================

    app.get('/api/company/dashboard/stats', {
        preHandler: requireRoles(['company_admin', 'hiring_manager']),
        schema: {
            description: 'Get company dashboard stats',
            tags: ['dashboards'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const req = request as AuthenticatedRequest;

        try {
            // Get company ID from user memberships
            const companyMembership = req.auth.memberships?.find(
                m => m.role === 'company_admin' || m.role === 'hiring_manager'
            );

            if (!companyMembership) {
                return reply.status(403).send({ error: 'No company association found' });
            }

            // TODO: Add company-specific stats endpoint in ATS service
            const stats = {
                active_roles: 0,
                total_applications: 0,
                interviews_scheduled: 0,
                offers_extended: 0,
                placements_this_month: 0,
                placements_this_year: 0,
                avg_time_to_hire_days: 0,
                active_recruiters: 0,
            };

            return reply.send({ data: stats });
        } catch (error) {
            request.log.error({ error }, 'Error fetching company dashboard stats');
            return reply.status(500).send({ error: 'Failed to load dashboard stats' });
        }
    });

    app.get('/api/company/dashboard/roles', {
        preHandler: requireRoles(['company_admin', 'hiring_manager']),
        schema: {
            description: 'Get company dashboard roles breakdown',
            tags: ['dashboards'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        // TODO: Implement role breakdown with pipeline stats
        return reply.send({ data: [] });
    });

    app.get('/api/company/dashboard/activity', {
        preHandler: requireRoles(['company_admin', 'hiring_manager']),
        schema: {
            description: 'Get company dashboard activity feed',
            tags: ['dashboards'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        // TODO: Implement activity feed for company roles
        return reply.send({ data: [] });
    });

    // ========================================================================
    // Admin Dashboard
    // ========================================================================

    app.get('/api/admin/dashboard/stats', {
        preHandler: requireRoles(['platform_admin']),
        schema: {
            description: 'Get admin dashboard stats',
            tags: ['dashboards'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const correlationId = getCorrelationId(request);

        try {
            // TODO: Aggregate platform-wide stats from all services
            const stats = {
                total_active_roles: 0,
                total_applications: 0,
                total_active_recruiters: 0,
                total_companies: 0,
                placements_this_month: 0,
                placements_this_year: 0,
                total_platform_revenue_ytd: 0,
                pending_payouts: 0,
                pending_approvals: 0,
                fraud_alerts: 0,
            };

            return reply.send({ data: stats });
        } catch (error) {
            request.log.error({ error }, 'Error fetching admin dashboard stats');
            return reply.status(500).send({ error: 'Failed to load dashboard stats' });
        }
    });

    app.get('/api/admin/dashboard/health', {
        preHandler: requireRoles(['platform_admin']),
        schema: {
            description: 'Get marketplace health metrics',
            tags: ['dashboards'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        // TODO: Calculate marketplace health metrics
        const health = {
            recruiter_satisfaction: 0,
            company_satisfaction: 0,
            avg_time_to_first_candidate_days: 0,
            avg_time_to_placement_days: 0,
            fill_rate_percentage: 0,
        };

        return reply.send({ data: health });
    });

    app.get('/api/admin/dashboard/activity', {
        preHandler: requireRoles(['platform_admin']),
        schema: {
            description: 'Get admin dashboard activity feed',
            tags: ['dashboards'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        // TODO: Implement platform-wide activity feed
        return reply.send({ data: [] });
    });

    app.get('/api/admin/dashboard/alerts', {
        preHandler: requireRoles(['platform_admin']),
        schema: {
            description: 'Get admin dashboard alerts',
            tags: ['dashboards'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        // TODO: Aggregate alerts from all services
        return reply.send({ data: [] });
    });

    // Legacy: Admin stats endpoint (aggregates from multiple services)
    app.get('/api/admin/stats', {
        preHandler: requireRoles(['platform_admin']),
        schema: {
            description: 'Get admin stats (legacy)',
            tags: ['dashboards'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const correlationId = getCorrelationId(request);

        // Fetch stats from each service in parallel
        const [recruiterStats, atsStats] = await Promise.all([
            networkService().get('/stats', undefined, correlationId),
            atsService().get('/stats', undefined, correlationId),
        ]);

        // Combine stats from all services
        const stats = {
            totalRecruiters: (recruiterStats as any).data?.totalRecruiters || 0,
            activeRecruiters: (recruiterStats as any).data?.activeRecruiters || 0,
            pendingRecruiters: (recruiterStats as any).data?.pendingRecruiters || 0,
            totalJobs: (atsStats as any).data?.totalJobs || 0,
            activeJobs: (atsStats as any).data?.activeJobs || 0,
            totalApplications: (atsStats as any).data?.totalApplications || 0,
            totalPlacements: (atsStats as any).data?.totalPlacements || 0,
        };

        return reply.send({ data: stats });
    });
}
