import { StringValue } from 'ms';
import { Injectable } from '@nestjs/common';

interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  name: string;
}

interface AppConfig {
  port: number;
  env: 'development' | 'test' | 'production';
}

interface JwtConfig {
  secret: string;
  expiresIn: StringValue;
}

@Injectable()
export class ConfigService {
  private readonly databaseConfig: DatabaseConfig;
  private readonly appConfig: AppConfig;
  private readonly jwtConfig: JwtConfig;

  constructor() {
    const {
      DATABASE_HOST,
      DATABASE_PORT,
      DATABASE_USER,
      DATABASE_PASSWORD,
      DATABASE_NAME,
      APP_PORT,
      NODE_ENV,
      JWT_SECRET,
      JWT_EXPIRES_IN,
    } = process.env;

    if (
      !DATABASE_HOST ||
      !DATABASE_PORT ||
      !DATABASE_USER ||
      !DATABASE_PASSWORD ||
      !DATABASE_NAME
    ) {
      throw new Error('Missing required Database environment variables');
    }
    if (!APP_PORT || !NODE_ENV) {
      throw new Error('Missing required App environment variables');
    }
    if (!JWT_SECRET) {
      throw new Error('Missing JWT_SECRET environment variable');
    }

    this.databaseConfig = {
      host: DATABASE_HOST,
      port: Number(DATABASE_PORT),
      user: DATABASE_USER,
      password: DATABASE_PASSWORD,
      name: DATABASE_NAME,
    };

    this.appConfig = {
      port: Number(APP_PORT),
      env: NODE_ENV as 'development' | 'test' | 'production',
    };

    this.jwtConfig = {
      secret: JWT_SECRET,
      expiresIn: (JWT_EXPIRES_IN || '1d') as StringValue,
    };
  }

  get database(): DatabaseConfig {
    return this.databaseConfig;
  }

  get app(): AppConfig {
    return this.appConfig;
  }

  get jwt(): JwtConfig {
    return this.jwtConfig;
  }

  get isProduction(): boolean {
    return this.appConfig.env === 'production';
  }
}
