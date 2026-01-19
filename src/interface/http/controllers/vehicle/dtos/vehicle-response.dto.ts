import { ApiProperty } from '@nestjs/swagger';

export class VehicleResponseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Toyota' })
  brand: string;

  @ApiProperty({ example: 'Corolla' })
  model: string;

  @ApiProperty({ example: 2022 })
  year: number;

  @ApiProperty({ example: 'ABC-1234' })
  plate: string;

  @ApiProperty({ example: 'uuid-do-cliente' })
  customerId: string;

  @ApiProperty({
    example: '2025-01-10T12:34:56.000Z',
    required: false,
  })
  createdAt?: string;

  @ApiProperty({
    example: '2025-01-12T08:20:00.000Z',
    required: false,
  })
  updatedAt?: string;
}
