import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AtsService } from '../../service';
import { BadRequestError } from '@splits-network/shared-fastify';
import { CreatePlacementDTO } from '@splits-network/shared-types';

export function registerPlacementRoutes(app: FastifyInstance, service: AtsService) {
    // Get all placements with optional filters
    app.get(
        '/placements',
        async (request: FastifyRequest<{
            Querystring: {
                recruiter_id?: string;
                company_id?: string;
                date_from?: string;
                date_to?: string;
            }
        }>, reply: FastifyReply) => {
            const { recruiter_id, company_id, date_from, date_to } = request.query;
            const placements = await service.getPlacements({
                recruiter_id,
                company_id,
                date_from,
                date_to,
            });
            return reply.send({ data: placements });
        }
    );

    // Get placement by ID
    app.get(
        '/placements/:id',
        async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
            const placement = await service.getPlacementById(request.params.id);
            return reply.send({ data: placement });
        }
    );

    // Create new placement
    app.post(
        '/placements',
        async (request: FastifyRequest<{ Body: CreatePlacementDTO }>, reply: FastifyReply) => {
            const { application_id, salary, fee_percentage } = request.body;

            if (!application_id || !salary || fee_percentage === undefined) {
                throw new BadRequestError('Missing required fields');
            }

            const placement = await service.createPlacement(
                application_id,
                salary,
                fee_percentage
            );

            return reply.status(201).send({ data: placement });
        }
    );
}
