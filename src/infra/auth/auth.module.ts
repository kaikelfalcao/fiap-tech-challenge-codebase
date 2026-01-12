import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '../config/config.service';
import { AuthController } from 'src/interface/http/auth.controller';
import { AuthenticateUserUseCase } from 'src/application/usecases/user/authenticate-user.usecase';
import { TypeormUserRepository } from '../typeorm/repositories/typeorm-user.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserOrmEntity } from '../typeorm/entities/user.orm';
import { RegisterUserUseCase } from 'src/application/usecases/user/register-user.usecase';

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
