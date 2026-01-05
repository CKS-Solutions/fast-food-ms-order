import { ListOrdersContainerFactory } from './list_orders'

jest.mock('@aws/rds_client', () => ({
  RDSClientWrapper: {
    getInstance: jest.fn().mockReturnValue({}),
  },
}))

jest.mock('@driven_rds/order', () => ({
  OrderRepository: jest.fn(),
}))

jest.mock('@driven_rds/order-item', () => ({
  OrderItemRepository: jest.fn(),
}))

jest.mock('@driven_rds/order-log', () => ({
  OrderLogRepository: jest.fn(),
}))

jest.mock('@usecases/list_orders', () => ({
  ListOrdersUseCase: jest.fn(),
}))

import { RDSClientWrapper } from '@aws/rds_client'
import { OrderRepository } from '@driven_rds/order'
import { OrderItemRepository } from '@driven_rds/order-item'
import { OrderLogRepository } from '@driven_rds/order-log'
import { ListOrdersUseCase } from '@usecases/list_orders'
import { RDSCredentials } from '@utils/rds'

describe('ListOrdersContainerFactory', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should correctly wire all dependencies and expose usecase', () => {
    const credentialsMock: RDSCredentials = {
      host: 'localhost',
      user: 'user',
      password: 'pass',
    }

    const factory = new ListOrdersContainerFactory(credentialsMock)

    expect(RDSClientWrapper.getInstance).toHaveBeenCalledWith(credentialsMock)

    const rdsMock = RDSClientWrapper as jest.MockedClass<typeof RDSClientWrapper>

    expect(rdsMock).toBeDefined()
    expect(rdsMock.getInstance).toHaveBeenCalledWith(credentialsMock)

    const rdsClient = (rdsMock.getInstance as jest.Mock).mock.results[0].value
    const orderRepoMock = OrderRepository as jest.MockedClass<typeof OrderRepository>
    const orderItemRepoMock = OrderItemRepository as jest.MockedClass<typeof OrderItemRepository>
    const orderLogRepoMock = OrderLogRepository as jest.MockedClass<typeof OrderLogRepository>

    expect(orderRepoMock).toHaveBeenCalledWith(rdsClient)
    expect(orderItemRepoMock).toHaveBeenCalledWith(rdsClient)
    expect(orderLogRepoMock).toHaveBeenCalledWith(rdsClient)

    const orderRepoInstance = (OrderRepository as jest.Mock).mock.instances[0]
    const orderItemRepoInstance = (OrderItemRepository as jest.Mock).mock.instances[0]
    const orderLogRepoInstance = (OrderLogRepository as jest.Mock).mock.instances[0]

    expect(ListOrdersUseCase).toHaveBeenCalledWith(orderRepoInstance, orderItemRepoInstance, orderLogRepoInstance)

    expect(factory.usecase).toBe(
      (ListOrdersUseCase as jest.Mock).mock.instances[0]
    )
  })
})

