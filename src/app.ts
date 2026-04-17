// Libraries
import { fastify } from 'fastify';
import { dailyDietRoutes } from './routes/daily_diet';

export const app = fastify();

app.register(dailyDietRoutes, { prefix: '/daily-diet' });
