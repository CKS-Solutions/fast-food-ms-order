import { CreateOrderProcessorUseCase } from './create_order_processor'
import { IOrderQueue } from '@ports/order_queue'
import { HTTPBadRequest } from '@utils/http'
import { CreateOrderInputDTO } from '@dto/create_order'

describe('CreateOrderProcessorUseCase', () => {
  let orderQueue: jest.Mocked<IOrderQueue>
  let usecase: CreateOrderProcessorUseCase

  beforeEach(() => {
    orderQueue = {
      sendOrderProcessingRequest: jest.fn(),
    }

    usecase = new CreateOrderProcessorUseCase(orderQueue)
  })

  describe('when no products are provided', () => {
    it('should throw BadRequest', async () => {
      const params: CreateOrderInputDTO = {
        products: [],
      }

      await expect(usecase.execute(params)).rejects.toBeInstanceOf(HTTPBadRequest)
      await expect(usecase.execute(params)).rejects.toThrow('At least one product is required')
    })
  })

  describe('when product id is invalid', () => {
    test.each([
      { product_id: '' },
      { product_id: '   ' },
      { product_id: undefined },
    ])('should throw BadRequest for product_id: "$product_id"', async ({ product_id }) => {
      const params = {
        products: [{ product_id, quantity: 1, price: 100 }],
      } as CreateOrderInputDTO

      await expect(usecase.execute(params)).rejects.toBeInstanceOf(HTTPBadRequest)
      await expect(usecase.execute(params)).rejects.toThrow('Product ID is required for each product')
    })
  })

  describe('when product quantity is invalid', () => {
    test.each([
      { quantity: 0 },
      { quantity: -5 },
      { quantity: undefined },
    ])('should throw BadRequest for quantity: $quantity', async ({ quantity }) => {
      const params = {
        products: [{ product_id: 'prod-123', quantity, price: 100 }],
      } as CreateOrderInputDTO

      await expect(usecase.execute(params)).rejects.toBeInstanceOf(HTTPBadRequest)
      await expect(usecase.execute(params)).rejects.toThrow('Product quantity must be greater than zero')
    })
  })

  describe('when product price is invalid', () => {
    test.each([
      { price: 0 },
      { price: -20 },
      { price: undefined },
    ])('should throw BadRequest for price: $price', async ({ price }) => {
      const params = {
        products: [{ product_id: 'prod-123', quantity: 1, price }],
      } as CreateOrderInputDTO

      await expect(usecase.execute(params)).rejects.toBeInstanceOf(HTTPBadRequest)
      await expect(usecase.execute(params)).rejects.toThrow('Product price must be greater than zero')
    })
  })

  describe('when input is valid', () => {
    describe('with customer_id', () => {
      it('should queue the order processing request successfully', async () => {
        const params: CreateOrderInputDTO = {
          customer_id: 'cust-123',
          products: [
            { product_id: 'prod-123', quantity: 2, price: 100 },
          ],
        }

        const result = await usecase.execute(params)

        expect(orderQueue.sendOrderProcessingRequest).toHaveBeenCalledWith(params)
        expect(result).toEqual({ message: 'Order processing request queued successfully' })
      })
    })

    describe('without customer_id', () => {
      it('should queue the order processing request successfully', async () => {
        const params: CreateOrderInputDTO = {
          products: [
            { product_id: 'prod-456', quantity: 3, price: 50 },
          ],
        }

        const result = await usecase.execute(params)

        expect(orderQueue.sendOrderProcessingRequest).toHaveBeenCalledWith(params)
        expect(result).toEqual({ message: 'Order processing request queued successfully' })
      })
    })
  })
})
