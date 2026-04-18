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

      const meal = await connection('meals')
        .where({
          id,
          user_id: request.user?.id,
          deleted_at: null,
        })
        .select()
        .first();

      if (!meal) {
        return reply.status(404).send('Meal not found');
      }

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
          user_id: request.user!.id,
          deleted_at: null,
        })
        .update(updateData);

      return reply.status(204).send();
    },
  );

  // Delete meal
  app.delete(
    '/:id',
    { preHandler: [authenticateUser] },
    async (request, reply) => {
      // Validate params
      const deleteMealParamsSchema = z.object({
        id: z.string().uuid(),
      });
      const { id } = deleteMealParamsSchema.parse(request.params);

      await connection('meals').update('deleted_at', Date.now()).where({
        id,
        user_id: request.user?.id,
      });

      return reply.status(204).send();
    },
  );

  // List meals
  app.get('/', { preHandler: [authenticateUser] }, async (request, reply) => {
    const meals = await connection('meals').select().where({
      user_id: request.user?.id,
      deleted_at: null,
    });

    return reply.status(200).send(meals);
  });

  // Metrics
  app.get(
    '/metrics',
    { preHandler: [authenticateUser] },
    async (request, reply) => {
      const [{ total: totalMeals }] = await connection('meals')
        .count<{ total: number }[]>('* as total')
        .where({
          user_id: request.user!.id,
          deleted_at: null,
        });

      const [{ total: totalMealsOnDiet }] = await connection('meals')
        .count<{ total: number }[]>('* as total')
        .where({
          user_id: request.user!.id,
          is_on_diet: true,
          deleted_at: null,
        });

      const [{ total: totalMealsOffDiet }] = await connection('meals')
        .count<{ total: number }[]>('* as total')
        .where({
          user_id: request.user!.id,
          is_on_diet: false,
          deleted_at: null,
        });

      const [{ bestStreak }] = await connection.raw(
        `
          SELECT COALESCE(MAX(streak), 0) as bestStreak FROM (
            SELECT COUNT(*) as streak
            FROM (
              SELECT
                is_on_diet,
                ROW_NUMBER() OVER (ORDER BY date)
                - ROW_NUMBER() OVER (PARTITION BY is_on_diet ORDER BY date) as grp
              FROM meals
              WHERE user_id = ? AND deleted_at IS NULL
            )
            WHERE is_on_diet = 1
            GROUP BY grp
          )
        `,
        [request.user!.id],
      );

      return reply.status(200).send({
        totalMeals,
        totalMealsOnDiet,
        totalMealsOffDiet,
        bestStreak,
      });
    },
  );
}
