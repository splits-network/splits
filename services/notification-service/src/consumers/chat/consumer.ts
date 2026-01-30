import { Logger } from '@splits-network/shared-logging';
import { NotificationService } from '../../service';
import { NotificationRepository } from '../../repository';
import { ContactLookupHelper } from '../../helpers/contact-lookup';

export interface ChatMessageCreatedEvent {
    conversation_id: string;
    message_id: string;
    sender_user_id: string;
    recipient_user_id: string;
    created_at: string;
    body_preview?: string | null;
}

export class ChatEventConsumer {
    constructor(
        private notificationService: NotificationService,
        private repository: NotificationRepository,
        private contactLookup: ContactLookupHelper,
        private logger: Logger,
        private portalUrl: string,
        private candidateUrl: string
    ) {}

    async handleMessageCreated(payload: ChatMessageCreatedEvent): Promise<void> {
        const recipient = await this.contactLookup.getContactByUserId(payload.recipient_user_id);
        if (!recipient) {
            this.logger.warn({ recipient: payload.recipient_user_id }, 'Chat recipient not found');
            return;
        }

        const participant = await this.repository.supabaseClient
            .from('chat_conversation_participants')
            .select('muted_at, archived_at, request_state')
            .eq('conversation_id', payload.conversation_id)
            .eq('user_id', payload.recipient_user_id)
            .maybeSingle();

        if (!participant.data) {
            return;
        }

        if (participant.data.muted_at || participant.data.archived_at) {
            return;
        }
        if (participant.data.request_state === 'pending' || participant.data.request_state === 'declined') {
            return;
        }

        const sender = await this.contactLookup.getContactByUserId(payload.sender_user_id);
        const senderName = sender?.name || 'Someone';

        const conversationUrl = await this.getConversationUrl(payload.recipient_user_id);

        await this.repository.createNotificationLog({
            event_type: 'chat.message.created',
            recipient_user_id: recipient.id,
            recipient_email: recipient.email,
            subject: `New message from ${senderName}`,
            template: 'chat-message',
            payload: {
                sender_name: senderName,
                preview: payload.body_preview,
                conversation_id: payload.conversation_id,
            },
            channel: 'in_app',
            status: 'sent',
            read: false,
            dismissed: false,
            priority: 'normal',
            category: 'chat',
            action_url: conversationUrl,
            action_label: 'View message',
        });

        const shouldEmail = await this.shouldSendEmail(payload.recipient_user_id);
        if (!shouldEmail) {
            return;
        }

        await this.notificationService.chat.sendNewMessageEmail({
            recipient: recipient.email,
            recipientName: recipient.name,
            senderName,
            preview: payload.body_preview,
            conversationUrl,
            recipientUserId: recipient.id,
        });
    }

    private async shouldSendEmail(recipientUserId: string): Promise<boolean> {
        const { data } = await this.repository.supabaseClient
            .from('notification_log')
            .select('created_at')
            .eq('recipient_user_id', recipientUserId)
            .eq('event_type', 'chat.message.created')
            .in('channel', ['email', 'both'])
            .order('created_at', { ascending: false })
            .limit(1);

        const last = data?.[0]?.created_at;
        if (!last) return true;

        const lastDate = new Date(last);
        const now = new Date();
        const diffMinutes = (now.getTime() - lastDate.getTime()) / (1000 * 60);
        return diffMinutes > 10;
    }

    private async getConversationUrl(recipientUserId: string): Promise<string> {
        const { data } = await this.repository.supabaseClient
            .from('candidates')
            .select('id')
            .eq('user_id', recipientUserId)
            .maybeSingle();

        if (data) {
            return `${this.candidateUrl}/inbox`;
        }

        return `${this.portalUrl}/portal/messages`;
    }
}
