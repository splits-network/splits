import { FastifyInstance } from 'fastify';
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
    azureStorageAccountName: string;
    azureStorageAccountKey: string;
    azureStorageContainerName: string;
}

export async function registerV2Routes(app: FastifyInstance, config: RegisterConfig) {
    const repository = new InterviewRepository(config.supabaseUrl, config.supabaseKey);
    const tokenService = new TokenService(repository, config.livekitApiKey, config.livekitApiSecret);

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
            accountName: config.azureStorageAccountName,
            accountKey: config.azureStorageAccountKey,
            containerName: config.azureStorageContainerName,
        },
    );

    await registerRecordingRoutes(app, {
        repository,
        recordingService,
        tokenService,
        azureConfig: {
            accountName: config.azureStorageAccountName,
            accountKey: config.azureStorageAccountKey,
            containerName: config.azureStorageContainerName,
        },
    });
    await registerRecordingWebhook(app, {
        recordingService,
        eventPublisher: config.eventPublisher,
        livekitApiKey: config.livekitApiKey,
        livekitApiSecret: config.livekitApiSecret,
    });
}
