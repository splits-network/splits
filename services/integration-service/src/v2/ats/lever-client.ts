import { Logger } from '@splits-network/shared-logging';
import { Lever } from '@splits-network/shared-types';

/**
 * Lever API client.
 * Auth: Basic auth with API key as username, empty password.
 * Docs: https://hire.lever.co/developer/documentation
 */
export class LeverClient {
    private baseUrl: string;

    constructor(
        private apiKey: string,
        private logger: Logger,
        environment: 'sandbox' | 'production' = 'production',
    ) {
        this.baseUrl = environment === 'sandbox'
            ? 'https://api.sandbox.lever.co/v1'
            : 'https://api.lever.co/v1';
    }

    /* ── Postings (Jobs) ──────────────────────────────────────────────── */

    async listPostings(opts: { limit?: number; offset?: string; state?: string } = {}): Promise<{ data: Lever.Posting[]; next?: string }> {
        const params = new URLSearchParams();
        if (opts.limit) params.set('limit', String(opts.limit));
        if (opts.offset) params.set('offset', opts.offset);
        if (opts.state) params.set('state', opts.state);
        return this.request(`/postings?${params}`);
    }

    async getPosting(postingId: string): Promise<Lever.Posting> {
        return this.request(`/postings/${postingId}`);
    }

    /* ── Opportunities (Candidates) ───────────────────────────────────── */

    async listOpportunities(opts: { limit?: number; offset?: string; updated_at_start?: number } = {}): Promise<{ data: Lever.Opportunity[]; next?: string }> {
        const params = new URLSearchParams();
        if (opts.limit) params.set('limit', String(opts.limit));
        if (opts.offset) params.set('offset', opts.offset);
        if (opts.updated_at_start) params.set('updated_at_start', String(opts.updated_at_start));
        return this.request(`/opportunities?${params}`);
    }

    async getOpportunity(opportunityId: string): Promise<Lever.Opportunity> {
        return this.request(`/opportunities/${opportunityId}`);
    }

    async createOpportunity(data: {
        name: string;
        emails: string[];
        phones?: Array<{ type: string; value: string }>;
        postings?: string[];
        stage?: string;
        sources?: string[];
    }): Promise<Lever.Opportunity> {
        return this.request('/opportunities', 'POST', data);
    }

    /* ── Applications ─────────────────────────────────────────────────── */

    async listApplications(opportunityId: string): Promise<Lever.Application[]> {
        const res = await this.request(`/opportunities/${opportunityId}/applications`);
        return res.data ?? res;
    }

    /* ── Stages ───────────────────────────────────────────────────────── */

    async listStages(): Promise<Array<{ id: string; text: string }>> {
        const res = await this.request('/stages');
        return res.data ?? res;
    }

    /* ── Private ──────────────────────────────────────────────────────── */

    private async request(path: string, method: string = 'GET', body?: any): Promise<any> {
        const auth = Buffer.from(`${this.apiKey}:`).toString('base64');

        const opts: RequestInit = {
            method,
            headers: {
                Authorization: `Basic ${auth}`,
                'Content-Type': 'application/json',
            },
        };

        if (body) opts.body = JSON.stringify(body);

        const res = await fetch(`${this.baseUrl}${path}`, opts);

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Lever API error (${res.status}): ${text}`);
        }

        if (res.status === 204) return null;
        return res.json();
    }
}
