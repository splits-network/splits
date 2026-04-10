import { Resend } from 'resend';
import { Logger } from '@splits-network/shared-logging';
import { NotificationRepository } from '../../repository.js';
import { chatMessageEmail } from '../../templates/chat/index.js';

export interface ChatMessageEmailData {
    recipient: string;
    recipientName: string;
    senderName: string;
    preview?: string | null;
    conversationUrl: string;
    recipientUserId: string;
}

export class ChatEmailService {
    constructor(
        private resend: Resend,
        private repository: NotificationRepository,
        private fromEmail: string,
        private candidateFromEmail: string,
        private logger: Logger
    ) {}

    async sendNewMessageEmail(data: ChatMessageEmailData): Promise<void> {
        const subject = `New message from ${data.senderName}`;

        const effectiveChannel = await this.repository.resolveChannelWithPreferences(data.recipientUserId, 'email', 'chat');
        if (!effectiveChannel) return;

        const log = await this.repository.createNotificationLog({
            event_type: 'chat.message.created',
            recipient_user_id: data.recipientUserId,
            recipient_email: data.recipient,
            subject,
            template: 'chat-message',
            payload: {
                sender_name: data.senderName,
                preview: data.preview,
                url: data.conversationUrl,
            },
            channel: effectiveChannel,
            status: 'pending',
            read: false,
            dismissed: false,
            priority: 'normal',
            category: 'chat',
        });

        try {
            const html = chatMessageEmail({
                senderName: data.senderName,
                recipientName: data.recipientName,
                preview: data.preview,
                conversationUrl: data.conversationUrl,
            });

            const { data: result, error } = await this.resend.emails.send({
                from: this.fromEmail,
                to: data.recipient,
                subject,
                html,
            });

            if (error) {
                throw error;
            }

            await this.repository.updateNotificationLog(log.id, {
                status: 'sent',
                resend_message_id: result?.id,
            });

            this.logger.info(
                { email: data.recipient, subject, message_id: result?.id },
                'Chat notification email sent'
            );
        } catch (error: any) {
            this.logger.error({ email: data.recipient, error }, 'Failed to send chat email');
            await this.repository.updateNotificationLog(log.id, {
                status: 'failed',
                error_message: error?.message || 'Unknown error',
            });
            throw error;
        }
    }
}
