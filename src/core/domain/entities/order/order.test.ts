import { Order } from './order'
import { OrderStatus } from './order.types'

jest.mock('node:crypto', () => ({
  randomUUID: jest.fn(() => 'uuid-123'),
}))

describe('Order', () => {
  const NOW = 1_700_000_000_000

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(NOW)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('create', () => {
    it('should create a payment with default values', () => {
      const order = Order.create(
        1000,
        'customer-123',
      )

      expect(order).toBeInstanceOf(Order)

      expect(order.id).toBe('uuid-123')
      expect(order.customer_id).toBe('customer-123')
      expect(order.status).toBe(OrderStatus.WaitingPayment)
      expect(order.total).toBe(1000)
    })

    it('should set created_at and updated_at to now', () => {
      const order = Order.create(
        1000,
        'customer-123',
      )

      expect(order.created_at).toBe(NOW)
      expect(order.updated_at).toBe(NOW)
    })
  })

  describe('updateStatus', () => {
    it('should update the status and updated_at fields', () => {
      const order = Order.create(500)
      const initialUpdatedAt = order.updated_at

      const NEW_NOW = NOW + 10_000
      jest.spyOn(Date, 'now').mockReturnValue(NEW_NOW)
      order.updateStatus(OrderStatus.Received)

      expect(order.status).toBe(OrderStatus.Received)
      expect(order.updated_at).toBe(NEW_NOW)
      expect(order.updated_at).not.toBe(initialUpdatedAt)
    })
  })

  describe('toOutputDTO', () => {
    it('should convert the Order to OrderOutputDTO correctly', () => {
      const order = new Order({
        id: 'order-123',
        customerId: 'customer-456',
        status: OrderStatus.Received,
        total: 2000,
        createdAt: 1_700_000_000_000,
        updatedAt: 1_700_000_100_000,
      })

      const dto = order.toOutputDTO()
      expect(dto).toEqual({
        id: 'order-123',
        customer_id: 'customer-456',
        status: OrderStatus.Received,
        total: 2000,
        created_at: 1_700_000_000_000,
        create_at_date: new Date(1_700_000_000_000).toISOString(),
        updated_at: 1_700_000_100_000,
        updated_at_date: new Date(1_700_000_100_000).toISOString(),
        items: [],
        logs: [],
      })
    })

    it('should set customer_id to null in DTO if undefined', () => {
      const order = new Order({
        id: 'order-123',
        status: OrderStatus.Received,
        total: 2000,
        createdAt: 1_700_000_000_000,
        updatedAt: 1_700_000_100_000,
      })

      const dto = order.toOutputDTO()
      expect(dto.customer_id).toBeNull()
    })
  })
})
