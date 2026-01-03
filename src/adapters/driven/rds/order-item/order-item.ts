import { RDSClientWrapper } from "@aws/rds_client";
import { OrderItem } from "@entities/order-item";
import { IOrderItemRepository } from "@ports/order-item_repository";

const TABLE_NAME = 'order_items';

export class OrderItemRepository implements IOrderItemRepository {
  constructor(private readonly client: RDSClientWrapper) {}

  async createMany(orderItems: OrderItem[]): Promise<OrderItem[]> {
    const itemsToInsert = orderItems.map(item => ({
      id: item.id,
      order_id: item.order_id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
    }));

    await this.client.connection(TABLE_NAME).insert(itemsToInsert);

    return orderItems;
  }
}