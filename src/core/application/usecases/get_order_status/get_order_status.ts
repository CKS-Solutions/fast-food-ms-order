import { OrderStatus } from "@entities/order";
import { IOrderRepository } from "@ports/order_repository";
import { HTTPNotFound } from "@utils/http";

export class GetOrderStatusUseCase {
  private readonly orderRepo: IOrderRepository;

  constructor(orderRepo: IOrderRepository) {
    this.orderRepo = orderRepo;
  }

  async execute(orderId: string): Promise<{ status: OrderStatus }> {
    const order = await this.orderRepo.findById(orderId);
    if (!order) {
      throw new HTTPNotFound("Order not found");
    }

    return { status: order.status };
  }
}