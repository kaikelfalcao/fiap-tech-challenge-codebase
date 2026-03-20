import { mock, type MockProxy } from 'jest-mock-extended';

import type { MetricsService } from '@/shared/infrastructure/metrics/metrics.service';

export const makeMetricsMock = (): MockProxy<MetricsService> =>
  mock<MetricsService>();

export type MetricsMock = MockProxy<MetricsService>;
