import { PaymentTopicMessage, PaymentTopicType } from "@dto/send_for_follow_up";
import { OrderStatus } from "@entities/order";
import { IOrderRepository } from "@ports/order_repository";
import { HTTPBadRequest, HTTPNotFound } from "@utils/http";

const PAID_STATUS = "paid";

export class SendForFollowUpUseCase {
  constructor(private readonly orderRepo: IOrderRepository) {}

  async execute(message: string): Promise<void> {
    const parsedMessage = this.parseMessage(message);

    if (parsedMessage.type !== PaymentTopicType.StatusUpdate) {
      console.info("Message type is not StatusUpdate. No action taken.");
      return;
    }

    if (parsedMessage.status !== PAID_STATUS) {
      console.info(`Payment status is ${parsedMessage.status}. No follow-up needed.`);
      return;
    }

    const order = await this.orderRepo.findById(parsedMessage.external_id);
    if (!order) {
      throw new HTTPNotFound(`Order with id ${parsedMessage.external_id} not found`);
    }

    order.updateStatus(OrderStatus.Received);

    await this.orderRepo.update(order);
  }

  private parseMessage(message: string): PaymentTopicMessage {
    try {
      const parsed = JSON.parse(message) as PaymentTopicMessage;
      return parsed;
    } catch (error) {
      throw new HTTPBadRequest("Invalid message format");
    }
  }
}