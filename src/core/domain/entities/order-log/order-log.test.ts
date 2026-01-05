import { OrderStatus } from '@entities/order/order.types'
import { OrderLog } from './order-log'

describe('OrderLog', () => {
  const NOW = 1_700_000_000_000

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(NOW)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('create', () => {
    it('should create a payment with default values', () => {
      const orderLog = OrderLog.create(
        'order-123',
        OrderStatus.WaitingPayment,
      )

      expect(orderLog).toBeInstanceOf(OrderLog)

      expect(orderLog.order_id).toBe('order-123')
      expect(orderLog.status).toBe(OrderStatus.WaitingPayment)
      expect(orderLog.timestamp).toBe(NOW)
    })
  })
})
