import { Logger } from '@splits-network/shared-logging';
import { ConnectionRepository } from '../connections/repository';
import { TokenRefreshService } from '../calendar/token-refresh';
import { GmailClient, GmailMessage } from './gmail-client';
import { MicrosoftMailClient, MicrosoftMailMessage } from './microsoft-mail-client';
import type { EmailMessage, EmailThread, EmailListResponse } from '@splits-network/shared-types';

/* ── Unified send params ─────────────────────────────────────────────── */

export interface SendEmailParams {
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    body: string;
    bodyType?: 'text' | 'html';
    inReplyTo?: string;
    threadId?: string;
}

/* ── Service ─────────────────────────────────────────────────────────── */

export class EmailService {
    private gmailClient: GmailClient;
    private microsoftClient: MicrosoftMailClient;

    constructor(
        private connectionRepo: ConnectionRepository,
        private tokenRefresh: TokenRefreshService,
        private logger: Logger,
    ) {
        this.gmailClient = new GmailClient(logger);
        this.microsoftClient = new MicrosoftMailClient(logger);
    }

    /**
     * List messages — returns lightweight references for pagination.
     */
    async listMessages(
        connectionId: string,
        clerkUserId: string,
        opts: { query?: string; maxResults?: number; pageToken?: string } = {},
    ): Promise<EmailListResponse> {
        const connection = await this.authorize(connectionId, clerkUserId);
        const token = await this.tokenRefresh.getValidToken(connectionId);

        if (connection.provider_slug.startsWith('google_')) {
            const res = await this.gmailClient.listMessages(token, {
                query: opts.query,
                maxResults: opts.maxResults,
                pageToken: opts.pageToken,
            });
            return {
                messages: res.messages.map(m => ({ id: m.id, threadId: m.threadId })),
                next_page_token: res.nextPageToken,
            };
        }

        if (connection.provider_slug.startsWith('microsoft_')) {
            const skip = opts.pageToken ? parseInt(opts.pageToken, 10) : undefined;
            const res = await this.microsoftClient.listMessages(token, {
                query: opts.query,
                maxResults: opts.maxResults,
                skip,
            });
            // Microsoft doesn't have threadId in list response — use conversationId
            return {
                messages: res.messages.map(m => ({ id: m.id, threadId: m.conversationId })),
                next_page_token: res.nextLink
                    ? String((skip ?? 0) + (opts.maxResults ?? 25))
                    : undefined,
            };
        }

        throw new Error(`Unsupported email provider: ${connection.provider_slug}`);
    }

    /**
     * Get a single message — fully normalized.
     */
    async getMessage(
        connectionId: string,
        clerkUserId: string,
        messageId: string,
    ): Promise<EmailMessage> {
        const connection = await this.authorize(connectionId, clerkUserId);
        const token = await this.tokenRefresh.getValidToken(connectionId);

        if (connection.provider_slug.startsWith('google_')) {
            const msg = await this.gmailClient.getMessage(token, messageId);
            return this.normalizeGmail(msg);
        }

        if (connection.provider_slug.startsWith('microsoft_')) {
            const msg = await this.microsoftClient.getMessage(token, messageId);
            return this.normalizeMicrosoft(msg);
        }

        throw new Error(`Unsupported email provider: ${connection.provider_slug}`);
    }

    /**
     * Get a full thread by thread/conversation ID.
     */
    async getThread(
        connectionId: string,
        clerkUserId: string,
        threadId: string,
    ): Promise<EmailThread> {
        const connection = await this.authorize(connectionId, clerkUserId);
        const token = await this.tokenRefresh.getValidToken(connectionId);

        if (connection.provider_slug.startsWith('google_')) {
            const thread = await this.gmailClient.getThread(token, threadId);
            return {
                id: thread.id,
                messages: thread.messages.map(m => this.normalizeGmail(m)),
            };
        }

        if (connection.provider_slug.startsWith('microsoft_')) {
            const messages = await this.microsoftClient.getThread(token, threadId);
            return {
                id: threadId,
                messages: messages.map(m => this.normalizeMicrosoft(m)),
            };
        }

        throw new Error(`Unsupported email provider: ${connection.provider_slug}`);
    }

