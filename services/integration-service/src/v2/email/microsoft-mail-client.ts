import { Logger } from '@splits-network/shared-logging';

/* ── Microsoft Graph Mail Types ──────────────────────────────────────── */

export interface MicrosoftMailMessage {
    id: string;
    conversationId: string;
    subject?: string;
    bodyPreview: string;
    body: { contentType: string; content: string };
    from?: { emailAddress: { name?: string; address: string } };
    toRecipients: Array<{ emailAddress: { name?: string; address: string } }>;
    ccRecipients?: Array<{ emailAddress: { name?: string; address: string } }>;
    receivedDateTime: string;
    sentDateTime?: string;
    isRead: boolean;
    isDraft: boolean;
    hasAttachments: boolean;
    webLink?: string;
    internetMessageId?: string;
}

export interface MicrosoftMailSendParams {
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    body: string;
    bodyType?: 'text' | 'html';
    inReplyTo?: string; // message ID to reply to
}

/* ── Client ──────────────────────────────────────────────────────────── */

const BASE_URL = 'https://graph.microsoft.com/v1.0';

export class MicrosoftMailClient {
    constructor(private logger: Logger) {}

    /**
     * List messages with optional search/filter.
     */
    async listMessages(
        accessToken: string,
        opts: { query?: string; maxResults?: number; skip?: number } = {},
    ): Promise<{ messages: MicrosoftMailMessage[]; nextLink?: string }> {
        const params = new URLSearchParams({
            $orderby: 'receivedDateTime desc',
            $top: String(opts.maxResults ?? 25),
        });
        if (opts.query) params.set('$search', `"${opts.query}"`);
        if (opts.skip) params.set('$skip', String(opts.skip));

        const res = await this.request(accessToken, `/me/messages?${params}`);
        return {
            messages: res.value ?? [],
            nextLink: res['@odata.nextLink'],
        };
    }

    /**
     * Get a single message.
     */
    async getMessage(accessToken: string, messageId: string): Promise<MicrosoftMailMessage> {
        return this.request(accessToken, `/me/messages/${messageId}`);
    }

    /**
     * Get all messages in a conversation thread.
     */
    async getThread(accessToken: string, conversationId: string): Promise<MicrosoftMailMessage[]> {
        const res = await this.request(
            accessToken,
            `/me/messages?$filter=conversationId eq '${conversationId}'&$orderby=receivedDateTime asc`,
        );
        return res.value ?? [];
    }

    /**
     * Send an email.
     */
    async sendMessage(accessToken: string, params: MicrosoftMailSendParams): Promise<void> {
        const body: Record<string, any> = {
            message: {
                subject: params.subject,
                body: {
                    contentType: params.bodyType === 'html' ? 'HTML' : 'Text',
                    content: params.body,
                },
                toRecipients: params.to.map(email => ({
                    emailAddress: { address: email },
                })),
            },
        };

        if (params.cc?.length) {
            body.message.ccRecipients = params.cc.map(email => ({
                emailAddress: { address: email },
            }));
        }
        if (params.bcc?.length) {
            body.message.bccRecipients = params.bcc.map(email => ({
                emailAddress: { address: email },
            }));
        }

        const url = params.inReplyTo
            ? `/me/messages/${params.inReplyTo}/reply`
            : '/me/sendMail';

        const res = await fetch(`${BASE_URL}${url}`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params.inReplyTo ? { comment: params.body } : body),
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Microsoft sendMail failed (${res.status}): ${text}`);
        }
        // Microsoft sendMail returns 202 with no body
    }

    /**
     * Reply to an existing message.
     */
    async replyToMessage(
        accessToken: string,
        messageId: string,
        comment: string,
    ): Promise<void> {
        const res = await fetch(`${BASE_URL}/me/messages/${messageId}/reply`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ comment }),
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Microsoft reply failed (${res.status}): ${text}`);
        }
    }

    /* ── Private ─────────────────────────────────────────────────────── */

    private async request(accessToken: string, path: string): Promise<any> {
        const res = await fetch(`${BASE_URL}${path}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Microsoft Graph Mail API error (${res.status}): ${text}`);
        }

        return res.json();
    }
}
