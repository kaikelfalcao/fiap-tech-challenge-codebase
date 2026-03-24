import { Injectable } from '@nestjs/common';

import type { ServiceOrderStatus } from '@/modules/service-order/domain/value-objects/service-order-status.vo';

const newrelic = require('newrelic');

@Injectable()
export class MetricsService {
  // --- Ordens de Serviço ---

  recordServiceOrderOpened(): void {
    newrelic.incrementMetric('Custom/ServiceOrder/Opened');
    newrelic.recordCustomEvent('ServiceOrderEvent', {
      event: 'opened',
      timestamp: Date.now(),
    });
  }

  recordServiceOrderStatusChanged(
    orderId: string,
    from: ServiceOrderStatus,
    to: ServiceOrderStatus,
  ): void {
    newrelic.incrementMetric(`Custom/ServiceOrder/Status/${to}`);
    newrelic.recordCustomEvent('ServiceOrderStatusChanged', {
      orderId,
      from,
      to,
      timestamp: Date.now(),
    });
  }

  recordServiceOrderFinalized(orderId: string, durationMs: number): void {
    newrelic.recordMetric(
      'Custom/ServiceOrder/FinalizationDurationMs',
      durationMs,
    );
    newrelic.recordCustomEvent('ServiceOrderFinalized', {
      orderId,
      durationMs,
      timestamp: Date.now(),
    });
  }

  recordBudgetApproved(orderId: string): void {
    newrelic.incrementMetric('Custom/ServiceOrder/BudgetApproved');
    newrelic.recordCustomEvent('ServiceOrderBudgetApproved', {
      orderId,
      timestamp: Date.now(),
    });
  }

  recordBudgetRejected(orderId: string): void {
    newrelic.incrementMetric('Custom/ServiceOrder/BudgetRejected');
    newrelic.recordCustomEvent('ServiceOrderBudgetRejected', {
      orderId,
      timestamp: Date.now(),
    });
  }

  // --- Erros ---

  recordIntegrationError(
    integration: string,
    operation: string,
    error: Error,
  ): void {
    newrelic.noticeError(error, {
      integration,
      operation,
    });
    newrelic.incrementMetric(`Custom/IntegrationError/${integration}`);
  }

  // --- Estoque ---

  recordStockBelowMinimum(
    itemId: string,
    itemCode: string,
    available: number,
  ): void {
    newrelic.recordCustomEvent('StockBelowMinimum', {
      itemId,
      itemCode,
      available,
      timestamp: Date.now(),
    });
    newrelic.incrementMetric('Custom/Inventory/StockBelowMinimum');
  }
}
