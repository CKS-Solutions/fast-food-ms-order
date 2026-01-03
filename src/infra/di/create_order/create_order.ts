import { CreateOrderUseCase } from "@usecases/create_order"
import { RDSClientWrapper } from "@aws/rds_client"
import { OrderRepository } from "@driven_rds/order"
import { OrderItemRepository } from "@driven_rds/order-item"
import { RDSCredentials } from "@utils/rds"

export class CreateOrderContainerFactory {
	usecase: CreateOrderUseCase

	constructor(credentials: RDSCredentials) {
		const rdsClient = RDSClientWrapper.getInstance({
			host: credentials.host,
			user: credentials.user,
			password: credentials.password,
			pool: credentials.pool,
			useSsl: credentials.useSsl,
		})

		const orderRepo = new OrderRepository(rdsClient)
		const orderItemRepo = new OrderItemRepository(rdsClient)

		this.usecase = new CreateOrderUseCase(orderRepo, orderItemRepo)
	}
}
