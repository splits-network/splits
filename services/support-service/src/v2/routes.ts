import { FastifyInstance } from 'fastify';
import { registerSupportRoutes } from './support/routes';

interface RegisterConfig {
    supabaseUrl: string;
    supabaseKey: string;
    redisConfig: { host: string; port: number; password?: string };
}

export async function registerV2Routes(app: FastifyInstance, config: RegisterConfig) {
    await registerSupportRoutes(app, {
        supabaseUrl: config.supabaseUrl,
        supabaseKey: config.supabaseKey,
        redisConfig: config.redisConfig,
    });
}
