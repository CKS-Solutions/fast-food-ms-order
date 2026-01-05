import { RDSClientWrapper } from "@aws/rds_client";
import { OrderRepository } from "@driven_rds/order";
import { OrderItemRepository } from "@driven_rds/order-item";
import { OrderLogRepository } from "@driven_rds/order-log";
import { ListOrdersUseCase } from "@usecases/list_orders";
import { RDSCredentials } from "@utils/rds";

export class ListOrdersContainerFactory {
  usecase: ListOrdersUseCase;

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
    const orderLogRepo = new OrderLogRepository(rdsClient)

    this.usecase = new ListOrdersUseCase(orderRepo, orderItemRepo, orderLogRepo)
  }
}