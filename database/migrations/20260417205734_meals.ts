// Libraries
import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('meals', (table) => {
    table.uuid('id').primary();
    table.uuid('user_id').references('users.id').notNullable();
    table.string('name').notNullable();
    table.string('description').notNullable();
    table.boolean('is_on_diet').notNullable();
    table.datetime('date').notNullable();
    table.timestamp('created_at', true).defaultTo(knex.fn.now()).notNullable();
    table.timestamp('updated_at', true);
    table.timestamp('deleted_at', true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('meals');
}
