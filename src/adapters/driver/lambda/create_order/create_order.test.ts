import { handler } from './create_order'
import { CreateOrderContainerFactory } from '@di/create_order'
import { HTTPStatus } from '@utils/http'

jest.mock('@di/create_order', () => ({
  CreateOrderContainerFactory: jest.fn(),
}))

jest.mock('@utils/rds', () => ({
  getRDSCredentials: jest.fn().mockResolvedValue({
    host: 'localhost',
    user: 'user',
    password: 'pass',
  }),
}))

describe('CreateOrder Lambda', () => {
  const mockExecute = jest.fn()
  const containerMock = { usecase: { execute: mockExecute } }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(CreateOrderContainerFactory as jest.Mock).mockImplementation(() => containerMock)
  })

  it('should return 404 if no SQS records', async () => {
    const event = { Records: [] } as any
    const response = await handler(event)
    expect(response.statusCode).toBe(HTTPStatus.NotFound)
    expect(JSON.parse(response.body)).toEqual({ message: 'No records found' })
  })

  it('should process SQS record and return 200 on success', async () => {
    const recordBody = { total: 150, products: [{ product_id: 'prod-1', quantity: 2, price: 75 }] }
    const event = { Records: [{ body: JSON.stringify(recordBody) }] } as any

    mockExecute.mockResolvedValue({ foo: 'bar' })

    const response = await handler(event)
    expect(mockExecute).toHaveBeenCalledWith(recordBody)
    expect(response.statusCode).toBe(HTTPStatus.OK)
    expect(JSON.parse(response.body)).toEqual({ data: { foo: 'bar' } })
  })

  it('should return 500 on unexpected error', async () => {
    const recordBody = { total: 150, products: [{ product_id: 'prod-1', quantity: 2, price: 75 }] }
    const event = { Records: [{ body: JSON.stringify(recordBody) }] } as any

    mockExecute.mockRejectedValue(new Error('unexpected'))

    const response = await handler(event)
    expect(response.statusCode).toBe(500)
    expect(JSON.parse(response.body)).toEqual({ message: 'Internal Server Error' })
  })
})
