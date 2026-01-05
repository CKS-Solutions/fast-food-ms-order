import { OrderItem } from './order-item'

describe('OrderItem', () => {
  const NOW = 1_700_000_000_000

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(NOW)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('create', () => {
    it('should create a payment with default values', () => {
      const orderItem = OrderItem.create(
        'order-123',
        'product-123',
        2,
        500,
      )

      expect(orderItem).toBeInstanceOf(OrderItem)

      expect(orderItem.product_id).toBe('product-123')
      expect(orderItem.order_id).toBe('order-123')
      expect(orderItem.quantity).toBe(2)
      expect(orderItem.price).toBe(500)
    })
  })

  describe('toOutputDTO', () => {
    it('should convert the OrderItem to OrderItemsOutputDTO correctly', () => {
      const orderItem = new OrderItem({
        id: 'item-123',
        productId: 'product-456',
        orderId: 'order-789',
        quantity: 3,
        price: 1500,
      })

      const outputDTO = orderItem.toOutputDTO()

      expect(outputDTO).toEqual({
        product_id: 'product-456',
        quantity: 3,
        price: 1500,
      })
    })
  })
})
