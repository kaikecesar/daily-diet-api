// Core
import { randomUUID } from 'node:crypto';

// Libraries
import { FastifyInstance } from 'fastify';
import { z } from 'zod';

// Application
import { authenticateUser } from '../middlewares/authenticate-user';
import { connection } from '../database';

export async function mealsRoutes(app: FastifyInstance) {
  // Create a meal
  app.post('/', { preHandler: [authenticateUser] }, async (request, reply) => {
    const createMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      isOnDiet: z.boolean(),
      date: z.number(),
    });

    const { name, description, isOnDiet, date } = createMealBodySchema.parse(
      request.body,
    );

    await connection('meals').insert({
      id: randomUUID(),
      user_id: request.user?.id,
      name,
      description,
      is_on_diet: isOnDiet,
      date,
    });

    return reply.status(201).send('Meal added with success');
  });

  // Update a meal
  app.put(
    '/:id',
    { preHandler: [authenticateUser] },
    async (request, reply) => {
      // Validate params
      const updateMealParamsSchema = z.object({ id: z.string().uuid() });
      const { id } = updateMealParamsSchema.parse(request.params);

      // Validate body
      const udpateMealBodySchema = z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        isOnDiet: z.boolean().optional(),
        date: z.number().optional(),
      });
      const { name, description, isOnDiet, date } = udpateMealBodySchema.parse(
        request.body,
      );

      const updateData = Object.fromEntries(
        Object.entries({
          name,
          description,
          is_on_diet: isOnDiet,
          date,
        }).filter(([_, value]) => value !== undefined),
      );

      await connection('meals')
        .where({
          id,
          user_id: request.user?.id,
        })
        .update(updateData);

      return reply.status(204).send();
    },
  );
}
