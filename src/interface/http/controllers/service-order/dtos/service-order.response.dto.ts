import { ApiProperty } from '@nestjs/swagger';
import { ServiceOrderStatus } from '@domain/service-order/service-order-status.enum';

export class ServiceOrderResponseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: '123456789' })
  customerRegistrationNumber: string;

  @ApiProperty({ example: 'ABC-1234' })
  vehiclePlate: string;

  @ApiProperty({ enum: ServiceOrderStatus })
  status: ServiceOrderStatus;

  @ApiProperty({
    example: [{ partId: 'uuid-da-peca', quantity: 2 }],
  })
  parts: Array<{ partId: string; quantity: number }>;

  @ApiProperty({
    example: [{ repairId: 'uuid-do-reparo' }],
  })
  repairs: Array<{ repairId: string }>;

  @ApiProperty({
    example: '2025-01-10T12:34:56.000Z',
  })
  createdAt: string;

  @ApiProperty({
    example: '2025-01-11T09:15:00.000Z',
  })
  updatedAt: string;
}
