# daily-diet-api

REST API for daily diet tracking: user registration, meal logging and diet adherence metrics.

## Stack

- **Fastify** — HTTP framework
- **Knex** — query builder and migrations
- **SQLite** — database
- **TypeScript**
- **Zod** — schema and environment variable validation
- **Vitest** + **Supertest** — integration tests

## Functional requirements

- [x] Create a user and identify them across requests (session cookie)
- [x] Log a meal (name, description, date/time, whether it's on the diet)
- [x] Edit and delete a meal
- [x] List all meals of a user
- [x] View a single meal
- [x] Retrieve user metrics:
  - [x] Total meals logged
  - [x] Total meals on the diet
  - [x] Total meals off the diet
  - [x] Best streak of meals on the diet

## Rules

- Meals are tied to the user who created them
- Users can only view, edit and delete their own meals

## Getting started

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
cp .env.test.example .env.test

# Run migrations
npm run knex migrate:latest

# Start the dev server
npm run dev
```

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Run the server in watch mode |
| `npm test` | Run the test suite |
| `npm run lint` | Run ESLint |
| `npm run build` | Build for production into `build/` |
| `npm run knex` | Knex CLI wrapper (e.g. `migrate:latest`) |

## Endpoints

### Users
- `POST /users` — create a user and receive the session cookie

### Meals
- `POST /meals` — log a meal
- `GET /meals` — list the user's meals
- `PUT /meals/:id` — update a meal
- `DELETE /meals/:id` — remove (soft delete) a meal
- `GET /meals/metrics` — return the user's metrics

All meal routes require the `sessionId` cookie.
