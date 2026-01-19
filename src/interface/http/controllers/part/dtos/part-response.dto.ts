import { ApiProperty } from '@nestjs/swagger';

export class PartResponseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Filtro de óleo' })
  name: string;

  @ApiProperty({ example: 'FR-1234' })
  sku: string;

  @ApiProperty({ example: 49.9 })
  price: number;

  @ApiProperty({ example: 100 })
  quantity: number;

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
