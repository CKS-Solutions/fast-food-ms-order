import { getRDSCredentials, getCredentialsFromRDSSecretManager } from './rds';
import { AwsRegion, AwsStage } from '@aws/utils';
import { HTTPPreconditionFailed } from '@utils/http';

jest.mock('@aws/sm_client', () => ({
  SMClientWrapper: jest.fn().mockImplementation(() => ({
    getSecretValue: jest.fn(),
  })),
}));

import { SMClientWrapper } from '@aws/sm_client';

describe('RDS Credentials', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetAllMocks();
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  describe('getRDSCredentials', () => {
    it('should return local credentials for local stage', async () => {
      const creds = await getRDSCredentials(AwsRegion.USEast1, AwsStage.Local);
      expect(creds).toEqual({
        host: 'host.docker.internal',
        user: 'root',
        password: 'root',
      });
    });

    it('should throw if DB_SECRET_ARN is not set', async () => {
      process.env.DB_SECRET_ARN = '';
      process.env.DB_HOST = 'some-host';
      await expect(getRDSCredentials(AwsRegion.USEast1, AwsStage.Prod))
        .rejects.toThrow(HTTPPreconditionFailed);
    });

    it('should throw if DB_HOST is not set', async () => {
      process.env.DB_SECRET_ARN = 'secret-arn';
      process.env.DB_HOST = '';
      await expect(getRDSCredentials(AwsRegion.USEast1, AwsStage.Prod))
        .rejects.toThrow(HTTPPreconditionFailed);
    });

    it('should call getCredentialsFromRDSSecretManager with SMClientWrapper', async () => {
      process.env.DB_SECRET_ARN = 'secret-arn';
      process.env.DB_HOST = 'db-host';

      const mockSecretValue = JSON.stringify({ username: 'admin', password: 'pass' });
      (SMClientWrapper as jest.MockedClass<typeof SMClientWrapper>).mockImplementation(() => ({
        getSecretValue: jest.fn().mockResolvedValue(mockSecretValue),
      }) as any);

      const creds = await getRDSCredentials(AwsRegion.USEast1, AwsStage.Prod);

      expect(creds).toEqual({
        host: 'db-host',
        user: 'admin',
        password: 'pass',
        pool: { min: 2, max: 10 },
        useSsl: true,
      });
    });
  });

  describe('getCredentialsFromRDSSecretManager', () => {
    it('should parse secret and return RDSCredentials', async () => {
      const mockSecretValue = JSON.stringify({ username: 'u', password: 'p' });
      const smClient = {
        getSecretValue: jest.fn().mockResolvedValue(mockSecretValue),
      } as unknown as SMClientWrapper;

      process.env.DB_HOST = 'db-host';
      const creds = await getCredentialsFromRDSSecretManager(smClient);

      expect(smClient.getSecretValue).toHaveBeenCalledWith('');
      expect(creds).toEqual({
        host: 'db-host',
        user: 'u',
        password: 'p',
        pool: { min: 2, max: 10 },
        useSsl: true,
      });
    });
  });
});
