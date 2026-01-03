import { CreateOrderProcessorContainerFactory } from './create_order_processor'
import { AwsRegion, AwsStage } from '@aws/utils'

jest.mock('@aws/sqs_client', () => ({
  SQSClientWrapper: jest.fn(),
}))

jest.mock('@driven_sqs/order', () => ({
  OrderQueue: jest.fn(),
}))

jest.mock('@usecases/create_order_processor', () => ({
  CreateOrderProcessorUseCase: jest.fn(),
}))

import { CreateOrderProcessorUseCase } from '@usecases/create_order_processor'
import { SQSClientWrapper } from '@aws/sqs_client'
import { OrderQueue } from '@driven_sqs/order'

describe('CreateOrderProcessorContainerFactory', () => {
  const region = AwsRegion.USEast1
  const stage = AwsStage.Local

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should correctly wire all dependencies and expose usecase', () => {
    const factory = new CreateOrderProcessorContainerFactory(region, stage)

    expect(SQSClientWrapper).toHaveBeenCalledWith(region, stage)

    const sqsClient = (SQSClientWrapper as jest.Mock).mock.instances[0]

    expect(OrderQueue).toHaveBeenCalledWith(sqsClient)

    const orderQueue = (OrderQueue as jest.Mock).mock.instances[0]

    expect(CreateOrderProcessorUseCase).toHaveBeenCalledWith(orderQueue)

    expect(factory.usecase).toBe(
      (CreateOrderProcessorUseCase as jest.Mock).mock.instances[0]
    )
  })
})

