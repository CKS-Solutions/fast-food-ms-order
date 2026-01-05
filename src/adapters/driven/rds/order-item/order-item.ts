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

  async findByOrderId(orderId: string): Promise<OrderItem[]> {
    const results = await this.client.connection(TABLE_NAME).where({ order_id: orderId }).select();

    return results.map(result => new OrderItem({
      id: result.id,
      orderId: result.order_id,
      productId: result.product_id,
      quantity: result.quantity,
      price: result.price,
    }));
  }
}