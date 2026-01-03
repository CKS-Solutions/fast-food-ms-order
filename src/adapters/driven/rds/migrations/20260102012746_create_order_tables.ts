import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("orders", (table) => {
    table.string("id").primary().notNullable()
    table.string("customer_id").nullable()
    table.string("status").notNullable()
    table.float("total").notNullable()
    table.bigInteger("created_at").notNullable()
    table.bigInteger("updated_at").notNullable()
  })

  await knex.schema.createTable("order_items", (table) => {
    table.string("id").primary().notNullable()
    table.string("product_id").notNullable()
    table.string("order_id").notNullable()
    table.integer("quantity").notNullable()
    table.float("price").notNullable()

    table.foreign("order_id").references("id").inTable("orders").onDelete("CASCADE")
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("order_items")
  await knex.schema.dropTableIfExists("orders")
}