import { Order } from "@entities/order";

export interface IOrderRepository {
  create(order: Order): Promise<Order>
  findById(id: string): Promise<Order | null>
  findAll(page: number, limit: number): Promise<Order[]>
  update(order: Order): Promise<Order>
}