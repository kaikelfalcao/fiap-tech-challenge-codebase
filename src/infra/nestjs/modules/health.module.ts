import { Module } from '@nestjs/common';
import { HealthController } from 'src/interface/http/health.controller';

@Module({
  controllers: [HealthController],
})
export class HealthModule {}
