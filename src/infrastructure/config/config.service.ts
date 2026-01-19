import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { envSchema, Env } from './config.schema';

@Injectable()
export class ConfigService {
  private readonly env: Env;

  constructor() {
    const parsed = envSchema.safeParse(process.env);

    if (!parsed.success) {
      const tree = z.treeifyError(parsed.error);
      console.error('Invalid environment variables:');
      console.dir(tree, { depth: null });

      console.error('Invalid environment variables:');
      throw new Error('Invalid environment configuration');
    }

    this.env = parsed.data;
  }

  get postgres() {
    return {
      host: this.env.POSTGRES_HOST,
      port: this.env.POSTGRES_PORT,
      user: this.env.POSTGRES_USER,
      password: this.env.POSTGRES_PASSWORD,
      database: this.env.POSTGRES_DB,
    };
  }

  get app() {
    return {
      port: this.env.APP_PORT,
      env: this.env.NODE_ENV,
    };
  }

  get jwt() {
    return {
      secret: this.env.JWT_SECRET,
      expiresIn: this.env.JWT_EXPIRES_IN,
    };
  }

  isProduction() {
    return this.env.NODE_ENV === 'production';
  }
}
