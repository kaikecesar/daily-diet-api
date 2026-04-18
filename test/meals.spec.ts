// Core
import { execSync } from 'node:child_process';

// Libraries
import { afterAll, beforeAll, describe, it, beforeEach, expect } from 'vitest';
import request from 'supertest';

// Application
import { app } from '../src/app';

describe('Meals routes', () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    execSync('npm run knex migrate:rollback --all');
    execSync('npm run knex migrate:latest');
  });

  it('should be able to create a new meal', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({ name: 'John', email: 'john.doe@example.com' });

    const cookies = createUserResponse.get('Set-Cookie') ?? [];

    const mealResponse = await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'HotDog',
        description: 'HotDog',
        isOnDiet: true,
        date: Date.now(),
      });

    expect(mealResponse.statusCode).toEqual(201);
    expect(mealResponse.text).toEqual('Meal added with success');
  });

  it('should be able to list all meals from a user', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({ name: 'John', email: 'john.doe@example.com' });

    const cookies = createUserResponse.get('Set-Cookie') ?? [];

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Breakfast',
      description: 'Eggs',
      isOnDiet: true,
      date: Date.now(),
    });

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Lunch',
      description: 'Pizza',
      isOnDiet: false,
      date: Date.now(),
    });

    const listResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies);

    expect(listResponse.statusCode).toEqual(200);
    expect(listResponse.body).toHaveLength(2);
    expect(
      listResponse.body.map((meal: { name: string }) => meal.name).sort(),
    ).toEqual(['Breakfast', 'Lunch']);
  });

  it('should be able to update a meal', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({ name: 'John', email: 'john.doe@example.com' });

    const cookies = createUserResponse.get('Set-Cookie') ?? [];

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Breakfast',
      description: 'Eggs',
      isOnDiet: true,
      date: Date.now(),
    });

    const listResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies);

    const mealId = listResponse.body[0].id;

    const updateResponse = await request(app.server)
      .put(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .send({ name: 'Brunch', isOnDiet: false });

    expect(updateResponse.statusCode).toEqual(204);
  });

  it('should return 404 when updating a meal that does not exist', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({ name: 'John', email: 'john.doe@example.com' });

    const cookies = createUserResponse.get('Set-Cookie') ?? [];

    const updateResponse = await request(app.server)
      .put('/meals/00000000-0000-0000-0000-000000000000')
      .set('Cookie', cookies)
      .send({ name: 'Brunch' });

    expect(updateResponse.statusCode).toEqual(404);
  });

  it('should be able to soft delete a meal', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({ name: 'John', email: 'john.doe@example.com' });

    const cookies = createUserResponse.get('Set-Cookie') ?? [];

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Breakfast',
      description: 'Eggs',
      isOnDiet: true,
      date: Date.now(),
    });

    const listResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies);

    const mealId = listResponse.body[0].id;

    const deleteResponse = await request(app.server)
      .delete(`/meals/${mealId}`)
      .set('Cookie', cookies);

    expect(deleteResponse.statusCode).toEqual(204);

    const listAfterDelete = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies);

    expect(listAfterDelete.body).toHaveLength(0);
  });

  it('should be able to get metrics from a user', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({ name: 'John', email: 'john.doe@example.com' });

    const cookies = createUserResponse.get('Set-Cookie') ?? [];

    const baseDate = new Date('2026-04-01T00:00:00Z').getTime();
    const oneDay = 1000 * 60 * 60 * 24;

    const meals = [
      { name: 'M1', description: '-', isOnDiet: true, date: baseDate },
      { name: 'M2', description: '-', isOnDiet: true, date: baseDate + oneDay },
      {
        name: 'M3',
        description: '-',
        isOnDiet: true,
        date: baseDate + oneDay * 2,
      },
      {
        name: 'M4',
        description: '-',
        isOnDiet: false,
        date: baseDate + oneDay * 3,
      },
      {
        name: 'M5',
        description: '-',
        isOnDiet: true,
        date: baseDate + oneDay * 4,
      },
      {
        name: 'M6',
        description: '-',
        isOnDiet: true,
        date: baseDate + oneDay * 5,
      },
    ];

    for (const meal of meals) {
      await request(app.server)
        .post('/meals')
        .set('Cookie', cookies)
        .send(meal);
    }

    const metricsResponse = await request(app.server)
      .get('/meals/metrics')
      .set('Cookie', cookies);

    expect(metricsResponse.statusCode).toEqual(200);
    expect(metricsResponse.body).toEqual({
      totalMeals: 6,
      totalMealsOnDiet: 5,
      totalMealsOffDiet: 1,
      bestStreak: 3,
    });
  });

  it('should return 401 when user is not authenticated', async () => {
    const response = await request(app.server).get('/meals');
    expect(response.statusCode).toEqual(401);
  });
});
