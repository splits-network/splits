/**
 * Job Notes — Routes
 *
 * CRUD endpoints nested under /api/v3/jobs/:id/notes
 */

import { FastifyInstance } from 'fastify';
import { JobNoteService } from './service.js';
import { idParamSchema } from '../types.js';
import {
  JobNoteCreate, JobNoteUpdate, JobNoteFilters,
  jobNoteListQuerySchema, jobNoteCreateSchema, jobNoteUpdateSchema,
} from './types.js';

const noteIdParamSchema = {
  type: 'object',
  required: ['id', 'noteId'],
  properties: {
    id: { type: 'string', format: 'uuid' },
    noteId: { type: 'string', format: 'uuid' },
  },
};

export function registerJobNoteRoutes(
  app: FastifyInstance,
  noteService: JobNoteService
) {
  // GET /api/v3/jobs/:id/notes — list notes for a job
  app.get('/api/v3/jobs/:id/notes', {
    schema: { params: idParamSchema, querystring: jobNoteListQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }

    const { id } = request.params as { id: string };
    const query = request.query as Partial<JobNoteFilters>;

    const result = await noteService.list(clerkUserId, { ...query, job_id: id });
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // POST /api/v3/jobs/:id/notes — create a note
  app.post('/api/v3/jobs/:id/notes', {
    schema: { params: idParamSchema, body: jobNoteCreateSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }

    const { id } = request.params as { id: string };
    const body = request.body as Omit<JobNoteCreate, 'job_id'>;

    const note = await noteService.create(clerkUserId, { ...body, job_id: id });
    return reply.code(201).send({ data: note });
  });

  // PATCH /api/v3/jobs/:id/notes/:noteId — update a note
  app.patch('/api/v3/jobs/:id/notes/:noteId', {
    schema: { params: noteIdParamSchema, body: jobNoteUpdateSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }

    const { noteId } = request.params as { id: string; noteId: string };
    const updates = request.body as JobNoteUpdate;

    const note = await noteService.update(noteId, clerkUserId, updates);
    return reply.send({ data: note });
  });

  // DELETE /api/v3/jobs/:id/notes/:noteId — delete a note
  app.delete('/api/v3/jobs/:id/notes/:noteId', {
    schema: { params: noteIdParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }

    const { noteId } = request.params as { id: string; noteId: string };
    await noteService.delete(noteId, clerkUserId);
    return reply.send({ data: { message: 'Note deleted successfully' } });
  });
}
