import { Logger } from '@splits-network/shared-logging';
import { ATSRepository } from './repository';
import { GreenhouseClient } from './greenhouse-client';
import { LeverClient } from './lever-client';
import { IEventPublisher } from '../shared/events';
import type {
    ATSIntegration,
    ATSPlatform,
    ATSIntegrationConfig,
    LeverConfig,
    SyncResult,
    SyncEntityType,
} from '@splits-network/shared-types';

/* ── Public types ────────────────────────────────────────────────────── */

/** What the frontend receives — no API keys exposed */
export type ATSIntegrationPublic = Omit<ATSIntegration, 'api_key_encrypted' | 'webhook_secret'>;

export interface SetupATSParams {
    company_id: string;
    platform: ATSPlatform;
    api_key: string;
    api_base_url?: string;
    config?: Partial<ATSIntegrationConfig>;
    sync_roles?: boolean;
    sync_candidates?: boolean;
    sync_applications?: boolean;
    sync_interviews?: boolean;
}

/* ── Service ─────────────────────────────────────────────────────────── */

export class ATSService {
    constructor(
        private repo: ATSRepository,
        private eventPublisher: IEventPublisher,
        private logger: Logger,
    ) {}

    /* ── CRUD ─────────────────────────────────────────────────────────── */

    async listIntegrations(companyId: string): Promise<ATSIntegrationPublic[]> {
        const integrations = await this.repo.listByCompany(companyId);
        return integrations.map(i => this.toPublic(i));
    }

    async getIntegration(id: string): Promise<ATSIntegrationPublic | null> {
        const integration = await this.repo.findById(id);
        return integration ? this.toPublic(integration) : null;
    }

    async setupIntegration(params: SetupATSParams): Promise<ATSIntegrationPublic> {
        // Check for existing
        const existing = await this.repo.findByCompanyAndPlatform(params.company_id, params.platform);
        if (existing) {
            throw new Error(`Already connected to ${params.platform}. Disconnect first.`);
        }

        // Validate API key by making a test call
        await this.validateApiKey(params.platform, params.api_key, params.api_base_url, params.config);

        const integration = await this.repo.create({
            company_id: params.company_id,
            platform: params.platform,
            api_key_encrypted: params.api_key, // TODO: encrypt at rest
            api_base_url: params.api_base_url ?? null,
            webhook_url: null,
            webhook_secret: null,
            sync_enabled: false,
            sync_roles: params.sync_roles ?? true,
            sync_candidates: params.sync_candidates ?? true,
            sync_applications: params.sync_applications ?? true,
            sync_interviews: params.sync_interviews ?? false,
            last_synced_at: null,
            last_sync_error: null,
            config: { platform: params.platform, ...params.config } as ATSIntegrationConfig,
        });

        this.logger.info(
            { integrationId: integration.id, platform: params.platform, companyId: params.company_id },
            'ATS integration created',
        );

        return this.toPublic(integration);
    }

    async updateIntegration(
        id: string,
        updates: {
            sync_enabled?: boolean;
            sync_roles?: boolean;
            sync_candidates?: boolean;
            sync_applications?: boolean;
            sync_interviews?: boolean;
            config?: Partial<ATSIntegrationConfig>;
        },
    ): Promise<ATSIntegrationPublic> {
        const integration = await this.repo.update(id, updates as any);
        return this.toPublic(integration);
    }

    async disconnectIntegration(id: string): Promise<void> {
        await this.repo.delete(id);
        this.logger.info({ integrationId: id }, 'ATS integration disconnected');
    }

    /* ── Sync Operations ──────────────────────────────────────────────── */

    async triggerSync(id: string): Promise<{ queued: number }> {
        const integration = await this.repo.findById(id);
        if (!integration) throw new Error('Integration not found');
        if (!integration.sync_enabled) throw new Error('Sync is not enabled');

        let queued = 0;

        // Queue inbound sync (ATS → Splits)
        if (integration.sync_roles) {
            await this.repo.enqueue({
                integration_id: id,
                entity_type: 'role',
                entity_id: '*',
                action: 'update',
                direction: 'inbound',
                priority: 1,
                payload: {},
                status: 'pending',
                retry_count: 0,
                max_retries: 3,
                last_error: null,
                scheduled_at: new Date().toISOString(),
                processed_at: null,
            });
            queued++;
        }

        if (integration.sync_candidates) {
            await this.repo.enqueue({
                integration_id: id,
                entity_type: 'candidate',
                entity_id: '*',
                action: 'update',
                direction: 'inbound',
                priority: 2,
                payload: {},
                status: 'pending',
                retry_count: 0,
                max_retries: 3,
                last_error: null,
                scheduled_at: new Date().toISOString(),
                processed_at: null,
            });
            queued++;
        }

        if (integration.sync_applications) {
            await this.repo.enqueue({
                integration_id: id,
                entity_type: 'application',
                entity_id: '*',
                action: 'update',
                direction: 'inbound',
                priority: 3,
                payload: {},
                status: 'pending',
                retry_count: 0,
                max_retries: 3,
                last_error: null,
                scheduled_at: new Date().toISOString(),
                processed_at: null,
            });
            queued++;
        }

        await this.repo.update(id, { last_synced_at: new Date().toISOString() });

        this.logger.info({ integrationId: id, queued }, 'ATS sync triggered');
        return { queued };
    }

