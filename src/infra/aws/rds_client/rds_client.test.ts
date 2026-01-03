import { RDSClientWrapper } from './rds_client';
import { knex } from 'knex';

jest.mock('knex');

describe('RDSClientWrapper', () => {
  const host = 'localhost';
  const user = 'testuser';
  const password = 'testpass';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new instance with correct config', () => {
    new RDSClientWrapper({ host, user, password, useSsl: true });

    expect(knex).toHaveBeenCalledTimes(1);

    const calledWith = (knex as unknown as jest.Mock).mock.calls[0][0];
    expect(calledWith.client).toBe('pg');
    expect(calledWith.connection.host).toBe(host);
    expect(calledWith.connection.user).toBe(user);
    expect(calledWith.connection.password).toBe(password);
    expect(calledWith.connection.database).toBe('ms_order');
    expect(calledWith.connection.ssl).toEqual({ rejectUnauthorized: false });
  });

  it('should handle useSsl false correctly', () => {
    new RDSClientWrapper({ host, user, password, useSsl: false });

    const calledWith = (knex as unknown as jest.Mock).mock.calls[0][0];
    expect(calledWith.connection.ssl).toBeUndefined();
  });

  it('should use pool config if provided', () => {
    const poolConfig = { min: 0, max: 5 };
    new RDSClientWrapper({ host, user, password, pool: poolConfig });

    const calledWith = (knex as unknown as jest.Mock).mock.calls[0][0];
    expect(calledWith.pool).toEqual(poolConfig);
  });

  it('getInstance should return the same instance (singleton)', () => {
    const first = RDSClientWrapper.getInstance({ host, user, password });
    const second = RDSClientWrapper.getInstance({ host, user, password });

    expect(first).toBe(second);
    expect(knex).toHaveBeenCalledTimes(1);
  });
});
