import { GetOrderStatusContainerFactory } from './get_order_status'

jest.mock('@aws/rds_client', () => ({
  RDSClientWrapper: {
    getInstance: jest.fn().mockReturnValue({}),
  },
}))

jest.mock('@driven_rds/order', () => ({
  OrderRepository: jest.fn(),
}))

jest.mock('@usecases/get_order_status', () => ({
  GetOrderStatusUseCase: jest.fn(),
}))

import { RDSClientWrapper } from '@aws/rds_client'
import { OrderRepository } from '@driven_rds/order'
import { GetOrderStatusUseCase } from '@usecases/get_order_status'
import { RDSCredentials } from '@utils/rds'

describe('GetOrderStatusContainerFactory', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should correctly wire all dependencies and expose usecase', () => {
    const credentialsMock: RDSCredentials = {
      host: 'localhost',
      user: 'user',
      password: 'pass',
    }

    const factory = new GetOrderStatusContainerFactory(credentialsMock)

    expect(RDSClientWrapper.getInstance).toHaveBeenCalledWith(credentialsMock)

    const rdsMock = RDSClientWrapper as jest.MockedClass<typeof RDSClientWrapper>

    expect(rdsMock).toBeDefined()
    expect(rdsMock.getInstance).toHaveBeenCalledWith(credentialsMock)

    const rdsClient = (rdsMock.getInstance as jest.Mock).mock.results[0].value
    const orderRepoMock = OrderRepository as jest.MockedClass<typeof OrderRepository>

    expect(orderRepoMock).toHaveBeenCalledWith(rdsClient)

    const orderRepoInstance = (OrderRepository as jest.Mock).mock.instances[0]

    expect(GetOrderStatusUseCase).toHaveBeenCalledWith(orderRepoInstance)

    expect(factory.usecase).toBe(
      (GetOrderStatusUseCase as jest.Mock).mock.instances[0]
    )
  })
})

