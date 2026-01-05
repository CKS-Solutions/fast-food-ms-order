import { OrderLog } from "@entities/order-log";

export interface IOrderLogRepository {
  create(log: OrderLog): Promise<void>;
  findByOrderId(orderId: string): Promise<OrderLog[]>;
}