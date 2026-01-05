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

  describe('findByOrderId', () => {
    it('should find order items by order ID', async () => {
      const mockSelect = jest.fn().mockResolvedValue([
        { id: 'item1', order_id: 'order1', product_id: 'product1', quantity: 2, price: 100 },
        { id: 'item2', order_id: 'order1', product_id: 'product2', quantity: 1, price: 50 },
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

      const orderItemRepo = new OrderItemRepository(rdsClient);

      const results = await orderItemRepo.findByOrderId('order1');
      expect(mockConnection).toHaveBeenCalledWith('order_items');
      expect(mockWhere).toHaveBeenCalledWith({ order_id: 'order1' });
      expect(results).toHaveLength(2);
      expect(results[0]).toBeInstanceOf(OrderItem);
      expect(results[0].id).toBe('item1');
      expect(results[1].id).toBe('item2');
    });
  });
})