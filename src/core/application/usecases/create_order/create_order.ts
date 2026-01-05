import { CreateOrderInputDTO } from "@dto/create_order"
import { Order } from "@entities/order/order"
import { IOrderRepository } from "@ports/order_repository"
import { OrderItem } from "@entities/order-item"
import { IOrderItemRepository } from "@ports/order-item_repository"
import { HTTPInternalServerError } from "@utils/http"
import { ILambdaAdapter } from "@ports/lambda"
import { getStage } from "@utils/env"

export class CreateOrderUseCase {
	private readonly orderRepository: IOrderRepository
	private readonly orderItemRepository: IOrderItemRepository
	private readonly lambdaAdapter: ILambdaAdapter

	constructor(
		orderRepository: IOrderRepository,
		orderItemRepository: IOrderItemRepository,
		lambdaAdapter: ILambdaAdapter,
	) {
		this.orderRepository = orderRepository
		this.orderItemRepository = orderItemRepository
		this.lambdaAdapter = lambdaAdapter
	}

	async execute(params: CreateOrderInputDTO): Promise<void> {
		const total = params.products.reduce((sum, item) => sum + item.price * item.quantity, 0)
		const order = Order.create(total, params.customer_id)

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

		const stage = getStage()

		interface GeneratePaymentPayload {
			external_id: string
			description: string
			amount: number
		}

		await this.lambdaAdapter.invokeEvent<GeneratePaymentPayload>(
			`ms-payment-${stage}-generatePaymentProcessor`,
			{
				external_id: order.id,
				description: `Order payment for order ID: ${order.id}`,
				amount: order.total,
			},
		)
	}
}