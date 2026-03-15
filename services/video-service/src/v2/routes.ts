import { FastifyInstance } from 'fastify';
import { createClient } from '@supabase/supabase-js';
import { IEventPublisher } from './shared/events';
import { CallRecordingRepository } from './calls/call-repository';
import { CallRecordingService } from './calls/call-recording-service';
import { registerCallRecordingRoutes } from './calls/call-recording-routes';
import { registerCallRecordingWebhook } from './calls/call-recording-webhook';

interface RegisterConfig {
    supabaseUrl: string;
    supabaseKey: string;
    rabbitMqUrl: string;
    eventPublisher: IEventPublisher;
    livekitApiKey: string;
    livekitApiSecret: string;
    livekitWsUrl: string;
    supabaseS3Endpoint: string;
    supabaseS3Region: string;
    supabaseS3AccessKey: string;
    supabaseS3SecretKey: string;
    supabaseS3Bucket: string;
}

export async function registerV2Routes(app: FastifyInstance, config: RegisterConfig) {
    const supabase = createClient(config.supabaseUrl, config.supabaseKey);

    const s3Config = {
        endpoint: config.supabaseS3Endpoint,
        region: config.supabaseS3Region,
        accessKey: config.supabaseS3AccessKey,
        secretKey: config.supabaseS3SecretKey,
        bucket: config.supabaseS3Bucket,
    };

    // Call recording infrastructure
    const callRecordingRepository = new CallRecordingRepository(supabase);
    const callRecordingService = new CallRecordingService(
        callRecordingRepository,
        config.livekitApiKey,
        config.livekitApiSecret,
        config.livekitWsUrl,
        s3Config,
    );

    await registerCallRecordingRoutes(app, {
        repository: callRecordingRepository,
        recordingService: callRecordingService,
        supabase,
    });

    await registerCallRecordingWebhook(app, {
        callRecordingService,
        callRecordingRepository,
        eventPublisher: config.eventPublisher,
        livekitApiKey: config.livekitApiKey,
        livekitApiSecret: config.livekitApiSecret,
    });
}
