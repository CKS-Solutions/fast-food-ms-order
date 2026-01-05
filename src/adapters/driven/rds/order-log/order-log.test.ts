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

  describe('findByOrderId', () => {
    it('should find order logs by order ID', async () => {
      const mockSelect = jest.fn().mockResolvedValue([
        { id: 'log1', order_id: 'order1', status: 'waiting_payment', timestamp: 1620000000 },
        { id: 'log2', order_id: 'order1', status: 'received', timestamp: 1620003600 },
      ]);

      const mockWhere = jest.fn().mockReturnValue({
        select: mockSelect,
      });

      const mockConnection = jest.fn().mockReturnValue({
        where: mockWhere,
      });

      const rdsClient = {
        connection: mockConnection,
      } as unknown as RDSClientWrapper;

      const orderLogRepo = new OrderLogRepository(rdsClient);
      const results = await orderLogRepo.findByOrderId('order1');
      expect(mockConnection).toHaveBeenCalledWith('order_logs');
      expect(mockWhere).toHaveBeenCalledWith({ order_id: 'order1' });
      expect(results).toHaveLength(2);
      expect(results[0]).toBeInstanceOf(OrderLog);
      expect(results[0].id).toBe('log1');
    });
  })
})