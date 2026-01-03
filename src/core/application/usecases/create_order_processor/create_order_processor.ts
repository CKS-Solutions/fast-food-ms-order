import { CreateOrderInputDTO } from "@dto/create_order";
import { IOrderQueue } from "@ports/order_queue";
import { HTTPBadRequest } from "@utils/http";

export class CreateOrderProcessorUseCase {
  private readonly orderQueue: IOrderQueue;

  constructor(orderQueue: IOrderQueue) {
    this.orderQueue = orderQueue;
  }

  async execute(params: CreateOrderInputDTO): Promise<{ message: string }> {
    if (!params.total || params.total <= 0) {
      throw new HTTPBadRequest("Total must be greater than zero");
    }

    if (!params?.products?.length) {
      throw new HTTPBadRequest("At least one product is required");
    }

    for (const product of params.products) {
      if (!product?.product_id?.trim()) {
        throw new HTTPBadRequest("Product ID is required for each product");
      }

      if (!product.quantity || product.quantity <= 0) {
        throw new HTTPBadRequest("Product quantity must be greater than zero");
      }

      if (!product.price || product.price <= 0) {
        throw new HTTPBadRequest("Product price must be greater than zero");
      }
    }

    await this.orderQueue.sendOrderProcessingRequest(params);

    return {
      message: "Order processing request queued successfully",
    }
  }
}