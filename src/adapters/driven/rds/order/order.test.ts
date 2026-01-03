import { RDSClientWrapper } from "@aws/rds_client";
import { OrderRepository } from "./order";
import { Order } from "@entities/order";

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
});