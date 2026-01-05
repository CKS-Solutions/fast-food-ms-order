import { OrderItem } from "@entities/order-item";

export interface IOrderItemRepository {
  createMany(orderItems: OrderItem[]): Promise<OrderItem[]>
  findByOrderId(orderId: string): Promise<OrderItem[]>
}