import { FastifyInstance } from 'fastify';

export async function mealsRoutes(app: FastifyInstance) {
  app.get('/', (request, reply) => {
    return reply.status(200);
  });
}
