import { Logger } from '@splits-network/shared-logging';

/* ── Gmail API Types ─────────────────────────────────────────────────── */

export interface GmailMessage {
    id: string;
    threadId: string;
    labelIds?: string[];
    snippet: string;
    internalDate: string;
    payload: {
        headers: Array<{ name: string; value: string }>;
        mimeType: string;
        body?: { size: number; data?: string };
        parts?: Array<{
            mimeType: string;
            body?: { size: number; data?: string };
        }>;
    };
}

export interface GmailThread {
    id: string;
    historyId: string;
    messages: GmailMessage[];
}

export interface GmailSendParams {
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    body: string;
    bodyType?: 'text' | 'html';
    inReplyTo?: string;
    threadId?: string;
}

/* ── Client ──────────────────────────────────────────────────────────── */

const BASE_URL = 'https://gmail.googleapis.com/gmail/v1';

export class GmailClient {
    constructor(private logger: Logger) {}

    /**
     * List messages matching a query.
     */
    async listMessages(
        accessToken: string,
        opts: { query?: string; maxResults?: number; pageToken?: string } = {},
    ): Promise<{ messages: Array<{ id: string; threadId: string }>; nextPageToken?: string }> {
        const params = new URLSearchParams();
        if (opts.query) params.set('q', opts.query);
        if (opts.maxResults) params.set('maxResults', String(opts.maxResults));
        if (opts.pageToken) params.set('pageToken', opts.pageToken);

        const res = await this.request(accessToken, `/users/me/messages?${params}`);
        return {
            messages: res.messages ?? [],
            nextPageToken: res.nextPageToken,
        };
    }

    /**
     * Get a single message with full metadata.
     */
    async getMessage(accessToken: string, messageId: string): Promise<GmailMessage> {
        return this.request(accessToken, `/users/me/messages/${messageId}?format=full`);
    }

    /**
     * Get a thread with all messages.
     */
    async getThread(accessToken: string, threadId: string): Promise<GmailThread> {
        return this.request(accessToken, `/users/me/threads/${threadId}?format=full`);
    }

    /**
     * Send an email.
     */
    async sendMessage(accessToken: string, params: GmailSendParams): Promise<GmailMessage> {
        const raw = this.buildRawMessage(params);

        const body: Record<string, any> = { raw };
        if (params.threadId) body.threadId = params.threadId;

        const res = await fetch(`${BASE_URL}/users/me/messages/send`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Gmail send failed (${res.status}): ${text}`);
        }

        return res.json() as Promise<GmailMessage>;
    }

    /* ── Private ─────────────────────────────────────────────────────── */

    private buildRawMessage(params: GmailSendParams): string {
        const contentType = params.bodyType === 'html' ? 'text/html' : 'text/plain';
        const lines = [
            `To: ${params.to.join(', ')}`,
        ];
        if (params.cc?.length) lines.push(`Cc: ${params.cc.join(', ')}`);
        if (params.bcc?.length) lines.push(`Bcc: ${params.bcc.join(', ')}`);
        lines.push(`Subject: ${params.subject}`);
        if (params.inReplyTo) {
            lines.push(`In-Reply-To: ${params.inReplyTo}`);
            lines.push(`References: ${params.inReplyTo}`);
        }
        lines.push(`Content-Type: ${contentType}; charset="UTF-8"`);
        lines.push('');
        lines.push(params.body);

        const raw = lines.join('\r\n');
        return Buffer.from(raw).toString('base64url');
    }

    private async request(accessToken: string, path: string): Promise<any> {
        const res = await fetch(`${BASE_URL}${path}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Gmail API error (${res.status}): ${text}`);
        }

        return res.json();
    }
}
