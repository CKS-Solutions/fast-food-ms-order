import { CreateOrderUseCase } from './create_order'
import { OrderStatus } from '@entities/order/order.types'
import { CreateOrderInputDTO } from '@dto/create_order'
import { IOrderItemRepository } from '@ports/order-item_repository'
import { IOrderRepository } from '@ports/order_repository'
import { ILambdaAdapter } from '@ports/lambda'
import { IOrderLogRepository } from '@ports/order-log_repository'

describe('CreateOrderUseCase', () => {
  let orderRepository: IOrderRepository
  let orderItemRepository: IOrderItemRepository
  let orderLogRepository: IOrderLogRepository
  let lambdaAdapter: ILambdaAdapter
  let useCase: CreateOrderUseCase
  const now = 1_700_000_000_000

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(now)
    orderRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
    } as IOrderRepository
    orderItemRepository = {
      createMany: jest.fn(),
    } as IOrderItemRepository
    orderLogRepository = {
      create: jest.fn(),
    } as IOrderLogRepository
    lambdaAdapter = {
      invokeEvent: jest.fn(),
    } as ILambdaAdapter
    useCase = new CreateOrderUseCase(
      orderRepository,
      orderItemRepository,
      orderLogRepository,
      lambdaAdapter,
    )
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  const baseParams: CreateOrderInputDTO = {
    customer_id: 'cust-123',
    products: [
      { product_id: 'prod-1', quantity: 2, price: 50.00 },
      { product_id: 'prod-2', quantity: 1, price: 50.00 },
    ],
  }

  it('should fail if could not create order', async () => {
    jest.spyOn(orderRepository, 'create').mockRejectedValueOnce(new Error('DB error'))

    await expect(useCase.execute(baseParams)).rejects.toThrow('Failed to create order')
    expect(orderRepository.create).toHaveBeenCalledTimes(1)
  })

  it('should fail if could not create order items', async () => {
    jest.spyOn(orderItemRepository, 'createMany').mockRejectedValueOnce(new Error('DB error'))
    await expect(useCase.execute(baseParams)).rejects.toThrow('Failed to create order items')
    expect(orderRepository.create).toHaveBeenCalledTimes(1)
    expect(orderItemRepository.createMany).toHaveBeenCalledTimes(1)
  })

  it('should fail if could not create order log', async () => {
    jest.spyOn(orderLogRepository, 'create').mockRejectedValueOnce(new Error('DB error'))
    await expect(useCase.execute(baseParams)).rejects.toThrow('Failed to create order log')
    expect(orderRepository.create).toHaveBeenCalledTimes(1)
    expect(orderItemRepository.createMany).toHaveBeenCalledTimes(1)
    expect(orderLogRepository.create).toHaveBeenCalledTimes(1)
  })

  it('should create order and items successfully', async () => {
    await expect(useCase.execute(baseParams)).resolves.toBeUndefined()

    expect(orderRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.any(String),
        customer_id: 'cust-123',
        total: 150.00,
        status: OrderStatus.WaitingPayment,
        created_at: now,
        updated_at: now,
      })
    )
    expect(orderItemRepository.createMany).toHaveBeenCalledWith([
      expect.objectContaining({
        id: expect.any(String),
        order_id: expect.any(String),
        product_id: 'prod-1',
        quantity: 2,
        price: 50.00,
      }),
      expect.objectContaining({
        id: expect.any(String),
        order_id: expect.any(String),
        product_id: 'prod-2',
        quantity: 1,
        price: 50.00,
      }),
    ])

    expect(orderLogRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.any(String),
        order_id: expect.any(String),
        status: OrderStatus.WaitingPayment,
        timestamp: now,
      })
    )
  })
})
