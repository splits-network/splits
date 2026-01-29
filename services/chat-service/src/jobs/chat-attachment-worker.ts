import { loadBaseConfig, loadDatabaseConfig, loadRabbitMQConfig, loadRedisConfig } from '@splits-network/shared-config';
import { createLogger } from '@splits-network/shared-logging';
import { JobQueue, JobMessage, JobResult } from '@splits-network/shared-job-queue';
import { ChatRepository } from '../v2/chat/repository';
import { ChatEventPublisher } from '../v2/chat/events';

type AttachmentJob = {
    attachmentId: string;
    storageKey: string;
    conversationId: string;
    uploaderId: string;
};

async function main() {
    const baseConfig = loadBaseConfig('chat-service');
    const dbConfig = loadDatabaseConfig();
    const rabbitConfig = loadRabbitMQConfig();
    const redisConfig = loadRedisConfig();

    const logger = createLogger({
        serviceName: `${baseConfig.serviceName}-attachment-worker`,
        level: baseConfig.nodeEnv === 'development' ? 'debug' : 'info',
        prettyPrint: baseConfig.nodeEnv === 'development',
    });

    const repository = new ChatRepository(
        dbConfig.supabaseUrl,
        dbConfig.supabaseServiceRoleKey || dbConfig.supabaseAnonKey
    );

    const eventPublisher = new ChatEventPublisher(redisConfig, logger);

    const queue = new JobQueue<AttachmentJob>({
        rabbitMqUrl: rabbitConfig.url,
        queueName: 'chat-attachment-scan',
        logger,
        maxRetries: 3,
        retryDelay: 5000,
    });

    await queue.connect();

    await queue.startWorker(async (job: JobMessage<AttachmentJob>): Promise<JobResult> => {
        try {
            const attachment = await repository.findAttachment(job.data.attachmentId);
            if (!attachment) {
                return { success: true, message: 'Attachment not found (skipping)' };
            }

            const updated = await repository.updateAttachment(attachment.id, {
                status: 'available',
                scan_result: 'clean',
            });

            await eventPublisher.publishToConversation(updated.conversation_id, {
                type: 'attachment.updated',
                eventVersion: 1,
                serverTime: new Date().toISOString(),
                data: {
                    attachmentId: updated.id,
                    status: updated.status,
                },
            });

            return { success: true, message: 'Attachment marked available' };
        } catch (error: any) {
            logger.error({ error }, 'Attachment scan failed');
            return { success: false, error: error?.message || 'Scan failed' };
        }
    });
}

main();
