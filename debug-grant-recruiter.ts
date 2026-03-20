-- Add a debug/admin route to grant recruiter role
-- Add this to API Gateway for temporary debugging

import { FastifyInstance } from 'fastify';

export function registerDebugRoutes(app: FastifyInstance) {
  // Only enable in development
  if (process.env.NODE_ENV !== 'development') return;

  app.post('/debug/grant-recruiter-role', async (request, reply) => {
    const { clerkUserId, recruiterName } = request.body as { 
      clerkUserId: string; 
      recruiterName: string; 
    };

    if (!clerkUserId || !recruiterName) {
      return reply.status(400).send({ 
        error: 'Missing clerkUserId or recruiterName' 
      });
    }

    // This would need to be implemented in a service
    // For now, provide the SQL to run manually
    const sql = `
      WITH user_lookup AS (
        SELECT id FROM users WHERE clerk_user_id = '${clerkUserId}'
      ),
      recruiter_insert AS (
        INSERT INTO recruiters (id, name, email, status, user_id, created_at, updated_at)
        SELECT 
          gen_random_uuid(),
          '${recruiterName}',
          u.email,
          'active',
          u.id,
          NOW(),
          NOW()
        FROM users u
        WHERE u.clerk_user_id = '${clerkUserId}'
        RETURNING id, user_id
      )
      INSERT INTO user_roles (user_id, role_name, role_entity_id, created_at)
      SELECT ri.user_id, 'recruiter', ri.id, NOW()
      FROM recruiter_insert ri;
    `;

    return reply.send({ 
      message: 'Run this SQL to grant recruiter role',
      sql: sql.trim()
    });
  });
}