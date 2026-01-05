import { handler } from './get_order_status';
import { GetOrderStatusContainerFactory } from '@di/get_order_status';
import { getRegion, getStage } from '@utils/env';
import { getRDSCredentials } from '@utils/rds';
import {
  HTTPBadRequest,
  HTTPInternalServerError,
  HTTPSuccessResponse,
} from '@utils/http';
import { APIGatewayProxyEvent } from 'aws-lambda';

jest.mock('@di/get_order_status');
jest.mock('@utils/env');
jest.mock('@utils/rds', () => ({
  getRDSCredentials: jest.fn().mockResolvedValue({
    host: 'localhost',
    user: 'user',
    password: 'pass',
  }),
}));

describe('GetOrderStatus HTTP Handler', () => {
  const mockExecute = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (GetOrderStatusContainerFactory as jest.Mock).mockImplementation(() => ({
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

  const makeEvent = (
    orderId?: string,
  ): APIGatewayProxyEvent =>
    ({
      pathParameters: orderId ? { orderId } : null,
    } as unknown as APIGatewayProxyEvent);

  it('should return order status when orderId is provided', async () => {
    const event = makeEvent('order-123');

    const resultData = {
      orderId: 'order-123',
      status: 'READY',
    };

    mockExecute.mockResolvedValue(resultData);

    const response = await handler(event);

    expect(mockExecute).toHaveBeenCalledWith('order-123');

    const expectedResponse = new HTTPSuccessResponse(resultData).toLambdaResponse();
    expect(response).toEqual(expectedResponse);
  });

  it('should return HTTPBadRequest when orderId is missing', async () => {
    const event = makeEvent();

    const response = await handler(event);

    expect(response.statusCode).toBe(400);
  });

  it('should return HTTP error response when use case throws HTTPError', async () => {
    const event = makeEvent('order-123');

    mockExecute.mockRejectedValue(
      new HTTPBadRequest('Order not found'),
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
