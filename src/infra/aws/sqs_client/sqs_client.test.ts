
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

jest.mock('@aws-sdk/client-sqs', () => ({
  SQSClient: jest.fn(),
}))

import { SQSClientWrapper } from './sqs_client'
import { AwsRegion, AwsStage, newAwsConfig } from '../utils'
import { SQSClient } from '@aws-sdk/client-sqs'

describe('SQSClientWrapper', () => {
  const region = AwsRegion.USEast1
  const stage = AwsStage.Local

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create SQSClient with aws config based on region and stage', () => {
    new SQSClientWrapper(region, stage)

    expect(newAwsConfig).toHaveBeenCalledWith(region, stage)
    expect(SQSClient).toHaveBeenCalledWith(mockConfig)
  })
})