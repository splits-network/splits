import { FastifyInstance } from 'fastify';
import { ProviderRepository } from './repository';

interface RegisterConfig {
    supabaseUrl: string;
    supabaseKey: string;
}

export async function registerProviderRoutes(app: FastifyInstance, config: RegisterConfig) {
    const repository = new ProviderRepository(config.supabaseUrl, config.supabaseKey);

    // GET /api/v2/integrations/providers — list all active providers
    app.get('/api/v2/integrations/providers', async (request, reply) => {
        const providers = await repository.listActive();
        return reply.send({ data: providers });
    });

    // GET /api/v2/integrations/providers/:slug — get provider by slug
    app.get('/api/v2/integrations/providers/:slug', async (request, reply) => {
        const { slug } = request.params as { slug: string };
        const provider = await repository.findBySlug(slug);

        if (!provider) {
            return reply.status(404).send({ error: 'Provider not found' });
        }

        return reply.send({ data: provider });
    });
}
