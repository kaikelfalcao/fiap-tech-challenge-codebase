import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmConfigModule } from './infrastructure/persistence/typeorm/typeorm.module';
import { CustomerModule } from './infrastructure/nest/modules/customer.module';
import { OpenTelemetryModule } from 'nestjs-otel';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    OpenTelemetryModule.forRoot({
      metrics: {
        hostMetrics: true,
      },
    }),
    TypeOrmConfigModule,
    CustomerModule,
  ],
})
export class AppModule {}
