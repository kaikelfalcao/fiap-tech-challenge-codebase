import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import type { StringValue } from 'ms';

import { ChangePasswordUseCase } from './application/use-cases/change-password/change-password.use-case';
import { GetMeUseCase } from './application/use-cases/get-me/get-me.use-case';
import { LoginUseCase } from './application/use-cases/login/login.use-case';
import { RegisterUserUseCase } from './application/use-cases/register-user/register-user.use-case';
import { USER_REPOSITORY } from './domain/user.repository';
import { GlobalAuthGuard } from './infrastructure/guards/global-auth.guard';
import { RolesGuard } from './infrastructure/guards/roles.guard';
import { JwtStrategy } from './infrastructure/jwt/jwt.strategy';
import { AdminSeed } from './infrastructure/persistence/seeds/admin.seed';
import { UserOrmEntity } from './infrastructure/persistence/user.typeorm.entity';
import { UserTypeOrmRepository } from './infrastructure/persistence/user.typeorm.repository';
import { IamController } from './presentation/http/iam.controller';

const USE_CASES = [
  RegisterUserUseCase,
  LoginUseCase,
  ChangePasswordUseCase,
  GetMeUseCase,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([UserOrmEntity]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRES_IN', '8h') as StringValue,
        },
      }),
    }),
  ],
  controllers: [IamController],
  providers: [
    { provide: USER_REPOSITORY, useClass: UserTypeOrmRepository },
    JwtStrategy,
    AdminSeed,
    ...USE_CASES,
    { provide: APP_GUARD, useClass: GlobalAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
  exports: [JwtModule],
})
export class IamModule {}
