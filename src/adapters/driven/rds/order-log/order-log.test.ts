import { RDSClientWrapper } from "@aws/rds_client";
import { OrderLogRepository } from "./order-log";
import { OrderLog } from "@entities/order-log";
import { OrderStatus } from "@entities/order";

jest.mock("@aws/rds_client", () => ({
  RDSClientWrapper: jest.fn(),
}));

describe('OrderLogRepository', () => {
  describe('create', () => {
    it('should create an order log', async () => {
      const mockInsert = jest.fn().mockResolvedValue(undefined);
      const mockConnection = jest.fn().mockReturnValue({
        insert: mockInsert,
      });
      
      const rdsClient = {
        connection: mockConnection,
      } as unknown as RDSClientWrapper;

      const orderLogRepo = new OrderLogRepository(rdsClient);
      const orderLog = OrderLog.create('order1', OrderStatus.WaitingPayment);

      await orderLogRepo.create(orderLog);

      expect(mockConnection).toHaveBeenCalledWith('order_logs');
      expect(mockInsert).toHaveBeenCalledWith(orderLog);
    });
  })
})