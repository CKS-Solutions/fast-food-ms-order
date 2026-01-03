import { SQSClientWrapper } from '@aws/sqs_client'
import { CreateOrderInputDTO } from '@dto/create_order'

jest.mock('@aws-sdk/client-sqs', () => ({
  SendMessageCommand: jest.fn().mockImplementation((params) => params),
}))

jest.mock('@aws/sqs_client', () => ({
  SQSClientWrapper: jest.fn(),
}))

import { OrderQueue } from './order'

describe('OrderQueue', () => {
  let sqsClient: jest.Mocked<SQSClientWrapper>
  let orderQueue: OrderQueue

  beforeEach(() => {
    sqsClient = {
      send: jest.fn().mockResolvedValue({}),
    } as any

    orderQueue = new OrderQueue(sqsClient)

    process.env.ORDER_QUEUE_URL = 'https://sqs.aws/queue-url'
  })

  afterEach(() => {
    delete process.env.ORDER_QUEUE_URL
    jest.clearAllMocks()
  })

  describe('when ORDER_QUEUE_URL is not set', () => {
    it('should throw an error', async () => {
      delete process.env.ORDER_QUEUE_URL

      const params = {} as CreateOrderInputDTO

      await expect(
        orderQueue.sendOrderProcessingRequest(params),
      ).rejects.toThrow('ORDER_QUEUE_URL environment variable is not set')

      expect(sqsClient.send).not.toHaveBeenCalled()
    })
  })

  describe('when input is valid', () => {
    it('should send a message to SQS with correct payload', async () => {
      const params: CreateOrderInputDTO = {
        total: 100,
        products: [
          { product_id: 'prod-1', quantity: 2, price: 50 },
        ],
      }

      await orderQueue.sendOrderProcessingRequest(params)

      expect(sqsClient.send).toHaveBeenCalledTimes(1)

      const command = (sqsClient.send as jest.Mock).mock.calls[0][0]

      expect(command.QueueUrl).toBe(process.env.ORDER_QUEUE_URL)
      expect(command.MessageBody).toBe(JSON.stringify(params))
    })
  })
})
