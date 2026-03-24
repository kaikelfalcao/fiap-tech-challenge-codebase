export type ServiceOrderStatus =
  | 'RECEIVED'
  | 'DIAGNOSIS'
  | 'AWAITING_APPROVAL'
  | 'IN_EXECUTION'
  | 'FINALIZED'
  | 'DELIVERED';

export const SERVICE_ORDER_STATUS_LABEL: Record<ServiceOrderStatus, string> = {
  RECEIVED: 'Recebida',
  DIAGNOSIS: 'Em diagnóstico',
  AWAITING_APPROVAL: 'Aguardando aprovação',
  IN_EXECUTION: 'Em execução',
  FINALIZED: 'Finalizada',
  DELIVERED: 'Entregue',
};

export const SERVICE_ORDER_STATUS_ORDER: Record<ServiceOrderStatus, number> = {
  IN_EXECUTION: 1,
  AWAITING_APPROVAL: 2,
  DIAGNOSIS: 3,
  RECEIVED: 4,
  FINALIZED: 5,
  DELIVERED: 6,
};
