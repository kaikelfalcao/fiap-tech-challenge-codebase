import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
} from '@nestjs/common';

import { ChangePasswordUseCase } from '../../application/use-cases/change-password/change-password.use-case';
import { GetMeUseCase } from '../../application/use-cases/get-me/get-me.use-case';
import { LoginUseCase } from '../../application/use-cases/login/login.use-case';
import { RegisterUserUseCase } from '../../application/use-cases/register-user/register-user.use-case';
import { CurrentUser } from '../../infrastructure/decorators/current-user.decorator';
import { Public } from '../../infrastructure/decorators/public.decorator';
import type { JwtPayload } from '../../infrastructure/jwt/jwt.payload';

import { ChangePasswordDto } from './dtos/change-password.dto';
import { LoginDto } from './dtos/login.dto';
import { RegisterUserDto } from './dtos/register-user.dto';

@Controller('iam')
export class IamController {
  constructor(
    private readonly registerUser: RegisterUserUseCase,
    private readonly login: LoginUseCase,
    private readonly changePassword: ChangePasswordUseCase,
    private readonly getMe: GetMeUseCase,
  ) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterUserDto) {
    return this.registerUser.execute(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async loginRoute(@Body() dto: LoginDto) {
    return this.login.execute(dto);
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  async me(@CurrentUser() user: JwtPayload) {
    return this.getMe.execute({ userId: user.sub });
  }

  @Patch('me/password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async changePasswordRoute(
    @CurrentUser() user: JwtPayload,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.changePassword.execute({
      userId: user.sub,
      currentPassword: dto.currentPassword,
      newPassword: dto.newPassword,
    });
  }
}
