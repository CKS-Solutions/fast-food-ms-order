import { handler } from './list_orders';
import { ListOrdersContainerFactory } from '@di/list_orders';
import { getRegion, getStage } from '@utils/env';
import { getRDSCredentials } from '@utils/rds';
import {
  HTTPInternalServerError,
  HTTPSuccessResponse,
  HTTPBadRequest,
} from '@utils/http';
import { APIGatewayProxyEvent } from 'aws-lambda';

jest.mock('@di/list_orders');
jest.mock('@utils/env');
jest.mock('@utils/rds', () => ({
  getRDSCredentials: jest.fn().mockResolvedValue({
    host: 'localhost',
    user: 'user',
    password: 'pass',
  }),
}));

describe('ListOrders HTTP Handler', () => {
  const mockExecute = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (ListOrdersContainerFactory as jest.Mock).mockImplementation(() => ({
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
    queryStringParameters?: Record<string, string>,
  ): APIGatewayProxyEvent =>
    ({
      queryStringParameters: queryStringParameters ?? null,
    } as unknown as APIGatewayProxyEvent);

  it('should use default pagination values when query params are not provided', async () => {
    const event = makeEvent();

    const resultData = {
      data: [],
      page: 1,
      limit: 10,
      total: 0,
    };

    mockExecute.mockResolvedValue(resultData);

    const response = await handler(event);

    expect(mockExecute).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
    });

    const expectedResponse = new HTTPSuccessResponse(resultData).toLambdaResponse();
    expect(response).toEqual(expectedResponse);
  });

  it('should use pagination values from query params', async () => {
    const event = makeEvent({
      page: '2',
      limit: '5',
    });

    const resultData = {
      data: ['order1', 'order2'],
      page: 2,
      limit: 5,
      total: 10,
    };

    mockExecute.mockResolvedValue(resultData);

    const response = await handler(event);

    expect(mockExecute).toHaveBeenCalledWith({
      page: 2,
      limit: 5,
    });

    const expectedResponse = new HTTPSuccessResponse(resultData).toLambdaResponse();
    expect(response).toEqual(expectedResponse);
  });

  it('should return HTTP error response when use case throws HTTPError', async () => {
    const event = makeEvent({
      page: '1',
      limit: '10',
    });

    mockExecute.mockRejectedValue(new HTTPBadRequest('Invalid pagination'));

    const response = await handler(event);

    expect(response.statusCode).toBe(400);
  });

  it('should return HTTPInternalServerError on unexpected error', async () => {
    const event = makeEvent({
      page: '1',
      limit: '10',
    });

    mockExecute.mockRejectedValue(new Error('Unexpected error'));

    const response = await handler(event);

    const expectedResponse = new HTTPInternalServerError(
      'Internal Server Error',
    ).toLambdaResponse();

    expect(response).toEqual(expectedResponse);
  });
});
