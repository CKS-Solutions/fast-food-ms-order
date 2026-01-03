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
}