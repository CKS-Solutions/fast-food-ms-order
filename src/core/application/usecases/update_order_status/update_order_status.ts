import { OrderStatus } from "@entities/order";
import { OrderLog } from "@entities/order-log";
import { IOrderLogRepository } from "@ports/order-log_repository";
import { IOrderRepository } from "@ports/order_repository";
import { HTTPBadRequest, HTTPNotFound } from "@utils/http";

const STATUS_FLOW: OrderStatus[] = [
  OrderStatus.Received,
  OrderStatus.InPreparation,
  OrderStatus.Ready,
  OrderStatus.Finished,
];

export class UpdateOrderStatusUseCase {
  private readonly orderRepository: IOrderRepository;
  private readonly orderLogRepository: IOrderLogRepository;

  constructor(
    orderRepository: IOrderRepository,
    orderLogRepository: IOrderLogRepository
  ) {
    this.orderRepository = orderRepository;
    this.orderLogRepository = orderLogRepository;
  }

  async execute(orderId: string, newStatus: OrderStatus): Promise<{ message: string }> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new HTTPNotFound("Order not found");
    }

    if (order.status === OrderStatus.Finished || order.status === OrderStatus.Cancelled) {
      throw new HTTPBadRequest("Cannot change status of a finished or cancelled order");
    }

    if (order.status === newStatus) {
      throw new HTTPBadRequest("Order is already in the specified status");
    }

    if (newStatus === OrderStatus.Cancelled) {
      order.updateStatus(newStatus);
      await this.orderRepository.update(order);

      const log = OrderLog.create(order.id, newStatus);
      await this.orderLogRepository.create(log);

      return {
        message: `Order ${orderId} has been cancelled successfully`,
      }
    }

    const currentStatusIndex = STATUS_FLOW.indexOf(order.status);
    const newStatusIndex = STATUS_FLOW.indexOf(newStatus);
    if (newStatusIndex === -1) {
      throw new HTTPBadRequest(`Cannot change from ${order.status} to ${newStatus}`);
    }

    if (newStatusIndex !== currentStatusIndex + 1) {
      throw new HTTPBadRequest(`Cannot change from ${order.status} to ${newStatus}`);
    }

    order.updateStatus(newStatus);
    await this.orderRepository.update(order);

    const log = OrderLog.create(order.id, newStatus);
    await this.orderLogRepository.create(log);

    return {
      message: `Order ${orderId} status updated to ${newStatus} successfully`,
    };
  }
}