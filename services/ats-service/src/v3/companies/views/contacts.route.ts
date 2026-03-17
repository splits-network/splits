/**
 * GET /api/v3/companies/:id/view/contacts
 *
 * Returns contacts (hiring managers, company admins) for a company.
 * Joined view: memberships + users for the company's organization.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { CompanyContactsRepository } from './contacts.repository';
import { CompanyContactsService } from './contacts.service';
import { idParamSchema } from '../types';

export function registerCompanyContactsView(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new CompanyContactsRepository(supabase);
  const service = new CompanyContactsService(repository, supabase);

  app.get('/api/v3/companies/:id/view/contacts', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    const data = await service.getContacts(id, clerkUserId);
    return reply.send({ data });
  });
}
