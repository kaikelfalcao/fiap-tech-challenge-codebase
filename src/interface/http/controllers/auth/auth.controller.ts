import { Controller, Post, Body } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthenticateUserUseCase } from '@application/user/authenticate/authenticate-user.usecase';
import { RegisterUserUseCase } from '@application/user/register/register-user.usecase';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import {
  AuthCredentialsDto,
  AuthResponseDto,
  RegisterResponseDto,
} from './dtos/auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authUseCase: AuthenticateUserUseCase,
    private readonly registerUser: RegisterUserUseCase,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Registra um novo usuário' })
  @ApiBody({ type: AuthCredentialsDto })
  @ApiResponse({
    status: 201,
    description: 'Usuário criado com sucesso',
    type: RegisterResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou usuário já existente',
  })
  async register(
    @Body() body: AuthCredentialsDto,
  ): Promise<RegisterResponseDto> {
    await this.registerUser.execute(body.username, body.password);

    return { message: 'User created' };
  }

  @Post('login')
  @ApiOperation({ summary: 'Autentica um usuário e retorna um JWT' })
  @ApiBody({ type: AuthCredentialsDto })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciais inválidas',
  })
  async login(@Body() body: AuthCredentialsDto): Promise<AuthResponseDto> {
    const user = await this.authUseCase.execute(body.username, body.password);

    const payload = { sub: user.id, username: user.username };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
