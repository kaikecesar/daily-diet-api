// Core
import { execSync } from 'node:child_process';

// Libraries
import { afterAll, beforeAll, describe, it, beforeEach, expect } from 'vitest';
import request from 'supertest';

// Application
import { app } from '../src/app';

describe('Users routes', () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all');
    execSync('npm run knex migrate:latest');
  });

  it('should be able to create a new user', async () => {
    const response = await request(app.server)
      .post('/users')
      .send({ name: 'John', email: 'john.doe@example.com' });

    expect(response.statusCode).toEqual(201);
    expect(response.text).toEqual('User sucessfuly created!');
  });
});
