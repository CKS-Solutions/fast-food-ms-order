import { SQSClientWrapper } from "@aws/sqs_client"
import { AwsRegion, AwsStage } from "@aws/utils"
import { CreateOrderProcessorUseCase } from "@usecases/create_order_processor"
import { OrderQueue } from "@driven_sqs/order"

export class CreateOrderProcessorContainerFactory {
  usecase: CreateOrderProcessorUseCase

  constructor(region: AwsRegion, stage: AwsStage) {
    const sqsClient = new SQSClientWrapper(region, stage)
    const orderQueue = new OrderQueue(sqsClient)

    this.usecase = new CreateOrderProcessorUseCase(orderQueue)
  }
}