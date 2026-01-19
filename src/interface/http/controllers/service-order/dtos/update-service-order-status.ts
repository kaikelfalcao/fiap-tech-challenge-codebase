import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ServiceOrderStatus } from '@domain/service-order/service-order-status.enum';

export class UpdateServiceOrderStatusDto {
  @ApiProperty({
    enum: ServiceOrderStatus,
    example: ServiceOrderStatus.InDiagnosis,
  })
  @IsEnum(ServiceOrderStatus)
  newStatus: ServiceOrderStatus;
}
