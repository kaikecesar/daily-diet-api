// Core
import { randomUUID } from 'node:crypto';

// Libraries
import { z } from 'zod';
import { FastifyInstance } from 'fastify';

// Application
import { connection } from '../database';

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.string(),
    });

    const { name, email } = createUserBodySchema.parse(request.body);

    let sessionId = request.cookies.sessionId;

    if (!sessionId) {
      sessionId = randomUUID();

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    await connection('users').insert({
      id: randomUUID(),
      session_id: sessionId,
      name,
      email,
    });
    reply.status(201).send('User sucessfuly created!');
  });
}
