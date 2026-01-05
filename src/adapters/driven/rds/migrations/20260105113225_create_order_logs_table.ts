import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('order_logs', (table) => {
    table.string('id', 36).notNullable().primary();
    table.string('order_id', 36).notNullable();
    table.string('status', 20).notNullable();
    table.bigInteger('timestamp').notNullable();
    table.foreign('order_id').references('id').inTable('orders').onDelete('CASCADE');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('order_logs');
}
