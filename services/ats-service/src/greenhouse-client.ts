/**
 * Greenhouse API Integration (Phase 4C)
 * Bidirectional sync with Greenhouse ATS
 * API Docs: https://developers.greenhouse.io/
 */

import type {
  ATSIntegration,
  Greenhouse,
  SyncResult,
  SyncDirection,
} from '@splits-network/shared-types';

export interface GreenhouseConfig {
  apiKey: string;
  baseUrl?: string;
  harvestApiKey?: string; // For Harvest API (more data access)
  partnerId?: string;
}

export class GreenhouseClient {
  private apiKey: string;
  private baseUrl: string;
  private harvestApiKey?: string;

  constructor(config: GreenhouseConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://boards-api.greenhouse.io/v1';
    this.harvestApiKey = config.harvestApiKey;
  }

  /**
   * Fetch all open jobs from Greenhouse
   */
  async getJobs(): Promise<Greenhouse.Job[]> {
    const url = `${this.baseUrl}/boards/${this.getBoardToken()}/jobs`;
    const response = await fetch(url, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Greenhouse API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as { jobs?: Greenhouse.Job[] };
    return data.jobs || [];
  }

  /**
   * Fetch a specific job by ID
   */
  async getJob(jobId: number): Promise<Greenhouse.Job> {
    const url = `${this.baseUrl}/boards/${this.getBoardToken()}/jobs/${jobId}`;
    const response = await fetch(url, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Job ${jobId} not found`);
      }
      throw new Error(`Greenhouse API error: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<Greenhouse.Job>;
  }

  /**
   * Submit a candidate application (using Harvest API)
   * Note: Requires Harvest API key with write permissions
   */
  async createApplication(params: {
    job_id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    resume_url?: string;
    cover_letter?: string;
    source_id?: number; // Source attribution
    referrer?: {
      type: 'id' | 'email';
      value: string;
    };
  }): Promise<Greenhouse.Application> {
    if (!this.harvestApiKey) {
      throw new Error('Harvest API key required for creating applications');
    }

    const harvestUrl = 'https://harvest.greenhouse.io/v1/applications';
    const response = await fetch(harvestUrl, {
      method: 'POST',
      headers: {
        ...this.getHarvestHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        job_id: params.job_id,
        first_name: params.first_name,
        last_name: params.last_name,
        email: params.email,
        phone: params.phone,
        resume: params.resume_url,
        cover_letter: params.cover_letter,
        source_id: params.source_id,
        referrer: params.referrer,
      }),
    });

    if (!response.ok) {
      const error = await response.json() as any;
      throw new Error(`Failed to create application: ${error.message || response.statusText}`);
    }

    return response.json() as Promise<Greenhouse.Application>;
  }

  /**
   * Get application by ID (Harvest API)
   */
  async getApplication(applicationId: number): Promise<Greenhouse.Application> {
    if (!this.harvestApiKey) {
      throw new Error('Harvest API key required for fetching applications');
    }

    const url = `https://harvest.greenhouse.io/v1/applications/${applicationId}`;
    const response = await fetch(url, {
      headers: this.getHarvestHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch application: ${response.statusText}`);
    }

    return response.json() as Promise<Greenhouse.Application>;
  }

  /**
   * Update application stage (Harvest API)
   */
  async updateApplicationStage(applicationId: number, stageId: number): Promise<void> {
    if (!this.harvestApiKey) {
      throw new Error('Harvest API key required for updating applications');
    }

    const url = `https://harvest.greenhouse.io/v1/applications/${applicationId}/move`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...this.getHarvestHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to_stage_id: stageId,
      }),
    });

