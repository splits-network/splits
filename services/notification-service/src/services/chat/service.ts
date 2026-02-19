import { Resend } from 'resend';
import { Logger } from '@splits-network/shared-logging';
import { NotificationRepository } from '../../repository';

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
        private logger: Logger
    ) {}

    private renderChatEmail(data: ChatMessageEmailData): string {
        const preview = data.preview ? data.preview : 'New message';
        return `
            <html>
                <body style="font-family: Arial, sans-serif; color: #18181b;">
                    <h2 style="color:#18181b;">You have a new message</h2>
                    <p><strong>${data.senderName}</strong> sent you a message:</p>
                    <p style="white-space:pre-line; background:#f4f4f5; padding:12px; border-radius:4px;">${preview}</p>
                    <p>
                        <a href="${data.conversationUrl}" style="color:#233876; text-decoration:underline;">
                            View conversation
                        </a>
                    </p>
                </body>
            </html>
        `.trim();
    }

    async sendNewMessageEmail(data: ChatMessageEmailData): Promise<void> {
        const subject = `New message from ${data.senderName}`;

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
            channel: 'email',
            status: 'pending',
            read: false,
            dismissed: false,
            priority: 'normal',
            category: 'chat',
        });

        try {
            const { data: result, error } = await this.resend.emails.send({
                from: this.fromEmail,
                to: data.recipient,
                subject,
                html: this.renderChatEmail(data),
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
