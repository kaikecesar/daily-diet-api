// Libraries
import { FastifyReply, FastifyRequest } from 'fastify';

// Application
import { connection } from '../database';

export async function authenticateUser(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { sessionId } = request.cookies;

  if (!sessionId) {
    return reply.status(401).send({
      error: 'Unauthorized',
    });
  }

  const user = await connection('users').where('session_id', sessionId).first();

  if (!user) {
    return reply.status(401).send({
      error: 'Unauthorized',
    });
  }

  request.user = user;
}
