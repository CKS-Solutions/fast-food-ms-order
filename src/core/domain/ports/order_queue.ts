import { CreateOrderInputDTO } from "@dto/create_order";

export interface IOrderQueue {
  sendOrderProcessingRequest(params: CreateOrderInputDTO): Promise<void>
}