import type { Knex } from "knex";
import * as dotenv from "dotenv";

if (process.env.NODE_ENV !== 'ci') {
  dotenv.config({ path: '../../../../.env' });
}

const config: { [key: string]: Knex.Config } = {
  development: {
    client: "pg",
    connection: {
      database: "ms_order",
      user: "root",
      password: "root"
    },
    migrations: {
      tableName: "knex_migrations",
      directory: './migrations',
    }
  },

  production: {
    client: "pg",
    connection: {
      host: process.env.RDS_HOSTNAME,
      port: Number(process.env.RDS_PORT),
      database: "ms_order",
      user: process.env.RDS_USERNAME,
      password: process.env.RDS_PASSWORD,
      ssl: {
        rejectUnauthorized: false
      }
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: "knex_migrations",
      directory: './migrations',
    }
  }

};

module.exports = config;
