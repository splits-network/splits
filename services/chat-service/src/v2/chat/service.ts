import { AccessContextResolver } from '@splits-network/shared-access-context';
import { ChatRepository } from './repository';
import {
    ChatAttachment,
    ChatConversation,
    ChatMessage,
    ChatModerationAudit,
    ChatParticipantState,
    ChatReport,
    CreateConversationInput,
    SendMessageInput,
    ChatConversationListItemWithParticipants,
    ResyncResponseWithParticipants,
} from './types';
import { ChatEventPublisher } from './events';
import { EventPublisher } from '../shared/events';

export class ChatServiceV2 {
    private accessResolver: AccessContextResolver;

    constructor(
        private repository: ChatRepository,
        private eventPublisher?: ChatEventPublisher,
        private domainPublisher?: EventPublisher
    ) {
        this.accessResolver = new AccessContextResolver(this.repository.getSupabase());
    }

    private async requireIdentity(clerkUserId: string) {
        const context = await this.accessResolver.resolve(clerkUserId);
        if (!context.identityUserId) {
            throw new Error('Unable to resolve identity user');
        }
        return {
            ...context,
            identityUserId: context.identityUserId,
        } as Omit<typeof context, 'identityUserId'> & { identityUserId: string };
    }

    private normalizeParticipants(userA: string, userB: string): { a: string; b: string } {
        return userA < userB ? { a: userA, b: userB } : { a: userB, b: userA };
    }

    async createOrFindConversation(clerkUserId: string, input: CreateConversationInput): Promise<ChatConversation> {
        const context = await this.requireIdentity(clerkUserId);
        if (!input.participantUserId || input.participantUserId === context.identityUserId) {
            throw new Error('Invalid participant user id');
        }

        await this.assertContextAccess(context, input.context);

        const { a, b } = this.normalizeParticipants(context.identityUserId, input.participantUserId);
        const existing = await this.repository.findConversation(a, b, {
            application_id: input.context?.application_id,
            job_id: input.context?.job_id,
            company_id: input.context?.company_id,
        });

        if (existing) {
            return existing;
        }

        const conversation = await this.repository.createConversation(a, b, {
            application_id: input.context?.application_id,
            job_id: input.context?.job_id,
            company_id: input.context?.company_id,
        });

        await this.repository.ensureParticipants(conversation.id, [
            {
                user_id: context.identityUserId,
                request_state: 'accepted',
            },
            {
                user_id: input.participantUserId,
                request_state: 'pending',
            },
        ]);

        await this.publishToUser(input.participantUserId, 'conversation.requested', {
            conversationId: conversation.id,
            requestedBy: context.identityUserId,
        });

        return conversation;
    }

    async listConversations(
        clerkUserId: string,
        filter: 'inbox' | 'requests' | 'archived',
        limit: number,
        cursor?: string
    ): Promise<{ data: ChatParticipantState[]; total: number }> {
        const context = await this.requireIdentity(clerkUserId);
        return this.repository.listConversations(context.identityUserId, filter, limit, cursor);
    }

    /**
     * NEW: List conversations with participant details (names, emails) included inline.
     * SECURITY: Prevents frontend from calling unauthorized GET /users/:id endpoint.
     */
    async listConversationsWithParticipants(
        clerkUserId: string,
        filter: 'inbox' | 'requests' | 'archived',
        limit: number,
        cursor?: string
    ): Promise<{ data: ChatConversationListItemWithParticipants[]; total: number }> {
        const context = await this.requireIdentity(clerkUserId);
        return this.repository.listConversationsWithParticipants(context.identityUserId, filter, limit, cursor);
    }

    async listMessages(
        clerkUserId: string,
        conversationId: string,
        after?: string,
        before?: string,
        limit: number = 50
    ): Promise<ChatMessage[]> {
        const context = await this.requireIdentity(clerkUserId);
        await this.ensureParticipant(conversationId, context.identityUserId);
        return this.repository.listMessages(conversationId, after, before, limit);
    }

