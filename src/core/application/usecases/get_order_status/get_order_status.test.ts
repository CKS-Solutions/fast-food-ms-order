import { GetOrderStatusUseCase } from './get_order_status';
import { OrderStatus } from '@entities/order';
import { IOrderRepository } from '@ports/order_repository';
import { HTTPNotFound } from '@utils/http';

describe('GetOrderStatusUseCase', () => {
  let orderRepo: jest.Mocked<IOrderRepository>;
  let useCase: GetOrderStatusUseCase;

  beforeEach(() => {
    orderRepo = {
      findById: jest.fn(),
    } as any;

    useCase = new GetOrderStatusUseCase(orderRepo);
  });

  it('should return order status when order exists', async () => {
    const order = {
      id: 'order-123',
      status: OrderStatus.Ready,
    };

    orderRepo.findById.mockResolvedValue(order as any);

    const result = await useCase.execute('order-123');

    expect(orderRepo.findById).toHaveBeenCalledWith('order-123');
    expect(result).toEqual({
      status: OrderStatus.Ready,
    });
  });

  it('should throw HTTPNotFound when order does not exist', async () => {
    orderRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('order-123'),
    ).rejects.toBeInstanceOf(HTTPNotFound);

    await expect(
      useCase.execute('order-123'),
    ).rejects.toThrow('Order not found');
  });
});
