import { handler } from './create_order_processor'
import { CreateOrderProcessorContainerFactory } from '@di/create_order_processor'
import { HTTPBadRequest, HTTPStatus } from '@utils/http'
import { APIGatewayProxyEvent } from 'aws-lambda'

jest.mock('@di/create_order_processor', () => ({
  CreateOrderProcessorContainerFactory: jest.fn(),
}))

describe('CreateOrderProcessor Lambda', () => {
  const mockExecute = jest.fn()
  const containerMock = { usecase: { execute: mockExecute } }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(CreateOrderProcessorContainerFactory as jest.Mock).mockImplementation(() => containerMock)
  })

  it('should return 400 if request body is missing', async () => {
    const event = { body: null } as APIGatewayProxyEvent
    const response = await handler(event)
    expect(response.statusCode).toBe(HTTPStatus.BadRequest)
    expect(JSON.parse(response.body)).toEqual({ message: 'request body is required' })
  })

  it('should return 400 if request body is invalid', async () => {
    const event = { body: "invalid-json" } as APIGatewayProxyEvent
    const response = await handler(event)
    expect(response.statusCode).toBe(HTTPStatus.BadRequest)
    expect(JSON.parse(response.body)).toEqual({ message: 'request body is required' })
  })

  it('should return 400 if total is missing or invalid', async () => {
    const body = { total: 0, products: [{ product_id: 'prod-1', quantity: 1, price: 100 }] }
    const event = { body: JSON.stringify(body) } as APIGatewayProxyEvent
    const error = new HTTPBadRequest("Total must be greater than zero")
    mockExecute.mockRejectedValue(error)

    const response = await handler(event)
    expect(response.statusCode).toBe(HTTPStatus.BadRequest)
    expect(JSON.parse(response.body)).toEqual({ message: 'Total must be greater than zero' })
  })

  describe('when product is missing required fields', () => {
    const testCases = [
      {
        body: { total: 100, products: [{ product_id: '', quantity: 1, price: 100 }] },
        errorMessage: 'Product ID is required for each product',
      },
      {
        body: { total: 100, products: [{ product_id: 'prod-1', quantity: 0, price: 100 }] },
        errorMessage: 'Product quantity must be greater than zero',
      },
      {
        body: { total: 100, products: [{ product_id: 'prod-1', quantity: 1, price: 0 }] },
        errorMessage: 'Product price must be greater than zero',
      },
    ]
    testCases.forEach(({ body, errorMessage }) => {
      it(`should return 400 if ${errorMessage}`, async () => {
        const event = { body: JSON.stringify(body) } as APIGatewayProxyEvent
        const error = new HTTPBadRequest(errorMessage)
        mockExecute.mockRejectedValue(error)
        const response = await handler(event)
        expect(response.statusCode).toBe(HTTPStatus.BadRequest)
        expect(JSON.parse(response.body)).toEqual({ message: errorMessage })
      })
    })
  })

  it('should process valid request and return 200 on success', async () => {
    const recordBody = { total: 100, products: [{ product_id: 'prod-1', quantity: 1, price: 100 }] }
    const event = { body: JSON.stringify(recordBody) } as APIGatewayProxyEvent
    const successResponse = { message: 'Order processing request queued successfully' }
    mockExecute.mockResolvedValue(successResponse)
    const response = await handler(event)
    expect(response.statusCode).toBe(HTTPStatus.OK)
    expect(JSON.parse(response.body).data).toEqual(successResponse)
  })

  it('should process valid request with body as object and return 200 on success', async () => {
    const recordBody = { total: 100, products: [{ product_id: 'prod-1', quantity: 1, price: 100 }] }
    const event = { body: recordBody } as unknown as APIGatewayProxyEvent
    const successResponse = { message: 'Order processing request queued successfully' }
    mockExecute.mockResolvedValue(successResponse)
    const response = await handler(event)
    expect(response.statusCode).toBe(HTTPStatus.OK)
    expect(JSON.parse(response.body).data).toEqual(successResponse)
  })

  it('should return 500 on unexpected error', async () => {
    const recordBody = { total: 100, products: [{ product_id: 'prod-1', quantity: 1, price: 100 }] }
    const event = { body: JSON.stringify(recordBody) } as APIGatewayProxyEvent

    mockExecute.mockRejectedValue(new Error('unexpected'))

    const response = await handler(event)
    expect(response.statusCode).toBe(500)
    expect(JSON.parse(response.body)).toEqual({ message: 'Internal Server Error' })
  })
})
