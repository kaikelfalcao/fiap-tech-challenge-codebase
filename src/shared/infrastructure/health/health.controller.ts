import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';

import { Public } from '@/modules/iam/infrastructure/decorators/public.decorator';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly disk: DiskHealthIndicator,
  ) {}

  @Public()
  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      // Banco
      () => this.db.pingCheck('database'),

      // Heap — alerta acima de ~70% do limite esperado
      () => this.memory.checkHeap('memory_heap', 700 * 1024 * 1024),

      // RSS — alerta mais próximo do limite real do container
      () => this.memory.checkRSS('memory_rss', 1400 * 1024 * 1024),

      // Disco — containers quase não usam disco, mas mantém seguro
      () =>
        this.disk.checkStorage('disk', {
          thresholdPercent: 0.95,
          path: '/',
        }),
    ]);
  }

  @Public()
  @Get('liveness')
  liveness() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Public()
  @Get('readiness')
  @HealthCheck()
  readiness() {
    return this.health.check([() => this.db.pingCheck('database')]);
  }
}
