import { handler } from './finish_order_prepare';
import { UpdateOrderStatusContainerFactory } from '@di/update_order_status';
import { OrderStatus } from '@entities/order';
import { getRegion, getStage } from '@utils/env';
import { getRDSCredentials } from '@utils/rds';
import {
  HTTPBadRequest,
  HTTPInternalServerError,
  HTTPSuccessResponse,
} from '@utils/http';
import { APIGatewayProxyEvent } from 'aws-lambda';

jest.mock('@di/update_order_status');
jest.mock('@utils/env');

jest.mock('@utils/rds', () => ({
  getRDSCredentials: jest.fn().mockResolvedValue({
    host: 'localhost',
    user: 'user',
    password: 'pass',
  }),
}));

describe('SetOrderReady HTTP Handler', () => {
  const mockExecute = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (UpdateOrderStatusContainerFactory as jest.Mock).mockImplementation(() => ({
      usecase: {
        execute: mockExecute,
      },
    }));

    (getStage as jest.Mock).mockReturnValue('dev');
    (getRegion as jest.Mock).mockReturnValue('us-east-1');

    (getRDSCredentials as jest.Mock).mockResolvedValue({
      host: 'localhost',
      user: 'user',
      password: 'pass',
    });
  });

  const makeEvent = (orderId?: string): APIGatewayProxyEvent =>
    ({
      pathParameters: orderId ? { orderId } : null,
    } as unknown as APIGatewayProxyEvent);

  it('should return HTTPBadRequest when orderId path parameter is missing', async () => {
    const event = makeEvent();

    const response = await handler(event);

    expect(response.statusCode).toBe(400);
  });

  it('should update order status to Ready successfully', async () => {
    const event = makeEvent('order-123');

    mockExecute.mockResolvedValue({
      message: 'Order order-123 status updated to Ready successfully',
    });

    const response = await handler(event);

    expect(getStage).toHaveBeenCalled();
    expect(getRegion).toHaveBeenCalled();
    expect(getRDSCredentials).toHaveBeenCalledWith('us-east-1', 'dev');

    expect(UpdateOrderStatusContainerFactory).toHaveBeenCalledWith({
      host: 'localhost',
      user: 'user',
      password: 'pass',
    });

    expect(mockExecute).toHaveBeenCalledWith(
      'order-123',
      OrderStatus.Ready,
    );

    const expectedResponse = new HTTPSuccessResponse({
      message: 'Order order-123 status updated to Ready successfully',
    }).toLambdaResponse();

    expect(response).toEqual(expectedResponse);
  });

  it('should return HTTP error response when use case throws HTTPError', async () => {
    const event = makeEvent('order-123');

    mockExecute.mockRejectedValue(
      new HTTPBadRequest('Order cannot be moved to Ready'),
    );

    const response = await handler(event);

    expect(response.statusCode).toBe(400);
  });

  it('should return HTTPInternalServerError on unexpected error', async () => {
    const event = makeEvent('order-123');

    mockExecute.mockRejectedValue(new Error('Unexpected error'));

    const response = await handler(event);

    const expectedResponse = new HTTPInternalServerError(
      'Internal Server Error',
    ).toLambdaResponse();

    expect(response).toEqual(expectedResponse);
  });
});
