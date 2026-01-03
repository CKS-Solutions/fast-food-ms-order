import { Order } from "@entities/order";

export interface IOrderRepository {
  create(order: Order): Promise<Order>
}