    async resyncConversation(
        clerkUserId: string,
        conversationId: string,
        after?: string,
        before?: string,
        limit: number = 50
    ): Promise<{
        conversation: ChatConversation;
        participant: ChatParticipantState;
        messages: ChatMessage[];
    }> {
        const context = await this.requireIdentity(clerkUserId);
        const participant = await this.ensureParticipant(conversationId, context.identityUserId);
        const conversation = await this.repository.getConversation(conversationId);
        if (!conversation) {
            throw new Error('Conversation not found');
        }
        const messages = await this.repository.listMessages(conversationId, after, before, limit);

        return {
            conversation,
            participant,
            messages,
        };
    }

    /**
     * NEW: Resync conversation with participant details (names, emails) included inline.
     * SECURITY: Prevents frontend from calling unauthorized GET /users/:id endpoint.
     */
    async resyncConversationWithParticipants(
        clerkUserId: string,
        conversationId: string,
        after?: string,
        before?: string,
        limit: number = 50
    ): Promise<ResyncResponseWithParticipants> {
        const context = await this.requireIdentity(clerkUserId);
        const participant = await this.ensureParticipant(conversationId, context.identityUserId);
        const conversation = await this.repository.getConversationWithParticipants(conversationId);
        if (!conversation) {
            throw new Error('Conversation not found');
        }
        const messages = await this.repository.listMessages(conversationId, after, before, limit);

        return {
            conversation,
            participant,
            messages,
        };
    }

    async sendMessage(
        clerkUserId: string,
        conversationId: string,
        input: SendMessageInput
    ): Promise<ChatMessage> {
        const context = await this.requireIdentity(clerkUserId);
        const senderId = context.identityUserId;

        const participant = await this.ensureParticipant(conversationId, senderId);
        if (participant.request_state === 'pending') {
            throw new Error('Accept this request to reply');
        }
        if (participant.request_state === 'declined') {
            throw new Error('Conversation declined');
        }

        const otherParticipant = await this.findOtherParticipant(conversationId, senderId);
        if (!otherParticipant) {
            throw new Error('Conversation participant missing');
        }

        if (otherParticipant.archived_at) {
            throw new Error('Recipient archived this conversation');
        }

        const blocked = await this.repository.isBlocked(senderId, otherParticipant.user_id);
        if (blocked) {
            throw new Error('Message could not be delivered');
        }

        if (otherParticipant.request_state === 'pending') {
            const existingMessages = await this.repository.listMessages(conversationId, undefined, undefined, 2);
            if (existingMessages.length >= 1) {
                throw new Error('Request pending; cannot send additional messages');
            }
        }
        if (otherParticipant.request_state === 'declined') {
            throw new Error('Conversation declined');
        }

        if (input.attachments && input.attachments.length > 0 && otherParticipant.request_state === 'pending') {
            throw new Error('Attachments not allowed until request accepted');
        }

        try {
            const { data, error } = await this.repository.getSupabase().rpc('chat_send_message', {
                p_conversation_id: conversationId,
                p_sender_id: senderId,
                p_body: input.body ?? null,
                p_client_message_id: input.clientMessageId ?? null,
            });

            if (error) {
                throw error;
            }

            const message = data as ChatMessage;
            await this.publishToConversation(conversationId, 'message.created', {
                conversationId,
                messageId: message.id,
                senderId,
                createdAt: message.created_at,
            });
            await this.publishToUser(otherParticipant.user_id, 'conversation.updated', {
                conversationId,
                lastMessageId: message.id,
                lastMessageAt: message.created_at,
            });
            await this.publishDomainEvent('chat.message.created', {
                conversation_id: conversationId,
                message_id: message.id,
                sender_user_id: senderId,
                recipient_user_id: otherParticipant.user_id,
                created_at: message.created_at,
                body_preview: input.body ? String(input.body).slice(0, 140) : null,
            });

            return message;
        } catch (error: any) {
            if (error?.code === '23505' && input.clientMessageId) {
                const { data } = await this.repository.getSupabase()
                    .from('chat_messages')
                    .select('*')
                    .eq('sender_id', senderId)
                    .eq('client_message_id', input.clientMessageId)
                    .maybeSingle();
                if (data) {
                    return data as ChatMessage;
                }
            }
            throw error;
        }
    }

