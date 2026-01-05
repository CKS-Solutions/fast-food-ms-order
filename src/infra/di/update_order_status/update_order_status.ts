import { RDSClientWrapper } from "@aws/rds_client";
import { OrderRepository } from "@driven_rds/order";
import { OrderLogRepository } from "@driven_rds/order-log";
import { UpdateOrderStatusUseCase } from "@usecases/update_order_status";
import { RDSCredentials } from "@utils/rds";

export class UpdateOrderStatusContainerFactory {
  usecase: UpdateOrderStatusUseCase;

  constructor(credentials: RDSCredentials) {
    const rdsClient = RDSClientWrapper.getInstance({
      host: credentials.host,
      user: credentials.user,
      password: credentials.password,
      pool: credentials.pool,
      useSsl: credentials.useSsl,
    })

    const orderRepo = new OrderRepository(rdsClient)
    const orderLogRepo = new OrderLogRepository(rdsClient)

    this.usecase = new UpdateOrderStatusUseCase(orderRepo, orderLogRepo)
  }
}