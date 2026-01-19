import { ApiProperty } from '@nestjs/swagger';

export class AuthCredentialsDto {
  @ApiProperty({ example: 'kaike', description: 'Nome de usuário' })
  username: string;

  @ApiProperty({ example: '123456', description: 'Senha do usuário' })
  password: string;
}

export class AuthResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT de acesso',
  })
  access_token: string;
}

export class RegisterResponseDto {
  @ApiProperty({ example: 'User created' })
  message: string;
}
