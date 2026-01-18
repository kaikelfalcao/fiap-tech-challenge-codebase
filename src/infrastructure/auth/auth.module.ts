import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '../config/config.service';
import { AuthController } from 'src/interface/http/auth.controller';
import { AuthenticateUserUseCase } from 'src/application/usecases/user/authenticate-user.usecase';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegisterUserUseCase } from 'src/application/usecases/user/register-user.usecase';
import { UserOrmEntity } from '@infrastructure/database/typeorm/entities/user.orm';
import { TypeormUserRepository } from '@infrastructure/database/typeorm/repositories/typeorm-user.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserOrmEntity]),
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.jwt.secret,
        signOptions: {
          expiresIn: config.jwt.expiresIn,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    JwtStrategy,

    AuthenticateUserUseCase,
    RegisterUserUseCase,

    {
      provide: 'UserRepository',
      useClass: TypeormUserRepository,
    },
  ],
  exports: [JwtModule],
})
export class AuthModule {}
