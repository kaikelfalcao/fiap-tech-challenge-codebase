import { ApiProperty } from '@nestjs/swagger';

export class RepairResponseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Troca de embreagem' })
  description: string;

  @ApiProperty({ example: 1200.5 })
  cost: number;

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
