import { ListOrdersInputDTO } from "@dto/list-orders";
import { OrderOutputDTO } from "@dto/order";
import { OrderStatus } from "@entities/order";
import { IOrderItemRepository } from "@ports/order-item_repository";
import { IOrderLogRepository } from "@ports/order-log_repository";
import { IOrderRepository } from "@ports/order_repository";

const STATUS_PRIORITY_ORDER = [
  OrderStatus.Ready,
  OrderStatus.InPreparation,
  OrderStatus.Received,
];

export class ListOrdersUseCase {
  private readonly orderRepo: IOrderRepository;
  private readonly orderItemRepo: IOrderItemRepository;
  private readonly orderLogRepo: IOrderLogRepository;

  constructor(
    orderRepo: IOrderRepository,
    orderItemRepo: IOrderItemRepository,
    orderLogRepo: IOrderLogRepository,
  ) {
    this.orderRepo = orderRepo;
    this.orderItemRepo = orderItemRepo;
    this.orderLogRepo = orderLogRepo;
  }

  async execute(params: ListOrdersInputDTO): Promise<OrderOutputDTO[]> {
    const orders = await this.orderRepo.findAll(
      params.page,
      params.limit,
    );

    const ordersDTO: OrderOutputDTO[] = orders.map(order => order.toOutputDTO());

    for (const orderDTO of ordersDTO) {
      const items = await this.orderItemRepo.findByOrderId(orderDTO.id);
      orderDTO.items = items.map(item => item.toOutputDTO());

      const logs = await this.orderLogRepo.findByOrderId(orderDTO.id);
      orderDTO.logs = logs.map(log => log.toOutputDTO());
    }

    return ordersDTO.sort((a, b) => {
      const statusAIndex = STATUS_PRIORITY_ORDER.indexOf(a.status as OrderStatus);
      const statusBIndex = STATUS_PRIORITY_ORDER.indexOf(b.status as OrderStatus);
      return statusAIndex - statusBIndex;
    });
  }
}