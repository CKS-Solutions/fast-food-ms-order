import { RDSClientWrapper } from "@aws/rds_client";
import { OrderItemRepository } from "./order-item";
import { OrderItem } from "@entities/order-item";

jest.mock("@aws/rds_client", () => ({
  RDSClientWrapper: jest.fn(),
}));

describe('OrderItemRepository', () => {
  describe('createMany', () => {
    it('should create multiple order items', async () => {
      const mockInsert = jest.fn().mockResolvedValue(undefined);
      const mockConnection = jest.fn().mockReturnValue({
        insert: mockInsert,
      });
      
      const rdsClient = {
        connection: mockConnection,
      } as unknown as RDSClientWrapper;

      const orderItemRepo = new OrderItemRepository(rdsClient);
      const orderItems = [
        OrderItem.create('order1', 'product1', 2, 100),
        OrderItem.create('order1', 'product2', 1, 50),
      ];

      await orderItemRepo.createMany(orderItems);

      expect(mockConnection).toHaveBeenCalledWith('order_items');
      expect(mockInsert).toHaveBeenCalledWith(orderItems);
    });
  })
})