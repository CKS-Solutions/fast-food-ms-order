import { RDSClientWrapper } from "@aws/rds_client";
import { OrderRepository } from "@driven_rds/order";
import { GetOrderStatusUseCase } from "@usecases/get_order_status";
import { RDSCredentials } from "@utils/rds";

export class GetOrderStatusContainerFactory {
  usecase: GetOrderStatusUseCase;

  constructor(credentials: RDSCredentials) {
    const rdsClient = RDSClientWrapper.getInstance({
      host: credentials.host,
      user: credentials.user,
      password: credentials.password,
      pool: credentials.pool,
      useSsl: credentials.useSsl,
    })

    const orderRepo = new OrderRepository(rdsClient)

    this.usecase = new GetOrderStatusUseCase(orderRepo)
  }
}