    async acceptConversation(clerkUserId: string, conversationId: string): Promise<void> {
        const context = await this.requireIdentity(clerkUserId);
        await this.ensureParticipant(conversationId, context.identityUserId);
        await this.repository.updateParticipantState(conversationId, context.identityUserId, {
            request_state: 'accepted',
        });
        const other = await this.findOtherParticipant(conversationId, context.identityUserId);
        if (other) {
            await this.publishToUser(other.user_id, 'conversation.accepted', {
                conversationId,
                acceptedBy: context.identityUserId,
            });
        }
    }

    async declineConversation(clerkUserId: string, conversationId: string): Promise<void> {
        const context = await this.requireIdentity(clerkUserId);
        await this.ensureParticipant(conversationId, context.identityUserId);
        await this.repository.updateParticipantState(conversationId, context.identityUserId, {
            request_state: 'declined',
            archived_at: new Date().toISOString(),
        });
        const other = await this.findOtherParticipant(conversationId, context.identityUserId);
        if (other) {
            await this.publishToUser(other.user_id, 'conversation.declined', {
                conversationId,
                declinedBy: context.identityUserId,
            });
        }
    }

    async muteConversation(clerkUserId: string, conversationId: string, muted: boolean): Promise<void> {
        const context = await this.requireIdentity(clerkUserId);
        await this.ensureParticipant(conversationId, context.identityUserId);
        await this.repository.updateParticipantState(conversationId, context.identityUserId, {
            muted_at: muted ? new Date().toISOString() : null,
        });
        await this.publishToUser(context.identityUserId, 'conversation.updated', {
            conversationId,
            muted,
        });
    }

    async archiveConversation(clerkUserId: string, conversationId: string, archived: boolean): Promise<void> {
        const context = await this.requireIdentity(clerkUserId);
        await this.ensureParticipant(conversationId, context.identityUserId);
        await this.repository.updateParticipantState(conversationId, context.identityUserId, {
            archived_at: archived ? new Date().toISOString() : null,
        });
        await this.publishToUser(context.identityUserId, 'conversation.updated', {
            conversationId,
            archived,
        });
    }

    async updateReadReceipt(
        clerkUserId: string,
        conversationId: string,
        lastReadMessageId?: string | null
    ): Promise<void> {
        const context = await this.requireIdentity(clerkUserId);
        await this.ensureParticipant(conversationId, context.identityUserId);
        const { error } = await this.repository.getSupabase().rpc('chat_mark_read', {
            p_conversation_id: conversationId,
            p_user_id: context.identityUserId,
            p_last_read_message_id: lastReadMessageId ?? null,
        });
        if (error) {
            throw error;
        }
        await this.publishToConversation(conversationId, 'read.receipt', {
            conversationId,
            userId: context.identityUserId,
            lastReadMessageId: lastReadMessageId ?? null,
        });
    }

    async blockUser(clerkUserId: string, blockedUserId: string, reason?: string): Promise<void> {
        const context = await this.requireIdentity(clerkUserId);
        if (context.identityUserId === blockedUserId) {
            throw new Error('Cannot block yourself');
        }
        await this.repository.addBlock(context.identityUserId, blockedUserId, reason);
        await this.publishToUser(context.identityUserId, 'block.created', {
            blockedUserId,
        });
    }

    async unblockUser(clerkUserId: string, blockedUserId: string): Promise<void> {
        const context = await this.requireIdentity(clerkUserId);
        await this.repository.removeBlock(context.identityUserId, blockedUserId);
        await this.publishToUser(context.identityUserId, 'block.removed', {
            blockedUserId,
        });
    }

