/**
 * Onboarding Routes — API Gateway
 *
 * Orchestrates user/candidate/recruiter/company creation across services
 * so the frontend makes one call instead of 4-8 sequential calls.
 */

import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { requireAuth } from '../../middleware/auth';
import { buildAuthHeaders } from '../../helpers/auth-headers';
import { getCorrelationId } from './common';

export function registerOnboardingRoutes(
    app: FastifyInstance,
    services: ServiceRegistry
) {
    const identityService = () => services.get('identity');
    const atsService = () => services.get('ats');
    const networkService = () => services.get('network');
    const billingService = () => services.get('billing');

    // ── GET /api/v2/onboarding/status ────────────────────────────────────
    // Returns current onboarding state: user + candidate + recruiter in one call
    app.get(
        '/api/v2/onboarding/status',
        { preHandler: requireAuth() },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);

            const [userResult, candidateResult, recruiterResult] = await Promise.allSettled([
                identityService().get('/api/v2/users/me', undefined, correlationId, authHeaders),
                atsService().get('/api/v2/candidates/me', undefined, correlationId, authHeaders),
                networkService().get('/api/v2/recruiters/me', undefined, correlationId, authHeaders),
            ]);

            const user = userResult.status === 'fulfilled' ? (userResult.value as any)?.data ?? userResult.value : null;
            const candidate = candidateResult.status === 'fulfilled' ? (candidateResult.value as any)?.data ?? candidateResult.value : null;
            const recruiter = recruiterResult.status === 'fulfilled' ? (recruiterResult.value as any)?.data ?? recruiterResult.value : null;

            const roles: string[] = [];
            if (candidate) roles.push('candidate');
            if (recruiter) roles.push('recruiter');
            if (user?.roles) roles.push(...(user.roles as string[]));

            return reply.send({
                data: { user, candidate, recruiter, roles: [...new Set(roles)] },
            });
        }
    );

    // ── POST /api/v2/onboarding/init ─────────────────────────────────────
    // Idempotent account setup for both apps
    app.post(
        '/api/v2/onboarding/init',
        { preHandler: requireAuth() },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);
            const body = request.body as {
                email: string;
                name?: string;
                image_url?: string;
                referred_by_recruiter_id?: string;
                source_app: 'candidate' | 'portal';
            };

            if (!body.email) {
                return reply.code(400).send({ error: { message: 'email is required' } });
            }
            if (!body.source_app) {
                return reply.code(400).send({ error: { message: 'source_app is required' } });
            }

            try {
                // Step 1: Ensure user exists
                let user: any = null;
                let userWasExisting = false;

                try {
                    const userResponse = await identityService().get<any>(
                        '/api/v2/users/me', undefined, correlationId, authHeaders
                    );
                    user = userResponse?.data ?? userResponse;
                    userWasExisting = true;
                } catch (err: any) {
                    if (err.statusCode !== 404) {
                        request.log.warn({ error: err.message }, 'Unexpected error checking user');
                    }
                }

                if (!user) {
                    try {
                        const registerResponse = await identityService().post<any>(
                            '/api/v2/users/register',
                            {
                                clerk_user_id: request.auth?.clerkUserId,
                                email: body.email,
                                name: body.name || '',
                                image_url: body.image_url,
                                referred_by_recruiter_id: body.referred_by_recruiter_id,
                            },
                            correlationId,
                            authHeaders
                        );
                        user = registerResponse?.data ?? registerResponse;
                    } catch (regErr: any) {
                        // Handle duplicate (webhook race condition) — retry GET
                        if (regErr.statusCode === 409 || regErr.jsonBody?.error?.message?.includes('already')) {
                            const retryResponse = await identityService().get<any>(
                                '/api/v2/users/me', undefined, correlationId, authHeaders
                            );
                            user = retryResponse?.data ?? retryResponse;
                            userWasExisting = true;
                        } else {
                            throw regErr;
                        }
                    }
                }

                if (!user) {
                    return reply.code(500).send({ error: { message: 'Failed to create or find user' } });
                }

                // Step 2: For candidate app, ensure candidate exists
                let candidate: any = null;
                let candidateWasExisting = false;

                if (body.source_app === 'candidate') {
                    // Try GET first
                    try {
                        const candidateResponse = await atsService().get<any>(
                            '/api/v2/candidates/me', undefined, correlationId, authHeaders
                        );
                        candidate = candidateResponse?.data ?? candidateResponse;
                        candidateWasExisting = true;
                    } catch (err: any) {
                        if (err.statusCode !== 404) {
                            request.log.warn({ error: err.message }, 'Unexpected error checking candidate');
                        }
                    }

                    // If no candidate, create one
                    if (!candidate) {
                        try {
                            const createResponse = await atsService().post<any>(
                                '/api/v2/candidates',
                                {
                                    user_id: user.id,
                                    full_name: body.name || body.email.split('@')[0],
                                    email: body.email,
                                },
                                correlationId,
                                authHeaders
                            );
                            candidate = createResponse?.data ?? createResponse;
                        } catch (createErr: any) {
                            // Duplicate email (recruiter-created candidate) — backend claims it, retry GET
                            const isDuplicate =
                                createErr.statusCode === 409 ||
                                createErr.jsonBody?.error?.message?.includes('duplicate') ||
                                createErr.jsonBody?.error?.code === '23505';

                            if (isDuplicate) {
                                // Wait briefly for claim to propagate, then retry
                                await new Promise(r => setTimeout(r, 500));
                                try {
                                    const retryResponse = await atsService().get<any>(
                                        '/api/v2/candidates/me', undefined, correlationId, authHeaders
                                    );
                                    candidate = retryResponse?.data ?? retryResponse;
                                    candidateWasExisting = true;
                                } catch {
                                    request.log.error('Failed to fetch candidate after duplicate error');
                                }
                            } else {
                                throw createErr;
                            }
                        }
                    }
                }

                const statusCode = userWasExisting ? 200 : 201;
                return reply.code(statusCode).send({
                    data: {
                        user,
                        candidate,
                        was_existing: {
                            user: userWasExisting,
                            candidate: candidateWasExisting,
                        },
                    },
                });
            } catch (error: any) {
                request.log.error({ error: error.message, correlationId }, 'Onboarding init failed');
                return reply
                    .code(error.statusCode || 500)
                    .send(error.jsonBody || { error: { message: 'Failed to initialize onboarding' } });
            }
        }
    );

    // ── POST /api/v2/onboarding/candidate ────────────────────────────────
    // Submit candidate onboarding: update profile + mark complete
    app.post(
        '/api/v2/onboarding/candidate',
        { preHandler: requireAuth() },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);
            const body = request.body as {
                candidate_id: string;
                profile?: Record<string, any>;
            };

            if (!body.candidate_id) {
                return reply.code(400).send({ error: { message: 'candidate_id is required' } });
            }

            try {
                // Validate user is not already completed
                const userResponse = await identityService().get<any>(
                    '/api/v2/users/me', undefined, correlationId, authHeaders
                );
                const user = userResponse?.data ?? userResponse;

                if (user?.onboarding_status === 'completed') {
                    return reply.code(409).send({
                        data: { user },
                        error: { message: 'Onboarding already completed' },
                    });
                }

                // Update candidate profile + mark onboarding complete (parallel)
                const updates: Promise<any>[] = [];

                if (body.profile && Object.keys(body.profile).length > 0) {
                    updates.push(
                        atsService().patch(
                            `/api/v2/candidates/${body.candidate_id}`,
                            body.profile,
                            correlationId,
                            authHeaders
                        )
                    );
                }

                updates.push(
                    identityService().patch(
                        '/api/v2/users/me',
                        {
                            onboarding_status: 'completed',
                            onboarding_completed_at: new Date().toISOString(),
                        },
                        correlationId,
                        authHeaders
                    )
                );

                const results = await Promise.all(updates);

                const candidateResult = body.profile && Object.keys(body.profile).length > 0
                    ? (results[0] as any)?.data ?? results[0]
                    : null;
                const userResult = body.profile && Object.keys(body.profile).length > 0
                    ? (results[1] as any)?.data ?? results[1]
                    : (results[0] as any)?.data ?? results[0];

                return reply.send({
                    data: {
                        user: userResult,
                        candidate: candidateResult,
                    },
                });
            } catch (error: any) {
                request.log.error({ error: error.message, correlationId }, 'Candidate onboarding submit failed');
                return reply
                    .code(error.statusCode || 500)
                    .send(error.jsonBody || { error: { message: 'Failed to complete candidate onboarding' } });
            }
        }
    );

    // ── POST /api/v2/onboarding/recruiter ────────────────────────────────
    // Submit recruiter onboarding: create recruiter + activate subscription + mark complete
    app.post(
        '/api/v2/onboarding/recruiter',
        { preHandler: requireAuth() },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);
            const body = request.body as {
                profile: {
                    bio?: string;
                    phone?: string;
                    industries?: string[];
                    specialties?: string[];
                    location?: string[];
                    tagline?: string;
                    years_experience?: number;
                };
                plan: {
                    plan_id: string;
                    tier: string;
                    payment_method_id?: string;
                    customer_id?: string;
                    promotion_code?: string;
                };
            };

            if (!body.profile) {
                return reply.code(400).send({ error: { message: 'profile is required' } });
            }
            if (!body.plan?.plan_id) {
                return reply.code(400).send({ error: { message: 'plan.plan_id is required' } });
            }

            try {
                // Step 1: Get current user
                const userResponse = await identityService().get<any>(
                    '/api/v2/users/me', undefined, correlationId, authHeaders
                );
                const user = userResponse?.data ?? userResponse;

                if (user?.onboarding_status === 'completed') {
                    return reply.code(409).send({
                        data: { user },
                        error: { message: 'Onboarding already completed' },
                    });
                }

                // Step 2: Create recruiter profile
                const recruiterResponse = await networkService().post<any>(
                    '/api/v2/recruiters',
                    {
                        user_id: user.id,
                        bio: body.profile.bio,
                        phone: body.profile.phone,
                        industries: body.profile.industries || [],
                        specialties: body.profile.specialties || [],
                        location: body.profile.location || [],
                        tagline: body.profile.tagline || null,
                        years_experience: body.profile.years_experience || null,
                    },
                    correlationId,
                    authHeaders
                );
                const recruiter = recruiterResponse?.data ?? recruiterResponse;

                // Step 3: Activate subscription
                let subscription: any = null;
                const isPaidPlan = body.plan.tier !== 'starter' && body.plan.payment_method_id;
                const activateData: any = { plan_id: body.plan.plan_id };

                if (isPaidPlan) {
                    activateData.payment_method_id = body.plan.payment_method_id;
                    activateData.customer_id = body.plan.customer_id;
                    if (body.plan.promotion_code) {
                        activateData.promotion_code = body.plan.promotion_code;
                    }
                }

                try {
                    const subResponse = await billingService().post<any>(
                        '/api/v2/subscriptions/activate',
                        activateData,
                        correlationId,
                        authHeaders
                    );
                    subscription = subResponse?.data ?? subResponse;
                } catch (subErr: any) {
                    request.log.error({ error: subErr.message }, 'Failed to activate subscription');
                    // Don't fail the whole onboarding — recruiter was created
                }

                // Step 4: Mark onboarding complete
                const completeResponse = await identityService().patch<any>(
                    '/api/v2/users/me',
                    {
                        onboarding_status: 'completed',
                        onboarding_step: 4,
                        onboarding_completed_at: new Date().toISOString(),
                    },
                    correlationId,
                    authHeaders
                );
                const updatedUser = completeResponse?.data ?? completeResponse;

                return reply.code(201).send({
                    data: {
                        user: updatedUser,
                        recruiter,
                        subscription,
                    },
                });
            } catch (error: any) {
                request.log.error({ error: error.message, correlationId }, 'Recruiter onboarding submit failed');
                return reply
                    .code(error.statusCode || 500)
                    .send(error.jsonBody || { error: { message: 'Failed to complete recruiter onboarding', step: 'unknown' } });
            }
        }
    );

    // ── POST /api/v2/onboarding/business ─────────────────────────────────
    // Submit business onboarding: create org + company + membership + billing + mark complete
    app.post(
        '/api/v2/onboarding/business',
        { preHandler: requireAuth() },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);
            const body = request.body as {
                company: {
                    name: string;
                    website?: string;
                    industry?: string;
                    size?: string;
                    description?: string;
                    headquarters_location?: string;
                    logo_url?: string;
                };
                billing: {
                    billing_terms: string;
                    billing_email: string;
                    invoice_delivery_method?: string;
                };
                from_invitation?: { id: string };
                referred_by_recruiter_id?: string;
            };

            if (!body.company?.name) {
                return reply.code(400).send({ error: { message: 'company.name is required' } });
            }
            if (!body.billing?.billing_email) {
                return reply.code(400).send({ error: { message: 'billing.billing_email is required' } });
            }

            try {
                // Step 1: Get current user
                const userResponse = await identityService().get<any>(
                    '/api/v2/users/me', undefined, correlationId, authHeaders
                );
                const user = userResponse?.data ?? userResponse;

                if (user?.onboarding_status === 'completed') {
                    return reply.code(409).send({
                        data: { user },
                        error: { message: 'Onboarding already completed' },
                    });
                }

                // Step 2: Create organization
                const orgSlug = body.company.name
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-+|-+$/g, '');

                const orgResponse = await identityService().post<any>(
                    '/api/v2/organizations',
                    { name: body.company.name, type: 'company', slug: orgSlug },
                    correlationId,
                    authHeaders
                );
                const organization = orgResponse?.data ?? orgResponse;

                // Step 3: Create company
                const companyResponse = await atsService().post<any>(
                    '/api/v2/companies',
                    {
                        identity_organization_id: organization.id,
                        name: body.company.name,
                        website: body.company.website || null,
                        industry: body.company.industry || null,
                        company_size: body.company.size || null,
                        description: body.company.description || null,
                        headquarters_location: body.company.headquarters_location || null,
                        logo_url: body.company.logo_url || null,
                    },
                    correlationId,
                    authHeaders
                );
                const company = companyResponse?.data ?? companyResponse;

                // Step 4: Create membership
                const membershipResponse = await identityService().post<any>(
                    '/api/v2/memberships',
                    {
                        user_id: user.id,
                        role_name: 'company_admin',
                        organization_id: organization.id,
                    },
                    correlationId,
                    authHeaders
                );
                const membership = membershipResponse?.data ?? membershipResponse;

                // Step 5: Create billing profile
                let billingProfile: any = null;
                try {
                    const billingResponse = await billingService().post<any>(
                        `/api/v2/company-billing-profiles/${company.id}`,
                        {
                            billing_terms: body.billing.billing_terms || 'net_30',
                            billing_email: body.billing.billing_email,
                            invoice_delivery_method: body.billing.invoice_delivery_method || 'email',
                        },
                        correlationId,
                        authHeaders
                    );
                    billingProfile = billingResponse?.data ?? billingResponse;
                } catch (billingErr: any) {
                    request.log.error({ error: billingErr.message }, 'Failed to create billing profile');
                }

                // Step 6: Non-blocking relationship completions
                let invitationCompleted = false;
                let sourcerConnectionCreated = false;

                if (body.from_invitation?.id) {
                    try {
                        await networkService().post(
                            '/api/v2/company-invitations/complete-relationship',
                            {
                                invitation_id: body.from_invitation.id,
                                company_id: company.id,
                            },
                            correlationId,
                            authHeaders
                        );
                        invitationCompleted = true;
                    } catch (invErr: any) {
                        request.log.error({ error: invErr.message }, 'Failed to complete invitation relationship');
                    }
                }

                if (body.referred_by_recruiter_id && !body.from_invitation?.id) {
                    try {
                        await networkService().post(
                            '/api/v2/recruiter-companies/request-connection',
                            {
                                recruiter_id: body.referred_by_recruiter_id,
                                company_id: company.id,
                                relationship_type: 'sourcer',
                            },
                            correlationId,
                            authHeaders
                        );
                        sourcerConnectionCreated = true;
                    } catch (relErr: any) {
                        request.log.error({ error: relErr.message }, 'Failed to create sourcer relationship');
                    }
                }

                // Step 7: Mark onboarding complete
                const completeResponse = await identityService().patch<any>(
                    '/api/v2/users/me',
                    {
                        onboarding_status: 'completed',
                        onboarding_step: 4,
                        onboarding_completed_at: new Date().toISOString(),
                    },
                    correlationId,
                    authHeaders
                );
                const updatedUser = completeResponse?.data ?? completeResponse;

                return reply.code(201).send({
                    data: {
                        user: updatedUser,
                        organization,
                        company,
                        membership,
                        billing_profile: billingProfile,
                        invitation_completed: invitationCompleted,
                        sourcer_connection_created: sourcerConnectionCreated,
                    },
                });
            } catch (error: any) {
                request.log.error({ error: error.message, correlationId }, 'Business onboarding submit failed');
                return reply
                    .code(error.statusCode || 500)
                    .send(error.jsonBody || { error: { message: 'Failed to complete business onboarding' } });
            }
        }
    );
}
