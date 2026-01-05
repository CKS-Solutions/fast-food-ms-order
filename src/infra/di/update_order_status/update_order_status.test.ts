import { UpdateOrderStatusContainerFactory } from './update_order_status'

jest.mock('@aws/rds_client', () => ({
  RDSClientWrapper: {
    getInstance: jest.fn().mockReturnValue({}),
  },
}))

jest.mock('@driven_rds/order', () => ({
  OrderRepository: jest.fn(),
}))

jest.mock('@driven_rds/order-log', () => ({
  OrderLogRepository: jest.fn(),
}))

jest.mock('@usecases/update_order_status', () => ({
  UpdateOrderStatusUseCase: jest.fn(),
}))

import { RDSClientWrapper } from '@aws/rds_client'
import { OrderRepository } from '@driven_rds/order'
import { OrderLogRepository } from '@driven_rds/order-log'
import { UpdateOrderStatusUseCase } from '@usecases/update_order_status'
import { RDSCredentials } from '@utils/rds'

describe('UpdateOrderStatusContainerFactory', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should correctly wire all dependencies and expose usecase', () => {
    const credentialsMock: RDSCredentials = {
      host: 'localhost',
      user: 'user',
      password: 'pass',
    }

    const factory = new UpdateOrderStatusContainerFactory(credentialsMock)

    expect(RDSClientWrapper.getInstance).toHaveBeenCalledWith(credentialsMock)

    const rdsMock = RDSClientWrapper as jest.MockedClass<typeof RDSClientWrapper>

    expect(rdsMock).toBeDefined()
    expect(rdsMock.getInstance).toHaveBeenCalledWith(credentialsMock)

    const rdsClient = (rdsMock.getInstance as jest.Mock).mock.results[0].value

    const orderRepoMock = OrderRepository as jest.MockedClass<typeof OrderRepository>
    const orderLogRepoMock = OrderLogRepository as jest.MockedClass<typeof OrderLogRepository>

    expect(orderRepoMock).toHaveBeenCalledWith(rdsClient)
    expect(orderLogRepoMock).toHaveBeenCalledWith(rdsClient)

    const orderRepoInstance = (OrderRepository as jest.Mock).mock.instances[0]
    const orderLogRepoInstance = (OrderLogRepository as jest.Mock).mock.instances[0]

    expect(UpdateOrderStatusUseCase).toHaveBeenCalledWith(orderRepoInstance, orderLogRepoInstance)

    expect(factory.usecase).toBe(
      (UpdateOrderStatusUseCase as jest.Mock).mock.instances[0]
    )
  })
})

