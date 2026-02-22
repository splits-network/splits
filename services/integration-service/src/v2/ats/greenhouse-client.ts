import { Logger } from '@splits-network/shared-logging';
import { Greenhouse } from '@splits-network/shared-types';

/**
 * Greenhouse Harvest API client.
 * Auth: Basic auth with API key as username, empty password.
 * Docs: https://developers.greenhouse.io/harvest.html
 */
export class GreenhouseClient {
    private baseUrl: string;

    constructor(
        private apiKey: string,
        private logger: Logger,
        baseUrl?: string,
    ) {
        this.baseUrl = baseUrl || 'https://harvest.greenhouse.io/v1';
    }

    /* ── Jobs ─────────────────────────────────────────────────────────── */

    async listJobs(opts: { page?: number; per_page?: number; status?: string } = {}): Promise<Greenhouse.Job[]> {
        const params = new URLSearchParams();
        if (opts.page) params.set('page', String(opts.page));
        if (opts.per_page) params.set('per_page', String(opts.per_page));
        if (opts.status) params.set('status', opts.status);
        return this.request(`/jobs?${params}`);
    }

    async getJob(jobId: number): Promise<Greenhouse.Job> {
        return this.request(`/jobs/${jobId}`);
    }

    /* ── Candidates ───────────────────────────────────────────────────── */

    async listCandidates(opts: { page?: number; per_page?: number; updated_after?: string } = {}): Promise<Greenhouse.Candidate[]> {
        const params = new URLSearchParams();
        if (opts.page) params.set('page', String(opts.page));
        if (opts.per_page) params.set('per_page', String(opts.per_page));
        if (opts.updated_after) params.set('updated_after', opts.updated_after);
        return this.request(`/candidates?${params}`);
    }

    async getCandidate(candidateId: number): Promise<Greenhouse.Candidate> {
        return this.request(`/candidates/${candidateId}`);
    }

    async createCandidate(data: {
        first_name: string;
        last_name: string;
        emails: Array<{ value: string; type: string }>;
        phone_numbers?: Array<{ value: string; type: string }>;
    }): Promise<Greenhouse.Candidate> {
        return this.request('/candidates', 'POST', data);
    }

    /* ── Applications ─────────────────────────────────────────────────── */

    async listApplications(opts: { page?: number; per_page?: number; job_id?: number } = {}): Promise<Greenhouse.Application[]> {
        const params = new URLSearchParams();
        if (opts.page) params.set('page', String(opts.page));
        if (opts.per_page) params.set('per_page', String(opts.per_page));
        if (opts.job_id) params.set('job_id', String(opts.job_id));
        return this.request(`/applications?${params}`);
    }

    async getApplication(applicationId: number): Promise<Greenhouse.Application> {
        return this.request(`/applications/${applicationId}`);
    }

    async addCandidateToJob(candidateId: number, jobId: number, sourceId?: number): Promise<any> {
        return this.request(`/candidates/${candidateId}/applications`, 'POST', {
            job_id: jobId,
            source_id: sourceId,
        });
    }

    /* ── Stages ───────────────────────────────────────────────────────── */

    async listJobStages(jobId: number): Promise<Array<{ id: number; name: string; priority: number }>> {
        return this.request(`/jobs/${jobId}/stages`);
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
            throw new Error(`Greenhouse API error (${res.status}): ${text}`);
        }

        // Handle 204 No Content
        if (res.status === 204) return null;

        return res.json();
    }
}
