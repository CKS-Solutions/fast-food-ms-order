import { CreateOrderContainerFactory } from './create_order'
import { AwsStage } from '@aws/utils'

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

jest.mock('@usecases/create_order', () => ({
  CreateOrderUseCase: jest.fn(),
}))

import { RDSClientWrapper } from '@aws/rds_client'
import { OrderRepository } from '@driven_rds/order'
import { OrderItemRepository } from '@driven_rds/order-item'
import { CreateOrderUseCase } from '@usecases/create_order'
import { RDSCredentials } from '@utils/rds'

describe('CreateOrderContainerFactory', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should correctly wire all dependencies and expose usecase', () => {
    const credentialsMock: RDSCredentials = {
      host: 'localhost',
      user: 'user',
      password: 'pass',
    }

    const factory = new CreateOrderContainerFactory(credentialsMock)

    expect(RDSClientWrapper.getInstance).toHaveBeenCalledWith(credentialsMock)

    const rdsMock = RDSClientWrapper as jest.MockedClass<typeof RDSClientWrapper>

    expect(rdsMock).toBeDefined()
    expect(rdsMock.getInstance).toHaveBeenCalledWith(credentialsMock)

    const rdsClient = (rdsMock.getInstance as jest.Mock).mock.results[0].value

    const orderRepoMock = OrderRepository as jest.MockedClass<typeof OrderRepository>
    const orderItemRepoMock = OrderItemRepository as jest.MockedClass<typeof OrderItemRepository>

    expect(orderRepoMock).toHaveBeenCalledWith(rdsClient)
    expect(orderItemRepoMock).toHaveBeenCalledWith(rdsClient)

    const orderRepoInstance = (OrderRepository as jest.Mock).mock.instances[0]
    const orderItemRepoInstance = (OrderItemRepository as jest.Mock).mock.instances[0]

    expect(CreateOrderUseCase).toHaveBeenCalledWith(
      orderRepoInstance,
      orderItemRepoInstance
    )

    expect(factory.usecase).toBe(
      (CreateOrderUseCase as jest.Mock).mock.instances[0]
    )
  })
})

