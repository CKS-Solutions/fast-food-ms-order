import { CreateOrderInputDTO } from "@dto/create_order"
import { Order } from "@entities/order/order"
import { IOrderRepository } from "@ports/order_repository"
import { OrderItem } from "@entities/order-item"
import { IOrderItemRepository } from "@ports/order-item_repository"
import { HTTPInternalServerError } from "@utils/http"

export class CreateOrderUseCase {
	private readonly orderRepository: IOrderRepository
	private readonly orderItemRepository: IOrderItemRepository

	constructor(
		orderRepository: IOrderRepository,
		orderItemRepository: IOrderItemRepository,
	) {
		this.orderRepository = orderRepository
		this.orderItemRepository = orderItemRepository
	}

	async execute(params: CreateOrderInputDTO): Promise<void> {
		const order = Order.create(params.total, params.customer_id)

		try {
			await this.orderRepository.create(order)
		} catch (error) {
			console.error('Error creating order:', error)
			throw new HTTPInternalServerError('Failed to create order')
		}

		const items: OrderItem[] = params.products.map(item => OrderItem.create(
			order.id,
			item.product_id,
			item.quantity,
			item.price,
		))

		try {
			await this.orderItemRepository.createMany(items)
		} catch (error) {
			console.error('Error creating order items:', error)
			throw new HTTPInternalServerError('Failed to create order items')
		}
	}
}