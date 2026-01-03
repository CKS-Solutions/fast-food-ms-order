
const mockConfig = { region: 'us-east-1' }

jest.mock('../utils', () => ({
  AwsRegion: {
    USEast1: 'us-east-1',
  },
  AwsStage: {
    Local: 'local',
  },
  newAwsConfig: jest.fn(() => mockConfig),
}))

jest.mock('@aws-sdk/client-secrets-manager', () => ({
  SecretsManagerClient: jest.fn(),

  GetSecretValueCommand: jest.fn().mockImplementation(function (this: any, input: any) {
    this.input = input
  }),
}))

import { SMClientWrapper } from './sm_client'
import { AwsRegion, AwsStage, newAwsConfig } from '../utils'
import { SecretsManagerClient } from '@aws-sdk/client-secrets-manager'

describe('SMClientWrapper', () => {
  const region = AwsRegion.USEast1
  const stage = AwsStage.Local

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create SecretsManagerClient with aws config based on region and stage', () => {
    new SMClientWrapper(region, stage)

    expect(newAwsConfig).toHaveBeenCalledWith(region, stage)
    expect(SecretsManagerClient).toHaveBeenCalledWith(mockConfig)
  })

  describe('getSecretValue', () => {
    it('should return SecretString when present', async () => {
      const secretId = 'my-secret-id'
      const secretString = 'my-secret-value'

      const sendMock = jest.fn().mockResolvedValue({
        SecretString: secretString,
      })

      const smClient = new SMClientWrapper(region, stage);
      
      (smClient.send as jest.Mock) = sendMock

      const result = await smClient.getSecretValue(secretId)
      expect(sendMock).toHaveBeenCalledWith(expect.objectContaining({
        input: { SecretId: secretId },
      }))
      expect(result).toBe(secretString)
    })

    it('should throw error when SecretString is not present', async () => {
      const secretId = 'my-secret-id'

      const sendMock = jest.fn().mockResolvedValue({})
      const smClient = new SMClientWrapper(region, stage);
      
      (smClient.send as jest.Mock) = sendMock

      await expect(smClient.getSecretValue(secretId)).rejects.toThrow(`Secret ${secretId} has no SecretString`)
      expect(sendMock).toHaveBeenCalledWith(expect.objectContaining({
        input: { SecretId: secretId },
      }))
    })
  })
})