    /**
     * Send an email.
     */
    async sendMessage(
        connectionId: string,
        clerkUserId: string,
        params: SendEmailParams,
    ): Promise<EmailMessage | null> {
        const connection = await this.authorize(connectionId, clerkUserId);
        const token = await this.tokenRefresh.getValidToken(connectionId);

        if (connection.provider_slug.startsWith('google_')) {
            const sent = await this.gmailClient.sendMessage(token, {
                to: params.to,
                cc: params.cc,
                bcc: params.bcc,
                subject: params.subject,
                body: params.body,
                bodyType: params.bodyType,
                inReplyTo: params.inReplyTo,
                threadId: params.threadId,
            });

            await this.connectionRepo.update(connectionId, {
                last_synced_at: new Date().toISOString(),
            });

            // Fetch the full sent message
            const full = await this.gmailClient.getMessage(token, sent.id);
            return this.normalizeGmail(full);
        }

        if (connection.provider_slug.startsWith('microsoft_')) {
            if (params.inReplyTo) {
                // Reply to existing message
                await this.microsoftClient.replyToMessage(token, params.inReplyTo, params.body);
            } else {
                await this.microsoftClient.sendMessage(token, {
                    to: params.to,
                    cc: params.cc,
                    bcc: params.bcc,
                    subject: params.subject,
                    body: params.body,
                    bodyType: params.bodyType,
                });
            }

            await this.connectionRepo.update(connectionId, {
                last_synced_at: new Date().toISOString(),
            });

            // Microsoft sendMail doesn't return the sent message
            return null;
        }

        throw new Error(`Unsupported email provider: ${connection.provider_slug}`);
    }

    /* ── Private ───────────────────────────────────────────────────────── */

    private async authorize(connectionId: string, clerkUserId: string) {
        const connection = await this.connectionRepo.findById(connectionId);
        if (!connection) throw new Error('Connection not found');
        if (connection.clerk_user_id !== clerkUserId) throw new Error('Unauthorized');
        if (connection.status !== 'active') throw new Error(`Connection is ${connection.status}`);
        return connection;
    }

    private normalizeGmail(msg: GmailMessage): EmailMessage {
        const getHeader = (name: string) =>
            msg.payload.headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value;

        const from = getHeader('From');
        const to = getHeader('To');
        const cc = getHeader('Cc');

        // Extract body
        let bodyText: string | undefined;
        let bodyHtml: string | undefined;

        if (msg.payload.parts) {
            for (const part of msg.payload.parts) {
                if (part.mimeType === 'text/plain' && part.body?.data) {
                    bodyText = Buffer.from(part.body.data, 'base64url').toString();
                }
                if (part.mimeType === 'text/html' && part.body?.data) {
                    bodyHtml = Buffer.from(part.body.data, 'base64url').toString();
                }
            }
        } else if (msg.payload.body?.data) {
            if (msg.payload.mimeType === 'text/html') {
                bodyHtml = Buffer.from(msg.payload.body.data, 'base64url').toString();
            } else {
                bodyText = Buffer.from(msg.payload.body.data, 'base64url').toString();
            }
        }

        return {
            id: msg.id,
            threadId: msg.threadId,
            subject: getHeader('Subject'),
            snippet: msg.snippet,
            from: from ? this.parseEmailAddress(from) : undefined,
            to: to ? this.parseEmailAddresses(to) : [],
            cc: cc ? this.parseEmailAddresses(cc) : undefined,
            date: new Date(parseInt(msg.internalDate, 10)).toISOString(),
            isRead: !(msg.labelIds?.includes('UNREAD') ?? false),
            hasAttachments: msg.payload.parts?.some(p => p.mimeType?.startsWith('application/') || p.mimeType?.startsWith('image/')) ?? false,
            bodyText,
            bodyHtml,
        };
    }

    private normalizeMicrosoft(msg: MicrosoftMailMessage): EmailMessage {
        return {
            id: msg.id,
            threadId: msg.conversationId,
            subject: msg.subject,
            snippet: msg.bodyPreview,
            from: msg.from ? { name: msg.from.emailAddress.name, email: msg.from.emailAddress.address } : undefined,
            to: msg.toRecipients.map(r => ({ name: r.emailAddress.name, email: r.emailAddress.address })),
            cc: msg.ccRecipients?.map(r => ({ name: r.emailAddress.name, email: r.emailAddress.address })),
            date: msg.receivedDateTime,
            isRead: msg.isRead,
            hasAttachments: msg.hasAttachments,
            bodyText: msg.body.contentType === 'Text' ? msg.body.content : undefined,
            bodyHtml: msg.body.contentType === 'HTML' ? msg.body.content : undefined,
            webLink: msg.webLink,
        };
    }

    private parseEmailAddress(raw: string): { name?: string; email: string } {
        const match = raw.match(/^"?([^"<]*)"?\s*<([^>]+)>/);
        if (match) return { name: match[1].trim() || undefined, email: match[2] };
        return { email: raw.trim() };
    }

    private parseEmailAddresses(raw: string): Array<{ name?: string; email: string }> {
        return raw.split(',').map(addr => this.parseEmailAddress(addr.trim()));
    }
}
