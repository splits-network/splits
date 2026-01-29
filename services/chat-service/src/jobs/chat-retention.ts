import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { loadBaseConfig, loadDatabaseConfig, loadRedisConfig } from '@splits-network/shared-config';
import { createLogger } from '@splits-network/shared-logging';
import { ChatEventPublisher } from '../v2/chat/events';
import { ChatStorageClient } from '../v2/chat/storage';

type RetentionConfig = {
    message_retention_days: number;
    attachment_retention_days: number;
    audit_retention_days: number;
};

const BATCH_SIZE = 200;

async function main() {
    const baseConfig = loadBaseConfig('chat-service');
    const dbConfig = loadDatabaseConfig();
    const redisConfig = loadRedisConfig();

    const logger = createLogger({
        serviceName: `${baseConfig.serviceName}-retention`,
        level: baseConfig.nodeEnv === 'development' ? 'debug' : 'info',
        prettyPrint: baseConfig.nodeEnv === 'development',
    });

    const supabase: SupabaseClient<any> = createClient(
        dbConfig.supabaseUrl,
        dbConfig.supabaseServiceRoleKey || dbConfig.supabaseAnonKey
    );

    const eventPublisher = new ChatEventPublisher(redisConfig, logger);
    const bucket = process.env.CHAT_ATTACHMENTS_BUCKET || 'chat-attachments';
    const storage = new ChatStorageClient(
        dbConfig.supabaseUrl,
        dbConfig.supabaseServiceRoleKey || dbConfig.supabaseAnonKey,
        bucket
    );

    const run = await supabase
        .from('chat_retention_runs')
        .insert({ status: 'running' })
        .select()
        .single();

    if (run.error) {
        throw run.error;
    }

    try {
        const config = await loadRetentionConfig(supabase);
        const now = new Date();

        const messageCutoff = new Date(now.getTime() - config.message_retention_days * 86400000);
        const attachmentCutoff = new Date(now.getTime() - config.attachment_retention_days * 86400000);
        const auditCutoff = new Date(now.getTime() - config.audit_retention_days * 86400000);

        const messagesRedacted = await redactOldMessages(supabase, eventPublisher, messageCutoff, logger);
        const attachmentsDeleted = await deleteOldAttachments(supabase, storage, eventPublisher, attachmentCutoff, logger);
        const auditsArchived = await purgeOldAudits(supabase, auditCutoff, logger);

        await supabase
            .from('chat_retention_runs')
            .update({
                status: 'completed',
                completed_at: new Date().toISOString(),
                messages_redacted: messagesRedacted,
                attachments_deleted: attachmentsDeleted,
                audits_archived: auditsArchived,
            })
            .eq('id', run.data.id);
    } catch (error: any) {
        logger.error({ error }, 'Retention job failed');
        await supabase
            .from('chat_retention_runs')
            .update({
                status: 'failed',
                completed_at: new Date().toISOString(),
                error: error?.message || 'Unknown error',
            })
            .eq('id', run.data.id);
        throw error;
    }
}

async function loadRetentionConfig(supabase: SupabaseClient<any>): Promise<RetentionConfig> {
    const { data, error } = await supabase
        .from('chat_retention_config')
        .select('message_retention_days, attachment_retention_days, audit_retention_days')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error || !data) {
        return {
            message_retention_days: 730,
            attachment_retention_days: 365,
            audit_retention_days: 1095,
        };
    }

    return data as RetentionConfig;
}

async function redactOldMessages(
    supabase: SupabaseClient<any>,
    eventPublisher: ChatEventPublisher,
    cutoff: Date,
    logger: ReturnType<typeof createLogger>
): Promise<number> {
    let total = 0;

    while (true) {
        const { data, error } = await supabase
            .from('chat_messages')
            .select('id, conversation_id')
            .lt('created_at', cutoff.toISOString())
            .is('redacted_at', null)
            .limit(BATCH_SIZE);

        if (error) {
            throw error;
        }

        if (!data || data.length === 0) {
            break;
        }

        const ids = data.map((row) => row.id);
        const { error: updateError } = await supabase
            .from('chat_messages')
            .update({
                body: null,
                redacted_at: new Date().toISOString(),
                redaction_reason: 'retention',
            })
            .in('id', ids);

        if (updateError) {
            throw updateError;
        }

        for (const row of data) {
            await eventPublisher.publishToConversation(row.conversation_id, {
                type: 'message.updated',
                eventVersion: 1,
                serverTime: new Date().toISOString(),
                data: {
                    messageId: row.id,
                    conversationId: row.conversation_id,
                },
            });
        }

        total += data.length;
        logger.info({ count: data.length }, 'Redacted messages batch');
    }

    return total;
}

async function deleteOldAttachments(
    supabase: SupabaseClient<any>,
    storage: ChatStorageClient,
    eventPublisher: ChatEventPublisher,
    cutoff: Date,
    logger: ReturnType<typeof createLogger>
): Promise<number> {
    let total = 0;

    while (true) {
        const { data, error } = await supabase
            .from('chat_attachments')
            .select('id, conversation_id, storage_key')
            .lt('created_at', cutoff.toISOString())
            .neq('status', 'deleted')
            .limit(BATCH_SIZE);

        if (error) {
            throw error;
        }

        if (!data || data.length === 0) {
            break;
        }

        for (const attachment of data) {
            try {
                await storage.removeFile(attachment.storage_key);
            } catch (err) {
                logger.warn({ err, attachmentId: attachment.id }, 'Failed to delete attachment blob');
            }

            const { error: updateError } = await supabase
                .from('chat_attachments')
                .update({
                    status: 'deleted',
                    updated_at: new Date().toISOString(),
                })
                .eq('id', attachment.id);

            if (updateError) {
                throw updateError;
            }

            await eventPublisher.publishToConversation(attachment.conversation_id, {
                type: 'attachment.updated',
                eventVersion: 1,
                serverTime: new Date().toISOString(),
                data: {
                    attachmentId: attachment.id,
                    status: 'deleted',
                },
            });
        }

        total += data.length;
        logger.info({ count: data.length }, 'Deleted attachments batch');
    }

    return total;
}

async function purgeOldAudits(
    supabase: SupabaseClient<any>,
    cutoff: Date,
    logger: ReturnType<typeof createLogger>
): Promise<number> {
    const { data, error } = await supabase
        .from('chat_moderation_audit')
        .select('id')
        .lt('created_at', cutoff.toISOString());

    if (error) {
        throw error;
    }

    const ids = data?.map((row) => row.id) || [];
    if (ids.length === 0) {
        return 0;
    }

    const { error: deleteError } = await supabase
        .from('chat_moderation_audit')
        .delete()
        .in('id', ids);

    if (deleteError) {
        throw deleteError;
    }

    logger.info({ count: ids.length }, 'Purged moderation audit rows');
    return ids.length;
}

main();
