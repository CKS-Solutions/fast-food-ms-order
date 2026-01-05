import { handler } from './send_for_follow_up';
import { SendForFollowUpContainerFactory } from '@di/send_for_follow_up';
import { getRegion, getStage } from '@utils/env';
import { getRDSCredentials } from '@utils/rds';
import {
  HTTPInternalServerError,
  HTTPSuccessResponse,
  HTTPBadRequest,
} from '@utils/http';
import { SNSEvent } from 'aws-lambda';

jest.mock('@di/send_for_follow_up', () => ({
  SendForFollowUpContainerFactory: jest.fn(),
}));

jest.mock('@utils/env');

jest.mock('@utils/rds', () => ({
  getRDSCredentials: jest.fn().mockResolvedValue({
    host: 'localhost',
    user: 'user',
    password: 'pass',
  }),
}));

describe('SendForFollowUp SNS Handler', () => {
  const mockExecute = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (SendForFollowUpContainerFactory as jest.Mock).mockImplementation(() => ({
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

  const makeSnsEvent = (message: string): SNSEvent => ({
    Records: [
      {
        Sns: {
          Message: message,
        },
      },
    ],
  } as unknown as SNSEvent);

  it('should return HTTPNotFound when no SNS records are received', async () => {
    const event = { Records: [] } as unknown as SNSEvent;

    const response = await handler(event);

    expect(response.statusCode).toBe(404);
  });

  it('should process SNS message successfully', async () => {
    const event = makeSnsEvent('test-message');

    mockExecute.mockResolvedValue(undefined);

    const response = await handler(event);

    expect(getStage).toHaveBeenCalled();
    expect(getRegion).toHaveBeenCalled();
    expect(getRDSCredentials).toHaveBeenCalledWith('us-east-1', 'dev');

    expect(SendForFollowUpContainerFactory).toHaveBeenCalledWith({
      host: 'localhost',
      user: 'user',
      password: 'pass',
    });

    expect(mockExecute).toHaveBeenCalledWith('test-message');

    const expectedResponse = new HTTPSuccessResponse(null).toLambdaResponse();
    expect(response).toEqual(expectedResponse);
  });

  it('should return HTTP error response when use case throws HTTPError', async () => {
    const event = makeSnsEvent('test-message');

    mockExecute.mockRejectedValue(new HTTPBadRequest('Invalid message'));

    const response = await handler(event);

    expect(response.statusCode).toBe(400);
  });

  it('should return HTTPInternalServerError on unexpected error', async () => {
    const event = makeSnsEvent('test-message');

    mockExecute.mockRejectedValue(new Error('Unexpected failure'));

    const response = await handler(event);

    const expectedResponse = new HTTPInternalServerError(
      'Internal Server Error',
    ).toLambdaResponse();

    expect(response).toEqual(expectedResponse);
  });
});
