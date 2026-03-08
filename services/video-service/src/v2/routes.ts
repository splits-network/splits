import { FastifyInstance } from 'fastify';
import { createClient } from '@supabase/supabase-js';
import { IEventPublisher } from './shared/events';
import { registerInterviewRoutes } from './interviews/routes';
import { registerRecordingRoutes } from './interviews/recording-routes';
import { registerRecordingWebhook } from './interviews/recording-webhook';
import { RecordingService } from './interviews/recording-service';
import { InterviewRepository } from './interviews/repository';
import { TokenService } from './interviews/token-service';

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
    const repository = new InterviewRepository(config.supabaseUrl, config.supabaseKey);
    const tokenService = new TokenService(repository, config.livekitApiKey, config.livekitApiSecret);
    const supabase = createClient(config.supabaseUrl, config.supabaseKey);

    await registerInterviewRoutes(app, {
        supabaseUrl: config.supabaseUrl,
        supabaseKey: config.supabaseKey,
        eventPublisher: config.eventPublisher,
        livekitApiKey: config.livekitApiKey,
        livekitApiSecret: config.livekitApiSecret,
    });

    const recordingService = new RecordingService(
        repository,
        config.livekitApiKey,
        config.livekitApiSecret,
        config.livekitWsUrl,
        {
            endpoint: config.supabaseS3Endpoint,
            region: config.supabaseS3Region,
            accessKey: config.supabaseS3AccessKey,
            secretKey: config.supabaseS3SecretKey,
            bucket: config.supabaseS3Bucket,
        },
    );

    await registerRecordingRoutes(app, {
        repository,
        recordingService,
        tokenService,
        supabase,
    });
    await registerRecordingWebhook(app, {
        recordingService,
        eventPublisher: config.eventPublisher,
        livekitApiKey: config.livekitApiKey,
        livekitApiSecret: config.livekitApiSecret,
    });
}
