import { CreateOrderUseCase } from "@usecases/create_order"
import { RDSClientWrapper } from "@aws/rds_client"
import { OrderRepository } from "@driven_rds/order"
import { OrderItemRepository } from "@driven_rds/order-item"
import { RDSCredentials } from "@utils/rds"
import { AwsRegion, AwsStage } from "@aws/utils"
import { LambdaClientWrapper } from "@aws/lambda_client"
import { LambdaAdapter } from "@driven_lambda/lambda"

export class CreateOrderContainerFactory {
	usecase: CreateOrderUseCase

	constructor(credentials: RDSCredentials, stage: AwsStage, region: AwsRegion) {
		const lambdaClient = new LambdaClientWrapper(region, stage)
		const rdsClient = RDSClientWrapper.getInstance({
			host: credentials.host,
			user: credentials.user,
			password: credentials.password,
			pool: credentials.pool,
			useSsl: credentials.useSsl,
		})

		const orderRepo = new OrderRepository(rdsClient)
		const orderItemRepo = new OrderItemRepository(rdsClient)
		const lambdaAdapter = new LambdaAdapter(lambdaClient)

		this.usecase = new CreateOrderUseCase(orderRepo, orderItemRepo, lambdaAdapter)
	}
}
