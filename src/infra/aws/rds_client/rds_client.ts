import { Knex, knex } from "knex";

let instance: RDSClientWrapper | null = null;

const CLIENT = 'pg';
const DATABASE = 'ms_order';

export class RDSClientWrapper {
  connection: Knex;

  constructor({
    host, user, password, pool, useSsl,
  }: {
    host: string;
    user: string;
    password: string;
    pool?: Knex.PoolConfig;
    useSsl?: boolean;
  }) {
    this.connection = knex({
      client: CLIENT,
      connection: {
        host: host,
        user: user,
        password: password,
        database: DATABASE,
        ssl: useSsl ? { rejectUnauthorized: false } : undefined
      },
      pool,
    });
  }

  static getInstance({
    host, user, password, pool, useSsl,
  }: {
    host: string;
    user: string;
    password: string;
    pool?: Knex.PoolConfig;
    useSsl?: boolean;
  }): RDSClientWrapper {
    instance = instance ?? new RDSClientWrapper({ host, user, password, pool, useSsl });

    return instance;
  }
}