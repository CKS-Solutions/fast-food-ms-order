import { defineFeature, loadFeature } from 'jest-cucumber';
import { join } from 'path';
import { UpdateOrderStatusUseCase } from './update_order_status';
import { OrderStatus } from '@entities/order';
import { IOrderLogRepository } from '@ports/order-log_repository';
import { IOrderRepository } from '@ports/order_repository';
import { HTTPBadRequest, HTTPNotFound } from '@utils/http';

const feature = loadFeature(join(__dirname, 'features/update_order_status.feature'));

defineFeature(feature, (test) => {
  let orderRepository: jest.Mocked<IOrderRepository>;
  let orderLogRepository: jest.Mocked<IOrderLogRepository>;
  let useCase: UpdateOrderStatusUseCase;
  let result: { message: string } | null;
  let error: Error | null;
  let orderId: string;
  let currentStatus: OrderStatus;
  let newStatus: OrderStatus;

  const makeOrder = (id: string, status: OrderStatus) => ({
    id,
    status,
    updateStatus: jest.fn(),
  });

  beforeEach(() => {
    orderRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    } as jest.Mocked<IOrderRepository>;

    orderLogRepository = {
      create: jest.fn(),
      findByOrderId: jest.fn(),
    } as jest.Mocked<IOrderLogRepository>;

    useCase = new UpdateOrderStatusUseCase(orderRepository, orderLogRepository);
    result = null;
    error = null;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Atualizar status de pedido seguindo o fluxo correto', ({ given, when, then, and }) => {
    given(/^que existe um pedido com id "(.*)" com status "(.*)"$/, (id: string, status: string) => {
      orderId = id;
      currentStatus = status as OrderStatus;
      const order = makeOrder(id, currentStatus);
      orderRepository.findById.mockResolvedValue(order as any);
    });

    when(/^eu atualizo o status do pedido "(.*)" para "(.*)"$/, async (id: string, status: string) => {
      newStatus = status as OrderStatus;
      try {
        result = await useCase.execute(id, newStatus);
      } catch (e) {
        error = e as Error;
      }
    });

    then(/^o status do pedido deve ser atualizado para "(.*)"$/, (status: string) => {
      expect(error).toBeNull();
      expect(result).not.toBeNull();
      expect(orderRepository.findById).toHaveBeenCalledWith(orderId);
      expect(orderRepository.update).toHaveBeenCalled();
    });

    and('um log de status deve ser criado', () => {
      expect(orderLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.any(String),
          order_id: orderId,
          status: newStatus,
          timestamp: expect.any(Number),
        })
      );
    });

    and('uma mensagem de sucesso deve ser retornada', () => {
      expect(result).not.toBeNull();
      expect(result?.message).toContain('successfully');
    });
  });

  test('Tentar atualizar status de pedido inexistente', ({ given, when, then, and }) => {
    given(/^que não existe um pedido com id "(.*)"$/, (id: string) => {
      orderId = id;
      orderRepository.findById.mockResolvedValue(null);
    });

    when(/^eu atualizo o status do pedido "(.*)" para "(.*)"$/, async (id: string, status: string) => {
      newStatus = status as OrderStatus;
      try {
        result = await useCase.execute(id, newStatus);
      } catch (e) {
        error = e as Error;
      }
    });

    then('deve ser lançado um erro HTTPNotFound', () => {
      expect(error).toBeInstanceOf(HTTPNotFound);
      expect(result).toBeNull();
    });

    and(/^a mensagem de erro deve ser "(.*)"$/, (expectedMessage: string) => {
      expect(error?.message).toBe(expectedMessage);
    });
  });

  test('Tentar atualizar status de pedido finalizado', ({ given, when, then, and }) => {
    given(/^que existe um pedido com id "(.*)" com status "(.*)"$/, (id: string, status: string) => {
      orderId = id;
      currentStatus = status as OrderStatus;
      const order = makeOrder(id, currentStatus);
      orderRepository.findById.mockResolvedValue(order as any);
    });

    when(/^eu atualizo o status do pedido "(.*)" para "(.*)"$/, async (id: string, status: string) => {
      newStatus = status as OrderStatus;
      try {
        result = await useCase.execute(id, newStatus);
      } catch (e) {
        error = e as Error;
      }
    });

    then('deve ser lançado um erro HTTPBadRequest', () => {
      expect(error).toBeInstanceOf(HTTPBadRequest);
      expect(result).toBeNull();
    });

    and(/^a mensagem de erro deve ser "(.*)"$/, (expectedMessage: string) => {
      expect(error?.message).toBe(expectedMessage);
    });
  });

  test('Tentar atualizar status de pedido cancelado', ({ given, when, then, and }) => {
    given(/^que existe um pedido com id "(.*)" com status "(.*)"$/, (id: string, status: string) => {
      orderId = id;
      currentStatus = status as OrderStatus;
      const order = makeOrder(id, currentStatus);
      orderRepository.findById.mockResolvedValue(order as any);
    });

    when(/^eu atualizo o status do pedido "(.*)" para "(.*)"$/, async (id: string, status: string) => {
      newStatus = status as OrderStatus;
      try {
        result = await useCase.execute(id, newStatus);
      } catch (e) {
        error = e as Error;
      }
    });

    then('deve ser lançado um erro HTTPBadRequest', () => {
      expect(error).toBeInstanceOf(HTTPBadRequest);
      expect(result).toBeNull();
    });

    and(/^a mensagem de erro deve ser "(.*)"$/, (expectedMessage: string) => {
      expect(error?.message).toBe(expectedMessage);
    });
  });

  test('Tentar pular etapas do fluxo de status', ({ given, when, then, and }) => {
    given(/^que existe um pedido com id "(.*)" com status "(.*)"$/, (id: string, status: string) => {
      orderId = id;
      currentStatus = status as OrderStatus;
      const order = makeOrder(id, currentStatus);
      orderRepository.findById.mockResolvedValue(order as any);
    });

    when(/^eu atualizo o status do pedido "(.*)" para "(.*)"$/, async (id: string, status: string) => {
      newStatus = status as OrderStatus;
      try {
        result = await useCase.execute(id, newStatus);
      } catch (e) {
        error = e as Error;
      }
    });

    then('deve ser lançado um erro HTTPBadRequest', () => {
      expect(error).toBeInstanceOf(HTTPBadRequest);
      expect(result).toBeNull();
    });

    and(/^a mensagem de erro deve indicar que não é possível mudar de "(.*)" para "(.*)"$/, (fromStatus: string, toStatus: string) => {
      expect(error?.message).toContain(fromStatus);
      expect(error?.message).toContain(toStatus);
    });
  });

  test('Cancelar pedido em andamento', ({ given, when, then, and }) => {
    given(/^que existe um pedido com id "(.*)" com status "(.*)"$/, (id: string, status: string) => {
      orderId = id;
      currentStatus = status as OrderStatus;
      const order = makeOrder(id, currentStatus);
      orderRepository.findById.mockResolvedValue(order as any);
    });

    when(/^eu atualizo o status do pedido "(.*)" para "(.*)"$/, async (id: string, status: string) => {
      newStatus = status as OrderStatus;
      try {
        result = await useCase.execute(id, newStatus);
      } catch (e) {
        error = e as Error;
      }
    });

    then(/^o status do pedido deve ser atualizado para "(.*)"$/, (status: string) => {
      expect(error).toBeNull();
      expect(result).not.toBeNull();
      expect(orderRepository.findById).toHaveBeenCalledWith(orderId);
      expect(orderRepository.update).toHaveBeenCalled();
    });

    and('um log de status deve ser criado', () => {
      expect(orderLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.any(String),
          order_id: orderId,
          status: newStatus,
          timestamp: expect.any(Number),
        })
      );
    });

    and('uma mensagem de cancelamento deve ser retornada', () => {
      expect(result).not.toBeNull();
      expect(result?.message).toContain('cancelled');
      expect(result?.message).toContain('successfully');
    });
  });

  test('Tentar atualizar para o mesmo status', ({ given, when, then, and }) => {
    given(/^que existe um pedido com id "(.*)" com status "(.*)"$/, (id: string, status: string) => {
      orderId = id;
      currentStatus = status as OrderStatus;
      const order = makeOrder(id, currentStatus);
      orderRepository.findById.mockResolvedValue(order as any);
    });

    when(/^eu atualizo o status do pedido "(.*)" para "(.*)"$/, async (id: string, status: string) => {
      newStatus = status as OrderStatus;
      try {
        result = await useCase.execute(id, newStatus);
      } catch (e) {
        error = e as Error;
      }
    });

    then('deve ser lançado um erro HTTPBadRequest', () => {
      expect(error).toBeInstanceOf(HTTPBadRequest);
      expect(result).toBeNull();
    });

    and(/^a mensagem de erro deve ser "(.*)"$/, (expectedMessage: string) => {
      expect(error?.message).toBe(expectedMessage);
    });
  });
});

