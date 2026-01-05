import { ListOrdersUseCase } from './list_orders';
import { OrderStatus } from '@entities/order';
import { IOrderRepository } from '@ports/order_repository';
import { IOrderItemRepository } from '@ports/order-item_repository';
import { IOrderLogRepository } from '@ports/order-log_repository';

describe('ListOrdersUseCase', () => {
  let orderRepo: jest.Mocked<IOrderRepository>;
  let orderItemRepo: jest.Mocked<IOrderItemRepository>;
  let orderLogRepo: jest.Mocked<IOrderLogRepository>;
  let useCase: ListOrdersUseCase;

  beforeEach(() => {
    orderRepo = {
      findAll: jest.fn(),
    } as any;

    orderItemRepo = {
      findByOrderId: jest.fn(),
    } as any;

    orderLogRepo = {
      findByOrderId: jest.fn(),
    } as any;

    useCase = new ListOrdersUseCase(
      orderRepo,
      orderItemRepo,
      orderLogRepo,
    );
  });

  const makeOrder = (id: string, status: OrderStatus) => ({
    id,
    status,
    toOutputDTO: jest.fn().mockReturnValue({
      id,
      status,
      items: [],
      logs: [],
    }),
  });

  const makeItem = (id: string) => ({
    toOutputDTO: jest.fn().mockReturnValue({ id }),
  });

  const makeLog = (id: string) => ({
    toOutputDTO: jest.fn().mockReturnValue({ id }),
  });

  it('should list orders with items and logs', async () => {
    const orders = [
      makeOrder('1', OrderStatus.Received),
      makeOrder('2', OrderStatus.Ready),
    ];

    orderRepo.findAll.mockResolvedValue(orders as any);

    orderItemRepo.findByOrderId.mockImplementation(async (orderId: string) => [
      makeItem(`item-${orderId}`),
    ] as any);

    orderLogRepo.findByOrderId.mockImplementation(async (orderId: string) => [
      makeLog(`log-${orderId}`),
    ] as any);

    const result = await useCase.execute({ page: 1, limit: 10 });

    expect(orderRepo.findAll).toHaveBeenCalledWith(1, 10);

    expect(orderItemRepo.findByOrderId).toHaveBeenCalledTimes(2);
    expect(orderLogRepo.findByOrderId).toHaveBeenCalledTimes(2);

    expect(result).toHaveLength(2);

    expect(result[0]).toHaveProperty('items');
    expect(result[0]).toHaveProperty('logs');
  });

  it('should sort orders by status priority', async () => {
    const orders = [
      makeOrder('1', OrderStatus.Received),
      makeOrder('2', OrderStatus.InPreparation),
      makeOrder('3', OrderStatus.Ready),
    ];

    orderRepo.findAll.mockResolvedValue(orders as any);

    orderItemRepo.findByOrderId.mockResolvedValue([]);
    orderLogRepo.findByOrderId.mockResolvedValue([]);

    const result = await useCase.execute({ page: 1, limit: 10 });

    expect(result.map(o => o.status)).toEqual([
      OrderStatus.Ready,
      OrderStatus.InPreparation,
      OrderStatus.Received,
    ]);
  });

  it('should return empty list when no orders are found', async () => {
    orderRepo.findAll.mockResolvedValue([]);

    const result = await useCase.execute({ page: 1, limit: 10 });

    expect(result).toEqual([]);
    expect(orderItemRepo.findByOrderId).not.toHaveBeenCalled();
    expect(orderLogRepo.findByOrderId).not.toHaveBeenCalled();
  });
});
