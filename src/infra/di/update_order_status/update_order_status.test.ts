import { UpdateOrderStatusContainerFactory } from './update_order_status'

jest.mock('@aws/rds_client', () => ({
  RDSClientWrapper: {
    getInstance: jest.fn().mockReturnValue({}),
  },
}))

jest.mock('@driven_rds/order', () => ({
  OrderRepository: jest.fn(),
}))

jest.mock('@usecases/update_order_status', () => ({
  UpdateOrderStatusUseCase: jest.fn(),
}))

import { RDSClientWrapper } from '@aws/rds_client'
import { OrderRepository } from '@driven_rds/order'
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

    expect(orderRepoMock).toHaveBeenCalledWith(rdsClient)

    const orderRepoInstance = (OrderRepository as jest.Mock).mock.instances[0]

    expect(UpdateOrderStatusUseCase).toHaveBeenCalledWith(orderRepoInstance)

    expect(factory.usecase).toBe(
      (UpdateOrderStatusUseCase as jest.Mock).mock.instances[0]
    )
  })
})

