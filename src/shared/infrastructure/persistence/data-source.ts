import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';

dotenv.config();

const isProd = process.env.NODE_ENV === 'production';

export const AppDataSource = new DataSource({
  type: 'postgres',

  host: isProd ? process.env.DB_HOST : 'localhost',
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,

  entities: [
    isProd ? 'dist/src/modules/**/*.model.js' : 'src/modules/**/*.model.ts',
  ],

  migrations: [
    isProd
      ? 'dist/src/modules/**/infrastructure/persistence/migrations/*.js'
      : 'src/modules/**/infrastructure/persistence/migrations/*.ts',
  ],

  synchronize: false,
  logging: !isProd,
});
