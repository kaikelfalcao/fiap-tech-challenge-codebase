import { Controller, Post, Body } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthenticateUserUseCase } from '@application/user/authenticate/authenticate-user.usecase';
import { RegisterUserUseCase } from '@application/user/register/register-user.usecase';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authUseCase: AuthenticateUserUseCase,
    private readonly registerUser: RegisterUserUseCase,
  ) {}

  @Post('register')
  async register(@Body() body: { username: string; password: string }) {
    await this.registerUser.execute(body.username, body.password);

    return { message: 'User created' };
  }

  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    const user = await this.authUseCase.execute(body.username, body.password);

    const payload = { sub: user.id, username: user.username };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
