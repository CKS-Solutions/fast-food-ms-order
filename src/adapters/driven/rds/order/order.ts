import { RDSClientWrapper } from "@aws/rds_client";
import { Order } from "@entities/order";
import { IOrderRepository } from "@ports/order_repository";

const TABLE_NAME = 'orders';

export class OrderRepository implements IOrderRepository {
  constructor(private readonly client: RDSClientWrapper) {}

  async create(order: Order): Promise<Order> {
    await this.client.connection(TABLE_NAME).insert({
      id: order.id,
      customer_id: order.customer_id,
      status: order.status,
      total: order.total,
      created_at: order.created_at,
      updated_at: order.updated_at,
    });

    return order;
  }

  async findById(id: string): Promise<Order | null> {
    const result = await this.client.connection(TABLE_NAME).where({ id }).first();

    if (!result) {
      return null;
    }

    return new Order({
      id: result.id,
      customerId: result.customer_id,
      status: result.status,
      total: result.total,
      createdAt: result.created_at,
      updatedAt: result.updated_at
    });
  }

  async update(order: Order): Promise<Order> {
    await this.client.connection(TABLE_NAME)
      .where({ id: order.id })
      .update({
        customer_id: order.customer_id,
        status: order.status,
        total: order.total,
        created_at: order.created_at,
        updated_at: order.updated_at,
      });
    return order;
  }
}