import { RDSClientWrapper } from "@aws/rds_client";
import { OrderRepository } from "./order";
import { Order, OrderStatus } from "@entities/order";

jest.mock("@aws/rds_client", () => ({
  RDSClientWrapper: jest.fn(),
}));

describe('OrderRepository', () => {
  describe('create', () => {
    it('should insert order into the database and return the order', async () => {
      const mockInsert = jest.fn().mockResolvedValue(undefined);
      const mockConnection = jest.fn().mockReturnValue({
        insert: mockInsert,
      });

      const rdsClient = {
        connection: mockConnection,
      } as unknown as RDSClientWrapper;
      
      const orderRepo = new OrderRepository(rdsClient);

      const order = Order.create(100);
      const result = await orderRepo.create(order);

      expect(mockConnection).toHaveBeenCalledWith('orders');
      expect(mockInsert).toHaveBeenCalledWith({
        id: expect.any(String),
        customer_id: undefined,
        status: 'waiting_payment',
        total: 100,
        created_at: expect.any(Number),
        updated_at: expect.any(Number),
      });
      expect(result).toBe(order);
    });
  });

  describe('findById', () => {
    it('should return an order when found', async () => {
      const mockResult = {
        id: 'order-id',
        customer_id: 'customer-id',
        status: 'waiting_payment',
        total: 150,
        created_at: 1620000000000,
        updated_at: 1620000000000,
      };

      const mockFirst = jest.fn().mockResolvedValue(mockResult);
      const mockWhere = jest.fn().mockReturnValue({
        first: mockFirst,
      });
      const mockConnection = jest.fn().mockReturnValue({
        where: mockWhere,
      });
      const rdsClient = {
        connection: mockConnection,
      } as unknown as RDSClientWrapper;

      const orderRepo = new OrderRepository(rdsClient);
      const result = await orderRepo.findById('order-id');
      expect(mockConnection).toHaveBeenCalledWith('orders');
      expect(mockWhere).toHaveBeenCalledWith({ id: 'order-id' });
      expect(result).toEqual(new Order({
        id: 'order-id',
        customerId: 'customer-id',
        status: OrderStatus.WaitingPayment,
        total: 150,
        createdAt: 1620000000000,
        updatedAt: 1620000000000,
      }));
    });

    it('should return null when order not found', async () => {
      const mockFirst = jest.fn().mockResolvedValue(undefined);
      const mockWhere = jest.fn().mockReturnValue({
        first: mockFirst,
      });
      const mockConnection = jest.fn().mockReturnValue({
        where: mockWhere,
      });
      const rdsClient = {
        connection: mockConnection,
      } as unknown as RDSClientWrapper;

      const orderRepo = new OrderRepository(rdsClient);
      const result = await orderRepo.findById('non-existent-id');
      expect(mockConnection).toHaveBeenCalledWith('orders');
      expect(mockWhere).toHaveBeenCalledWith({ id: 'non-existent-id' });
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update the order in the database and return the order', async () => {
      const mockUpdate = jest.fn().mockResolvedValue(undefined);
      const mockWhere = jest.fn().mockReturnValue({
        update: mockUpdate,
      });
      const mockConnection = jest.fn().mockReturnValue({
        where: mockWhere,
      });
      const rdsClient = {
        connection: mockConnection,
      } as unknown as RDSClientWrapper;

      const orderRepo = new OrderRepository(rdsClient);

      const order = new Order({
        id: 'order-id',
        customerId: 'customer-id',
        status: OrderStatus.Received,
        total: 200,
        createdAt: 1620000000000,
        updatedAt: 1620001000000,
      });

      const result = await orderRepo.update(order);

      expect(mockConnection).toHaveBeenCalledWith('orders');
      expect(mockWhere).toHaveBeenCalledWith({ id: 'order-id' });
      expect(mockUpdate).toHaveBeenCalledWith({
        customer_id: 'customer-id',
        status: 'received',
        total: 200,
        created_at: 1620000000000,
        updated_at: 1620001000000,
      });
      expect(result).toBe(order);
    });
  });
});