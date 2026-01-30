import amqp, { Channel, Connection, ConsumeMessage } from 'amqplib';
import Redis from 'ioredis';
import { loadBaseConfig, loadDatabaseConfig, loadRabbitMQConfig, loadRedisConfig } from '@splits-network/shared-config';
import { createLogger } from '@splits-network/shared-logging';
import { ChatRepository } from '../v2/chat/repository';
import { ChatEventPublisher } from '../v2/chat/events';

type DomainEvent = {
    event_type: string;
    payload: Record<string, any>;
};

const DEFAULT_WINDOW_SECONDS = 60;
const DEFAULT_THRESHOLD = 5;

async function main() {
    const baseConfig = loadBaseConfig('chat-service');
    const dbConfig = loadDatabaseConfig();
    const rabbitConfig = loadRabbitMQConfig();
    const redisConfig = loadRedisConfig();

    const logger = createLogger({
        serviceName: `${baseConfig.serviceName}-moderation-worker`,
        level: baseConfig.nodeEnv === 'development' ? 'debug' : 'info',
        prettyPrint: baseConfig.nodeEnv === 'development',
    });

    const repository = new ChatRepository(
        dbConfig.supabaseUrl,
        dbConfig.supabaseServiceRoleKey || dbConfig.supabaseAnonKey
    );

    const eventPublisher = new ChatEventPublisher(redisConfig, logger);

    const redis = new Redis({
        host: redisConfig.host,
        port: redisConfig.port,
        password: redisConfig.password,
    });

    const windowSeconds = Number(process.env.CHAT_MODERATION_WINDOW_SECONDS || DEFAULT_WINDOW_SECONDS);
    const threshold = Number(process.env.CHAT_MODERATION_THRESHOLD || DEFAULT_THRESHOLD);

    let connection: Connection | null = null;
    let channel: Channel | null = null;

    try {
        connection = await amqp.connect(rabbitConfig.url) as any;
        channel = await (connection as any).createChannel();
        if (!channel) throw new Error('Failed to create channel');

        const exchange = 'splits-network-events';
        const queueName = 'chat-moderation-worker-queue';
        await channel.assertExchange(exchange, 'topic', { durable: true });
        await channel.assertQueue(queueName, { durable: true });
        await channel.bindQueue(queueName, exchange, 'chat.message.created');

        logger.info('Chat moderation worker connected to RabbitMQ');

        await channel.consume(
            queueName,
            async (msg: ConsumeMessage | null) => {
                if (!msg) return;
                try {
                    const event: DomainEvent = JSON.parse(msg.content.toString());
                    if (event.event_type !== 'chat.message.created') {
                        channel!.ack(msg);
                        return;
                    }

                    const senderId = event.payload?.sender_user_id as string | undefined;
                    const messageId = event.payload?.message_id as string | undefined;
                    const conversationId = event.payload?.conversation_id as string | undefined;

                    if (!senderId || !messageId) {
                        channel!.ack(msg);
                        return;
                    }

                    const key = `chat:moderation:sender:${senderId}`;
                    const pipeline = redis.multi();
                    pipeline.incr(key);
                    pipeline.expire(key, windowSeconds);
                    const results = await pipeline.exec();
                    const count = Number(results?.[0]?.[1] || 0);

                    if (count >= threshold) {
                        const existing = await repository.getSupabase()
                            .from('chat_messages')
                            .select('metadata')
                            .eq('id', messageId)
                            .maybeSingle();

                        const currentMeta = (existing?.data as any)?.metadata || {};
                        const nextMeta = {
                            ...currentMeta,
                            moderation: {
                                ...(currentMeta?.moderation || {}),
                                flagged: true,
                                reason: 'burst_send',
                                windowSeconds,
                                threshold,
                                count,
                                flaggedAt: new Date().toISOString(),
                            },
                        };

                        await repository.updateMessageMetadata(messageId, nextMeta);

                        if (conversationId) {
                            await eventPublisher.publishToConversation(conversationId, {
                                type: 'message.updated',
                                eventVersion: 1,
                                serverTime: new Date().toISOString(),
                                data: {
                                    messageId,
                                    conversationId,
                                    moderationFlagged: true,
                                },
                            });
                        }

                        logger.warn(
                            { senderId, messageId, count },
                            'Moderation automation flagged message'
                        );
                    }

                    channel!.ack(msg);
                } catch (error: any) {
                    logger.error({ error }, 'Failed to process moderation event');
                    channel!.nack(msg, false, false);
                }
            },
            { noAck: false }
        );

        logger.info('Chat moderation worker consuming events');
    } catch (error: any) {
        logger.error({ error }, 'Chat moderation worker failed to start');
        process.exit(1);
    }
}

main();
