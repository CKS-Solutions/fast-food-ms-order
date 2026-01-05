import { SendForFollowUpUseCase } from './send_for_follow_up';
import { PaymentTopicType } from '@dto/send_for_follow_up';
import { OrderStatus } from '@entities/order';
import { HTTPBadRequest, HTTPNotFound } from '@utils/http';
import { IOrderRepository } from '@ports/order_repository';
import { IOrderLogRepository } from '@ports/order-log_repository';

describe('SendForFollowUpUseCase', () => {
  let orderRepo: jest.Mocked<IOrderRepository>;
  let orderLogRepo: jest.Mocked<IOrderLogRepository>;
  let useCase: SendForFollowUpUseCase;

  beforeEach(() => {
    orderRepo = {
      findById: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    } as jest.Mocked<IOrderRepository>;

    orderLogRepo = {
      create: jest.fn(),
    } as jest.Mocked<IOrderLogRepository>;

    useCase = new SendForFollowUpUseCase(orderRepo, orderLogRepo);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should update order status when payment status is paid', async () => {
    const order = {
      id: 'order-123',
      updateStatus: jest.fn(),
    };

    orderRepo.findById.mockResolvedValue(order as any);

    const message = JSON.stringify({
      type: PaymentTopicType.StatusUpdate,
      status: 'paid',
      external_id: 'order-123',
    });

    await useCase.execute(message);

    expect(orderRepo.findById).toHaveBeenCalledWith('order-123');
    expect(order.updateStatus).toHaveBeenCalledWith(OrderStatus.Received);
    expect(orderRepo.update).toHaveBeenCalledWith(order);
    expect(orderLogRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.any(String),
        order_id: 'order-123',
        status: OrderStatus.Received,
        timestamp: expect.any(Number),
      }),
    );
  });

  it('should do nothing when message type is not StatusUpdate', async () => {
    const message = JSON.stringify({
      type: PaymentTopicType.CreationSuccess,
      code: 'code',
      external_id: 'order-123',
    });

    await useCase.execute(message);

    expect(orderRepo.findById).not.toHaveBeenCalled();
    expect(orderRepo.update).not.toHaveBeenCalled();
  });

  it('should do nothing when payment status is not paid', async () => {
    const message = JSON.stringify({
      type: PaymentTopicType.StatusUpdate,
      status: 'pending',
      external_id: 'order-123',
    });

    await useCase.execute(message);

    expect(orderRepo.findById).not.toHaveBeenCalled();
    expect(orderRepo.update).not.toHaveBeenCalled();
  });

  it('should throw HTTPNotFound when order does not exist', async () => {
    orderRepo.findById.mockResolvedValue(null);

    const message = JSON.stringify({
      type: PaymentTopicType.StatusUpdate,
      status: 'paid',
      external_id: 'order-123',
    });

    await expect(useCase.execute(message)).rejects.toBeInstanceOf(
      HTTPNotFound,
    );

    expect(orderRepo.findById).toHaveBeenCalledWith('order-123');
    expect(orderRepo.update).not.toHaveBeenCalled();
  });

  it('should throw HTTPBadRequest when message is invalid JSON', async () => {
    const invalidMessage = '{ invalid json';

    await expect(useCase.execute(invalidMessage)).rejects.toBeInstanceOf(
      HTTPBadRequest,
    );

    expect(orderRepo.findById).not.toHaveBeenCalled();
    expect(orderRepo.update).not.toHaveBeenCalled();
  });
});
