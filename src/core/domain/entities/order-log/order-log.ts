import { OrderStatus } from "@entities/order/order.types";
import { randomUUID } from "node:crypto";

export class OrderLog {
  id: string;
  order_id: string;
  status: OrderStatus;
  timestamp: number;
  
  constructor({
    id,
    orderId,
    status,
    timestamp,
  }: {
    id: string;
    orderId: string;
    status: OrderStatus;
    timestamp: number;
  }) {
    this.id = id;
    this.order_id = orderId;
    this.status = status;
    this.timestamp = timestamp;
  }

  static create(
    orderId: string,
    status: OrderStatus,
  ): OrderLog {
    return new OrderLog({
      id: randomUUID(),
      orderId,
      status,
      timestamp: Date.now(),
    });
  }
}