    async reportConversation(
        clerkUserId: string,
        conversationId: string,
        reportedUserId: string,
        category: string,
        description?: string | null
    ): Promise<void> {
        const context = await this.requireIdentity(clerkUserId);
        await this.ensureParticipant(conversationId, context.identityUserId);

        const evidenceMessages = await this.repository.listMessages(conversationId, undefined, undefined, 20);
        const evidencePointer = JSON.stringify({
            message_ids: evidenceMessages.map((m) => m.id),
        });

        await this.repository.createReport({
            reporter_user_id: context.identityUserId,
            reported_user_id: reportedUserId,
            conversation_id: conversationId,
            category,
            description,
            evidence_pointer: evidencePointer,
        });
    }

    async listReports(
        clerkUserId: string,
        limit: number,
        cursor?: string
    ): Promise<{ data: ChatReport[]; total: number }> {
        const context = await this.requireIdentity(clerkUserId);
        if (!context.isPlatformAdmin) {
            throw new Error('Admin privileges required');
        }
        return this.repository.listReports(limit, cursor);
    }

    async takeReportAction(
        clerkUserId: string,
        reportId: string,
        input: {
            action: ChatModerationAudit['action'];
            status?: ChatReport['status'];
            details?: Record<string, any> | null;
        }
    ): Promise<{ report: ChatReport; audit: ChatModerationAudit }> {
        const context = await this.requireIdentity(clerkUserId);
        if (!context.isPlatformAdmin) {
            throw new Error('Admin privileges required');
        }

        const report = await this.repository.getReport(reportId);
        if (!report) {
            throw new Error('Report not found');
        }

        const audit = await this.repository.createModerationAudit({
            actor_user_id: context.identityUserId,
            target_user_id: report.reported_user_id,
            action: input.action,
            details: input.details ?? null,
        });

        const status = input.status ?? 'resolved';
        const updatedReport = await this.repository.updateReportStatus(reportId, status);

        return {
            report: updatedReport,
            audit,
        };
    }

    async listModerationAudit(
        clerkUserId: string,
        limit: number,
        cursor?: string
    ): Promise<{ data: ChatModerationAudit[]; total: number }> {
        const context = await this.requireIdentity(clerkUserId);
        if (!context.isPlatformAdmin) {
            throw new Error('Admin privileges required');
        }
        return this.repository.listModerationAudit(limit, cursor);
    }

    async getAdminMetrics(clerkUserId: string, rangeDays: number = 7): Promise<{
        rangeDays: number;
        since: string;
        totals: {
            messages: number;
            conversations: number;
            reports: number;
            blocks: number;
            attachments: number;
            attachments_blocked: number;
            redactions: number;
            moderation_actions: number;
        };
        requests: {
            pending: number;
            declined: number;
        };
        retention: {
            last_run_at: string | null;
            last_status: string | null;
            messages_redacted: number;
            attachments_deleted: number;
            audits_archived: number;
        };
    }> {
        const context = await this.requireIdentity(clerkUserId);
        if (!context.isPlatformAdmin) {
            throw new Error('Admin privileges required');
        }
        const safeRange = Number.isFinite(rangeDays) && rangeDays > 0 ? rangeDays : 7;
        return this.repository.getAdminMetrics(safeRange);
    }

    async getReportEvidence(
        clerkUserId: string,
        reportId: string
    ): Promise<{ report: ChatReport; messages: ChatMessage[] }> {
        const context = await this.requireIdentity(clerkUserId);
        if (!context.isPlatformAdmin) {
            throw new Error('Admin privileges required');
        }

        const report = await this.repository.getReport(reportId);
        if (!report) {
            throw new Error('Report not found');
        }

        let messageIds: string[] = [];
        if (report.evidence_pointer) {
            try {
                const parsed = JSON.parse(report.evidence_pointer);
                if (Array.isArray(parsed?.message_ids)) {
                    messageIds = parsed.message_ids.filter((id: any) => typeof id === 'string');
                }
            } catch {
                messageIds = [];
            }
        }

        const messages = await this.repository.listMessagesByIds(messageIds);

        return {
            report,
            messages,
        };
    }

