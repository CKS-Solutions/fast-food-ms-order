import { SendMessageCommand } from "@aws-sdk/client-sqs";
import { SQSClientWrapper } from "@aws/sqs_client";
import { CreateOrderInputDTO } from "@dto/create_order";
import { IOrderQueue } from "@ports/order_queue";

export class OrderQueue implements IOrderQueue {
  constructor(private readonly client: SQSClientWrapper) {}

  async sendOrderProcessingRequest(params: CreateOrderInputDTO): Promise<void> {
    const messageBody = JSON.stringify(params);

    const command = new SendMessageCommand({
      QueueUrl: this.getQueueUrl(),
      MessageBody: messageBody,
    });

    await this.client.send(command);
  }

  private getQueueUrl(): string {
    const url = process.env.ORDER_QUEUE_URL;
    if (!url) {
      throw new Error("ORDER_QUEUE_URL environment variable is not set");
    }

    return url;
  }
}