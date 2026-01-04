import { UpdateOrderStatusUseCase } from './update_order_status';
import { OrderStatus } from '@entities/order';
import { IOrderRepository } from '@ports/order_repository';
import { HTTPBadRequest, HTTPNotFound } from '@utils/http';

describe('UpdateOrderStatusUseCase', () => {
  let orderRepository: jest.Mocked<IOrderRepository>;
  let useCase: UpdateOrderStatusUseCase;

  const makeOrder = (status: OrderStatus) => ({
    status,
    updateStatus: jest.fn(),
  });

  beforeEach(() => {
    orderRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<IOrderRepository>;

    useCase = new UpdateOrderStatusUseCase(orderRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw HTTPNotFound when order does not exist', async () => {
    orderRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('order-1', OrderStatus.Received),
    ).rejects.toBeInstanceOf(HTTPNotFound);
  });

  it('should throw HTTPBadRequest when order is finished', async () => {
    const order = makeOrder(OrderStatus.Finished);
    orderRepository.findById.mockResolvedValue(order as any);

    await expect(
      useCase.execute('order-1', OrderStatus.Ready),
    ).rejects.toBeInstanceOf(HTTPBadRequest);
  });

  it('should throw HTTPBadRequest when order is cancelled', async () => {
    const order = makeOrder(OrderStatus.Cancelled);
    orderRepository.findById.mockResolvedValue(order as any);

    await expect(
      useCase.execute('order-1', OrderStatus.Ready),
    ).rejects.toBeInstanceOf(HTTPBadRequest);
  });

  it('should throw HTTPBadRequest when new status is the same as current status', async () => {
    const order = makeOrder(OrderStatus.Received);
    orderRepository.findById.mockResolvedValue(order as any);

    await expect(
      useCase.execute('order-1', OrderStatus.Received),
    ).rejects.toBeInstanceOf(HTTPBadRequest);
  });

  it('should allow cancelling an order in progress', async () => {
    const order = makeOrder(OrderStatus.InPreparation);
    orderRepository.findById.mockResolvedValue(order as any);

    const result = await useCase.execute('order-1', OrderStatus.Cancelled);

    expect(order.updateStatus).toHaveBeenCalledWith(OrderStatus.Cancelled);
    expect(orderRepository.update).toHaveBeenCalledWith(order);
    expect(result).toEqual({
      message: 'Order order-1 has been cancelled successfully',
    });
  });

  it('should throw HTTPBadRequest when new status is not in status flow', async () => {
    const order = makeOrder(OrderStatus.Received);
    orderRepository.findById.mockResolvedValue(order as any);

    await expect(
      useCase.execute('order-1', OrderStatus.WaitingPayment as OrderStatus),
    ).rejects.toBeInstanceOf(HTTPBadRequest);
  });

  it('should throw HTTPBadRequest when trying to skip status flow', async () => {
    const order = makeOrder(OrderStatus.Received);
    orderRepository.findById.mockResolvedValue(order as any);

    await expect(
      useCase.execute('order-1', OrderStatus.Ready),
    ).rejects.toBeInstanceOf(HTTPBadRequest);
  });

  it('should update order status following the correct flow', async () => {
    const order = makeOrder(OrderStatus.Received);
    orderRepository.findById.mockResolvedValue(order as any);

    const result = await useCase.execute('order-1', OrderStatus.InPreparation);

    expect(order.updateStatus).toHaveBeenCalledWith(OrderStatus.InPreparation);
    expect(orderRepository.update).toHaveBeenCalledWith(order);
    expect(result).toEqual({
      message: 'Order order-1 status updated to in_preparation successfully',
    });
  });
});