    async createAttachment(
        clerkUserId: string,
        conversationId: string,
        input: {
            file_name: string;
            content_type: string;
            size_bytes: number;
            storage_key: string;
        }
    ): Promise<ChatAttachment> {
        const context = await this.requireIdentity(clerkUserId);
        const participant = await this.ensureParticipant(conversationId, context.identityUserId);
        if (participant.request_state === 'pending') {
            throw new Error('Accept this request to reply');
        }
        if (participant.request_state === 'declined') {
            throw new Error('Conversation declined');
        }
        return this.repository.createAttachment({
            conversation_id: conversationId,
            uploader_id: context.identityUserId,
            file_name: input.file_name,
            content_type: input.content_type,
            size_bytes: input.size_bytes,
            storage_key: input.storage_key,
        });
    }

    async markAttachmentUploaded(
        clerkUserId: string,
        attachmentId: string
    ): Promise<ChatAttachment> {
        const context = await this.requireIdentity(clerkUserId);
        const attachment = await this.repository.findAttachment(attachmentId);
        if (!attachment || attachment.uploader_id !== context.identityUserId) {
            throw new Error('Attachment not found or access denied');
        }
        const updated = await this.repository.updateAttachment(attachmentId, {
            status: 'pending_scan',
        });
        await this.publishToConversation(updated.conversation_id, 'attachment.updated', {
            attachmentId: updated.id,
            status: updated.status,
        });
        return updated;
    }

    async updateMessageRedaction(
        clerkUserId: string,
        messageId: string,
        updates: { redacted: boolean; reason?: string | null; editedBody?: string | null }
    ): Promise<ChatMessage> {
        const context = await this.requireIdentity(clerkUserId);
        if (!context.isPlatformAdmin) {
            throw new Error('Admin privileges required');
        }

        const payload: Record<string, any> = {};
        if (typeof updates.editedBody !== 'undefined') {
            payload.body = updates.editedBody;
            payload.edited_at = new Date().toISOString();
        }
        if (updates.redacted) {
            payload.redacted_at = new Date().toISOString();
            payload.redaction_reason = updates.reason ?? null;
        }

        const { data, error } = await this.repository.getSupabase()
            .from('chat_messages')
            .update(payload)
            .eq('id', messageId)
            .select()
            .single();

        if (error) {
            throw error;
        }
        const message = data as ChatMessage;
        await this.publishToConversation(message.conversation_id, 'message.updated', {
            messageId: message.id,
            conversationId: message.conversation_id,
        });
        return message;
    }

    private async ensureParticipant(conversationId: string, userId: string): Promise<ChatParticipantState> {
        const participant = await this.repository.getParticipantState(conversationId, userId);
        if (!participant) {
            throw new Error('Conversation access denied');
        }
        return participant;
    }

    private async findOtherParticipant(
        conversationId: string,
        userId: string
    ): Promise<ChatParticipantState | null> {
        const { data, error } = await this.repository.getSupabase()
            .from('chat_conversation_participants')
            .select('*')
            .eq('conversation_id', conversationId)
            .neq('user_id', userId)
            .maybeSingle();
        if (error) {
            throw error;
        }
        return data as ChatParticipantState | null;
    }

    private async publishToConversation(conversationId: string, type: string, data: Record<string, any>) {
        if (!this.eventPublisher) return;
        await this.eventPublisher.publishToConversation(conversationId, {
            type,
            eventVersion: 1,
            serverTime: new Date().toISOString(),
            data,
        });
    }

    private async publishToUser(userId: string, type: string, data: Record<string, any>) {
        if (!this.eventPublisher) return;
        await this.eventPublisher.publishToUser(userId, {
            type,
            eventVersion: 1,
            serverTime: new Date().toISOString(),
            data,
        });
    }

