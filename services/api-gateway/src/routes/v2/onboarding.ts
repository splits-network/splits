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
                                // Retry GET with backoff — webhook may still be committing the claim
                                let claimed = false;
                                for (let attempt = 1; attempt <= 3; attempt++) {
                                    await new Promise(r => setTimeout(r, attempt * 500));
                                    try {
                                        const retryResponse = await atsService().get<any>(
                                            '/api/v2/candidates/me', undefined, correlationId, authHeaders
                                        );
                                        candidate = retryResponse?.data ?? retryResponse;
                                        candidateWasExisting = true;
                                        claimed = true;
                                        break;
                                    } catch (retryErr: any) {
                                        request.log.warn(
                                            { attempt, error: retryErr.message },
                                            'Retry GET /candidates/me after duplicate — attempt failed'
                                        );
                                    }
                                }
                                if (!claimed) {
                                    request.log.error('All retries exhausted: could not link candidate after duplicate email error');
                                    return reply.code(409).send({
                                        error: {
                                            code: 'CANDIDATE_LINK_FAILED',
                                            message: 'A candidate profile exists for this email but could not be linked to your account. Please try again.',
                                        },
                                    });
                                }
                            } else {
                                throw createErr;
                            }
                        }
                    }
                }

                // Guard: candidate app must always have a candidate or we return an error
                if (body.source_app === 'candidate' && !candidate) {
                    request.log.error({ correlationId }, 'Onboarding init: candidate path completed but candidate is null');
                    return reply.code(500).send({
                        error: {
                            code: 'CANDIDATE_CREATION_FAILED',
                            message: 'Failed to create or link candidate profile. Please try again.',
                        },
                    });
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
    // Proxied to onboarding-service for atomic transaction handling.
    const onboardingService = () => services.get('onboarding');

    app.post(
        '/api/v2/onboarding/business',
        { preHandler: requireAuth() },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);

            try {
                // Route to onboarding-service V3 action endpoint (handles both V2 and V3)
                const response = await onboardingService().post<any>(
                    '/api/v3/onboarding/actions/business',
                    request.body,
                    correlationId,
                    authHeaders
                );

                return reply.code(201).send(response);
            } catch (error: any) {
                request.log.error({ error: error.message, correlationId }, 'Business onboarding submit failed');
                return reply
                    .code(error.statusCode || 500)
                    .send(error.jsonBody || { error: { message: 'Failed to complete business onboarding' } });
            }
        }
    );
}