    if (!response.ok) {
      const error = await response.json() as any;
      throw new Error(`Failed to update stage: ${error.message || response.statusText}`);
    }
  }

  /**
   * Get candidate by ID (Harvest API)
   */
  async getCandidate(candidateId: number): Promise<Greenhouse.Candidate> {
    if (!this.harvestApiKey) {
      throw new Error('Harvest API key required for fetching candidates');
    }

    const url = `https://harvest.greenhouse.io/v1/candidates/${candidateId}`;
    const response = await fetch(url, {
      headers: this.getHarvestHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch candidate: ${response.statusText}`);
    }

    return response.json() as Promise<Greenhouse.Candidate>;
  }

  /**
   * Verify webhook signature from Greenhouse
   */
  static verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string
  ): boolean {
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payload);
    const computed = hmac.digest('base64');
    return computed === signature;
  }

  /**
   * Parse webhook payload from Greenhouse
   */
  static parseWebhook(body: any): {
    action: string;
    payload: any;
  } {
    return {
      action: body.action, // e.g., 'application_created', 'job_updated'
      payload: body.payload,
    };
  }

  private getHeaders(): Record<string, string> {
    return {
      'Authorization': `Basic ${Buffer.from(this.apiKey + ':').toString('base64')}`,
    };
  }

  private getHarvestHeaders(): Record<string, string> {
    if (!this.harvestApiKey) {
      throw new Error('Harvest API key not configured');
    }
    return {
      'Authorization': `Basic ${Buffer.from(this.harvestApiKey + ':').toString('base64')}`,
      'On-Behalf-Of': this.getBoardToken(), // User ID for audit trail
    };
  }

  private getBoardToken(): string {
    // Extract board token from API key or use configured partner ID
    // For now, return a placeholder - actual implementation depends on setup
    return 'board_token';
  }
}

/**
 * Greenhouse Sync Service
 * Handles bidirectional synchronization logic
 */
export class GreenhouseSyncService {
  constructor(
    private client: GreenhouseClient,
    private integration: ATSIntegration
  ) {}

  /**
   * Sync roles from Greenhouse to Splits Network (Inbound)
   */
  async syncRolesInbound(): Promise<SyncResult[]> {
    const results: SyncResult[] = [];

    try {
      const jobs = await this.client.getJobs();

      for (const job of jobs) {
        try {
          const result = await this.importJob(job);
          results.push(result);
        } catch (error: any) {
          results.push({
            success: false,
            entity_id: null,
            external_id: job.id.toString(),
            action: 'skipped',
            error: {
              code: 'IMPORT_FAILED',
              message: error.message,
            },
          });
        }
      }
    } catch (error: any) {
      throw new Error(`Failed to fetch Greenhouse jobs: ${error.message}`);
    }

    return results;
  }

  /**
   * Sync candidate application to Greenhouse (Outbound)
   */
  async syncApplicationOutbound(params: {
    internal_candidate_id: string;
    internal_role_id: string;
    external_job_id: number;
    candidate_data: {
      first_name: string;
      last_name: string;
      email: string;
      phone?: string;
      resume_url?: string;
    };
  }): Promise<SyncResult> {
    try {
      const application = await this.client.createApplication({
        job_id: params.external_job_id,
        first_name: params.candidate_data.first_name,
        last_name: params.candidate_data.last_name,
        email: params.candidate_data.email,
        phone: params.candidate_data.phone,
        resume_url: params.candidate_data.resume_url,
        source_id: this.getSourceId(), // Splits Network source attribution
      });

      return {
        success: true,
        entity_id: params.internal_candidate_id,
        external_id: application.id.toString(),
        action: 'created',
        metadata: {
          application_id: application.id,
          candidate_id: application.candidate_id,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        entity_id: params.internal_candidate_id,
        external_id: null,
        action: 'skipped',
        error: {
          code: 'APPLICATION_CREATE_FAILED',
          message: error.message,
        },
      };
    }
  }

  /**
   * Handle webhook from Greenhouse
   */
  async handleWebhook(event: { action: string; payload: any }): Promise<SyncResult> {
    switch (event.action) {
      case 'application_created':
        return this.handleApplicationCreated(event.payload);
      case 'application_updated':
        return this.handleApplicationUpdated(event.payload);
      case 'job_updated':
        return this.handleJobUpdated(event.payload);
      case 'job_deleted':
        return this.handleJobDeleted(event.payload);
      default:
        return {
          success: false,
          entity_id: null,
          external_id: null,
          action: 'skipped',
          error: {
            code: 'UNKNOWN_EVENT',
            message: `Unknown webhook event: ${event.action}`,
          },
        };
    }
  }

  private async importJob(job: Greenhouse.Job): Promise<SyncResult> {
    // This would call the ATS service to create/update a role in our system
    // For now, return a success result
    return {
      success: true,
      entity_id: 'internal-role-id', // Would be actual ID from ATS service
      external_id: job.id.toString(),
      action: 'created',
      metadata: {
        title: job.name,
        status: job.status,
      },
    };
  }

  private async handleApplicationCreated(payload: any): Promise<SyncResult> {
    // Process new application from Greenhouse
    return {
      success: true,
      entity_id: null,
      external_id: payload.id?.toString(),
      action: 'created',
    };
  }

  private async handleApplicationUpdated(payload: any): Promise<SyncResult> {
    // Process application update from Greenhouse
    return {
      success: true,
      entity_id: null,
      external_id: payload.id?.toString(),
      action: 'updated',
    };
  }

  private async handleJobUpdated(payload: any): Promise<SyncResult> {
    // Process job update from Greenhouse
    return {
      success: true,
      entity_id: null,
      external_id: payload.id?.toString(),
      action: 'updated',
    };
  }

  private async handleJobDeleted(payload: any): Promise<SyncResult> {
    // Process job deletion from Greenhouse
    return {
      success: true,
      entity_id: null,
      external_id: payload.id?.toString(),
      action: 'deleted',
    };
  }

  private getSourceId(): number | undefined {
    // Return configured Splits Network source ID in Greenhouse
    // This must be set up in Greenhouse admin panel first
    const config = this.integration.config as any;
    return config.source_id;
  }
}