    private async publishDomainEvent(eventType: string, payload: Record<string, any>) {
        if (!this.domainPublisher) return;
        await this.domainPublisher.publish(eventType, payload);
    }

    private async assertContextAccess(
        context: Awaited<ReturnType<ChatServiceV2['requireIdentity']>>,
        chatContext?: {
            application_id?: string | null;
            job_id?: string | null;
            company_id?: string | null;
        }
    ): Promise<void> {
        if (!chatContext) {
            return;
        }

        const supabase = this.repository.getSupabase();

        if (chatContext.application_id) {
            const { data: application } = await supabase
                .from('applications')
                .select('candidate_id, recruiter_id, job_id')
                .eq('id', chatContext.application_id)
                .maybeSingle();

            if (!application) {
                throw new Error('Application not found');
            }

            if (context.candidateId && application.candidate_id === context.candidateId) {
                return;
            }

            if (context.recruiterId && application.recruiter_id === context.recruiterId) {
                return;
            }

            if (context.organizationIds.length > 0) {
                const { data: job } = await supabase
                    .from('jobs')
                    .select('company_id')
                    .eq('id', application.job_id)
                    .maybeSingle();
                if (job?.company_id) {
                    const { data: company } = await supabase
                        .from('companies')
                        .select('identity_organization_id')
                        .eq('id', job.company_id)
                        .maybeSingle();
                    if (company?.identity_organization_id && context.organizationIds.includes(company.identity_organization_id)) {
                        return;
                    }
                }
            }

            throw new Error('Not authorized for application context');
        }

        if (chatContext.job_id) {
            const { data: job } = await supabase
                .from('jobs')
                .select('company_id')
                .eq('id', chatContext.job_id)
                .maybeSingle();
            if (!job) {
                throw new Error('Job not found');
            }

            if (context.organizationIds.length > 0) {
                const { data: company } = await supabase
                    .from('companies')
                    .select('identity_organization_id')
                    .eq('id', job.company_id)
                    .maybeSingle();
                if (company?.identity_organization_id && context.organizationIds.includes(company.identity_organization_id)) {
                    return;
                }
            }

            if (context.recruiterId) {
                const { data: assignment } = await supabase
                    .from('role_assignments')
                    .select('id')
                    .eq('job_id', chatContext.job_id)
                    .eq('recruiter_user_id', context.recruiterId)
                    .eq('status', 'active')
                    .maybeSingle();
                if (assignment) {
                    return;
                }
            }

            if (context.candidateId) {
                const { data: application } = await supabase
                    .from('applications')
                    .select('id')
                    .eq('job_id', chatContext.job_id)
                    .eq('candidate_id', context.candidateId)
                    .maybeSingle();
                if (application) {
                    return;
                }
            }

            throw new Error('Not authorized for job context');
        }

        if (chatContext.company_id) {
            if (context.organizationIds.length > 0) {
                const { data: company } = await supabase
                    .from('companies')
                    .select('identity_organization_id')
                    .eq('id', chatContext.company_id)
                    .maybeSingle();
                if (company?.identity_organization_id && context.organizationIds.includes(company.identity_organization_id)) {
                    return;
                }
            }

            if (context.recruiterId) {
                const { data: assignments } = await supabase
                    .from('role_assignments')
                    .select('job_id')
                    .eq('recruiter_user_id', context.recruiterId)
                    .eq('status', 'active');
                if (assignments && assignments.length > 0) {
                    const jobIds = assignments.map((row: any) => row.job_id);
                    const { data: jobs } = await supabase
                        .from('jobs')
                        .select('id, company_id')
                        .in('id', jobIds);
                    if (jobs?.some((row: any) => row.company_id === chatContext.company_id)) {
                        return;
                    }
                }
            }

            throw new Error('Not authorized for company context');
        }
    }
}
