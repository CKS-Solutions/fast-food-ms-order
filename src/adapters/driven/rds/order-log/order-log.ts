import { RDSClientWrapper } from "@aws/rds_client";
import { OrderLog } from "@entities/order-log";
import { IOrderLogRepository } from "@ports/order-log_repository";

export class OrderLogRepository implements IOrderLogRepository {
  constructor(private readonly client: RDSClientWrapper) {}

  async create(log: OrderLog): Promise<void> {
    await this.client.connection('order_logs').insert({
      id: log.id,
      order_id: log.order_id,
      status: log.status,
      timestamp: log.timestamp,
    });
  }

  async findByOrderId(orderId: string): Promise<OrderLog[]> {
    const results = await this.client.connection('order_logs').where({ order_id: orderId }).select();

    return results.map(result => new OrderLog({
      id: result.id,
      orderId: result.order_id,
      status: result.status,
      timestamp: result.timestamp,
    }));
  }
}