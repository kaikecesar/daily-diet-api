// Libraries
import { FastifyInstance } from 'fastify';

export async function dailyDietRoutes(app: FastifyInstance) {
  app.get('/', async (request, reply) => {
    reply.status(200);
  });
}
