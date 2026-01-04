import { Order } from "@entities/order";

export interface IOrderRepository {
  create(order: Order): Promise<Order>
  findById(id: string): Promise<Order | null>
  update(order: Order): Promise<Order>
}