    async getSyncLogs(
        id: string,
        opts: { limit?: number; offset?: number; status?: string } = {},
    ) {
        return this.repo.listSyncLogs(id, opts);
    }

    async getSyncStats(id: string) {
        return this.repo.getSyncStats(id);
    }

    /* ── Outbound Push (Splits → ATS) ─────────────────────────────────── */

    async pushCandidateToATS(
        integrationId: string,
        candidateData: {
            first_name: string;
            last_name: string;
            email: string;
            phone?: string;
            job_external_id?: string;
        },
    ): Promise<SyncResult> {
        const integration = await this.repo.findById(integrationId);
        if (!integration) throw new Error('Integration not found');

        try {
            let externalId: string | null = null;

            if (integration.platform === 'greenhouse') {
                const client = new GreenhouseClient(integration.api_key_encrypted, this.logger, integration.api_base_url || undefined);
                const candidate = await client.createCandidate({
                    first_name: candidateData.first_name,
                    last_name: candidateData.last_name,
                    emails: [{ value: candidateData.email, type: 'personal' }],
                    phone_numbers: candidateData.phone ? [{ value: candidateData.phone, type: 'mobile' }] : undefined,
                });
                externalId = String(candidate.id);

                // If job mapping exists, add application
                if (candidateData.job_external_id) {
                    await client.addCandidateToJob(candidate.id, parseInt(candidateData.job_external_id, 10));
                }
            } else if (integration.platform === 'lever') {
                const config = integration.config as LeverConfig;
                const client = new LeverClient(integration.api_key_encrypted, this.logger, config.environment);
                const opportunity = await client.createOpportunity({
                    name: `${candidateData.first_name} ${candidateData.last_name}`,
                    emails: [candidateData.email],
                    phones: candidateData.phone ? [{ type: 'mobile', value: candidateData.phone }] : undefined,
                    postings: candidateData.job_external_id ? [candidateData.job_external_id] : undefined,
                });
                externalId = opportunity.id;
            } else {
                throw new Error(`Push not yet supported for ${integration.platform}`);
            }

            // Log success
            await this.repo.createSyncLog({
                integration_id: integrationId,
                entity_type: 'candidate',
                entity_id: null,
                external_id: externalId,
                action: 'created',
                direction: 'outbound',
                status: 'success',
                error_message: null,
                error_code: null,
                request_payload: candidateData,
                response_payload: { external_id: externalId },
                retry_count: 0,
            });

            return {
                success: true,
                entity_id: null,
                external_id: externalId,
                action: 'created',
            };
        } catch (err: any) {
            await this.repo.createSyncLog({
                integration_id: integrationId,
                entity_type: 'candidate',
                entity_id: null,
                external_id: null,
                action: 'created',
                direction: 'outbound',
                status: 'failed',
                error_message: err.message,
                error_code: null,
                request_payload: candidateData,
                response_payload: null,
                retry_count: 0,
            });

            return {
                success: false,
                entity_id: null,
                external_id: null,
                action: 'created',
                error: { code: 'PUSH_FAILED', message: err.message },
            };
        }
    }

    /* ── Private ──────────────────────────────────────────────────────── */

    private toPublic(integration: ATSIntegration): ATSIntegrationPublic {
        const { api_key_encrypted, webhook_secret, ...pub } = integration;
        return pub;
    }

    private async validateApiKey(
        platform: ATSPlatform,
        apiKey: string,
        baseUrl?: string | null,
        config?: Partial<ATSIntegrationConfig>,
    ): Promise<void> {
        try {
            if (platform === 'greenhouse') {
                const client = new GreenhouseClient(apiKey, this.logger, baseUrl || undefined);
                await client.listJobs({ per_page: 1 });
            } else if (platform === 'lever') {
                const lc = config as Partial<LeverConfig> | undefined;
                const client = new LeverClient(apiKey, this.logger, lc?.environment);
                await client.listPostings({ limit: 1 });
            }
            // workable/ashby/generic — skip validation for now
        } catch (err: any) {
            throw new Error(`API key validation failed: ${err.message}`);
        }
    }
}
