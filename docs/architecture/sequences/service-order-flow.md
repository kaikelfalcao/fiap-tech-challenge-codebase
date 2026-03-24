# Fluxo de Abertura de Ordem de Serviço

## Descrição

O ciclo de vida de uma Ordem de Serviço (OS) no AutoFlow passa por 6 estados
distintos. Esta documentação cobre o fluxo completo desde a criação até a entrega
do veículo ao cliente.

## Estados da OS

```
RECEIVED → DIAGNOSIS → AWAITING_APPROVAL → IN_EXECUTION → FINALIZED → DELIVERED
                                         ↘ (rejeição)  → FINALIZED
```

| Estado              | Responsável      | Descrição                                                   |
| ------------------- | ---------------- | ----------------------------------------------------------- |
| `RECEIVED`          | Sistema          | OS criada, veículo recebido na oficina                      |
| `DIAGNOSIS`         | Mecânico (ADMIN) | Diagnóstico em andamento, adição de serviços/peças          |
| `AWAITING_APPROVAL` | Mecânico (ADMIN) | Orçamento enviado ao cliente                                |
| `IN_EXECUTION`      | Mecânico (ADMIN) | Orçamento aprovado, itens reservados, trabalho em andamento |
| `FINALIZED`         | Mecânico (ADMIN) | Trabalho concluído, itens consumidos do estoque             |
| `DELIVERED`         | Mecânico (ADMIN) | Veículo entregue ao cliente                                 |

## Diagrama de Sequência — Ciclo Completo

### 1. Abertura da OS (→ RECEIVED)

```
Mecânico (ADMIN)    Kong / NestJS     OpenServiceOrderUseCase    DB (PostgreSQL)
       │                  │                   │                       │
       │  POST /api/      │                   │                       │
       │  service-orders  │                   │                       │
       │  {customerTaxId, │                   │                       │
       │   vehicleLicense │                   │                       │
       │   Plate}         │                   │                       │
       │─────────────────►│                   │                       │
       │                  │  JwtAuthGuard ✓   │                       │
       │                  │  role: ADMIN      │                       │
       │                  │──────────────────►│                       │
       │                  │                   │  SELECT customers     │
       │                  │                   │  WHERE tax_id=$1      │
       │                  │                   │  AND active=true      │
       │                  │                   │──────────────────────►│
       │                  │                   │  SELECT vehicles      │
       │                  │                   │  WHERE license_plate  │
       │                  │                   │  =$1 AND customer_id  │
       │                  │                   │  = customer.id        │
       │                  │                   │──────────────────────►│
       │                  │                   │  INSERT service_orders│
       │                  │                   │  status: RECEIVED     │
       │                  │                   │  services: []         │
       │                  │                   │  items: []            │
       │                  │                   │──────────────────────►│
       │                  │                   │  { id }               │
       │                  │                   │◄──────────────────────│
       │  201 Created     │                   │                       │
       │  { id }          │                   │                       │
       │◄─────────────────│                   │                       │
```

### 2. Início do Diagnóstico (RECEIVED → DIAGNOSIS)

```
Mecânico (ADMIN)    NestJS            StartDiagnosisUseCase
       │                  │                   │
       │  PATCH /api/     │                   │
       │  service-orders/ │                   │
       │  {id}/start-     │                   │
       │  diagnosis       │                   │
       │─────────────────►│──────────────────►│
       │                  │                   │  order.startDiagnosis()
       │                  │                   │  RECEIVED → DIAGNOSIS
       │                  │                   │  UPDATE status
       │  204 No Content  │                   │
       │◄─────────────────│                   │
```

### 3. Adição de Serviços ao Orçamento (em RECEIVED ou DIAGNOSIS)

```
Mecânico (ADMIN)    NestJS            AddServiceToOrderUseCase    DB
       │                  │                   │                    │
       │  POST /api/      │                   │                    │
       │  service-orders/ │                   │                    │
       │  {id}/services   │                   │                    │
       │  { serviceId,    │                   │                    │
       │    quantity }    │                   │                    │
       │─────────────────►│──────────────────►│                    │
       │                  │                   │  SELECT catalog_   │
       │                  │                   │  services WHERE    │
       │                  │                   │  id=$1 AND active  │
       │                  │                   │──────────────────►│
       │                  │                   │  { name,          │
       │                  │                   │    base_price }   │
       │                  │                   │◄──────────────────│
       │                  │                   │                    │
       │                  │                   │  ServiceOrderService
       │                  │                   │  .create({        │
       │                  │                   │    serviceId,     │
       │                  │                   │    name,          │
       │                  │                   │    unitPriceCents,│
       │                  │                   │    quantity       │
       │                  │                   │  })               │
       │                  │                   │  order.addService()
       │                  │                   │  UPDATE services  │
       │                  │                   │  (JSONB)          │
       │                  │                   │──────────────────►│
       │  204 No Content  │                   │                    │
       │◄─────────────────│                   │                    │
```

> O mesmo fluxo se aplica para `POST /service-orders/{id}/items` (peças do estoque).

### 4. Envio do Orçamento (DIAGNOSIS → AWAITING_APPROVAL)

```
Mecânico (ADMIN)    NestJS            SendBudgetUseCase
       │                  │                   │
       │  PATCH /api/     │                   │
       │  service-orders/ │                   │
       │  {id}/send-budget│                   │
       │─────────────────►│──────────────────►│
       │                  │                   │  order.sendBudget()
       │                  │                   │  Valida: services.length ≥ 1
       │                  │                   │  DIAGNOSIS → AWAITING_APPROVAL
       │                  │                   │  budget_sent_at = NOW()
       │  204 No Content  │                   │
       │◄─────────────────│                   │
```

### 5a. Aprovação do Orçamento (AWAITING_APPROVAL → IN_EXECUTION)

```
Mecânico (ADMIN)    NestJS            ApproveBudgetUseCase       InventoryUseCase
       │                  │                   │                        │
       │  PATCH /api/     │                   │                        │
       │  service-orders/ │                   │                        │
       │  {id}/budget-    │                   │                        │
       │  response        │                   │                        │
       │  { approved:true}│                   │                        │
       │─────────────────►│──────────────────►│                        │
       │                  │                   │  order.approve()       │
       │                  │                   │  AWAITING → IN_EXEC    │
       │                  │                   │  approved_at = NOW()   │
       │                  │                   │                        │
       │                  │                   │  Para cada item JSONB: │
       │                  │                   │──────────────────────►│
       │                  │                   │  ReserveStock(itemId,  │
       │                  │                   │    quantity,           │
       │                  │                   │    referenceId: OS.id) │
       │                  │                   │  reason: RESERVATION   │
       │                  │                   │  stock.reserved += qty │
       │                  │                   │◄──────────────────────│
       │                  │                   │  UPDATE status         │
       │  204 No Content  │                   │                        │
       │◄─────────────────│                   │                        │
```

### 5b. Rejeição do Orçamento (AWAITING_APPROVAL → FINALIZED)

```
Mecânico (ADMIN)    NestJS            RejectBudgetUseCase
       │                  │                   │
       │  PATCH /api/     │                   │
       │  service-orders/ │                   │
       │  {id}/budget-    │                   │
       │  response        │                   │
       │  {approved:false}│                   │
       │─────────────────►│──────────────────►│
       │                  │                   │  order.reject()
       │                  │                   │  AWAITING → FINALIZED
       │                  │                   │  rejected_at = NOW()
       │                  │                   │  finalized_at = NOW()
       │                  │                   │  (sem movimentação
       │                  │                   │   de estoque)
       │  204 No Content  │                   │
       │◄─────────────────│                   │
```

> Rejeição encerra a OS diretamente em FINALIZED. Não há retorno ao DIAGNOSIS.

### 6. Finalização (IN_EXECUTION → FINALIZED)

```
Mecânico (ADMIN)    NestJS            FinalizeServiceOrderUseCase  InventoryUseCase
       │                  │                   │                         │
       │  PATCH /api/     │                   │                         │
       │  service-orders/ │                   │                         │
       │  {id}/finalize   │                   │                         │
       │─────────────────►│──────────────────►│                         │
       │                  │                   │  order.finalize()       │
       │                  │                   │  IN_EXECUTION→FINALIZED │
       │                  │                   │  finalized_at = NOW()   │
       │                  │                   │                         │
       │                  │                   │  Para cada item JSONB:  │
       │                  │                   │──────────────────────►│
       │                  │                   │  ConsumeStock(itemId,   │
       │                  │                   │    quantity,            │
       │                  │                   │    referenceId: OS.id)  │
       │                  │                   │  reason: CONSUMPTION    │
       │                  │                   │  stock.quantity -= qty  │
       │                  │                   │  stock.reserved -= qty  │
       │                  │                   │◄──────────────────────│
       │  204 No Content  │                   │                         │
       │◄─────────────────│                   │                         │
```

### 7. Entrega (FINALIZED → DELIVERED)

```
Mecânico (ADMIN)    NestJS            DeliverServiceOrderUseCase
       │                  │                   │
       │  PATCH /api/     │                   │
       │  service-orders/ │                   │
       │  {id}/deliver    │                   │
       │─────────────────►│──────────────────►│
       │                  │                   │  order.deliver()
       │                  │                   │  FINALIZED → DELIVERED
       │                  │                   │  delivered_at = NOW()
       │  204 No Content  │                   │
       │◄─────────────────│                   │
```

### 8. Consulta pelo Cliente (público, sem autenticação)

```
Cliente (app/portal)   NestJS
       │                  │
       │  GET /api/        │
       │  service-orders/  │
       │  customer/{taxId} │
       │  /{orderId}       │
       │─────────────────►│  @Public() — sem JWT
       │                  │  Busca OS por taxId + id
       │  200 OS completa  │
       │◄─────────────────│
       │                  │
       │  GET /api/        │
       │  service-orders/  │
       │  customer/{taxId} │  lista paginada
       │─────────────────►│
       │  200 lista OS     │
       │◄─────────────────│
```

## Rotas Completas da OS

| Método   | Rota                                       | Use-Case                  | Auth    |
| -------- | ------------------------------------------ | ------------------------- | ------- |
| `POST`   | `/service-orders`                          | OpenServiceOrder          | ADMIN   |
| `GET`    | `/service-orders`                          | ListServiceOrders         | ADMIN   |
| `GET`    | `/service-orders/:id`                      | GetServiceOrder           | ADMIN   |
| `POST`   | `/service-orders/:id/services`             | AddServiceToOrder         | ADMIN   |
| `DELETE` | `/service-orders/:id/services/:serviceId`  | RemoveServiceFromOrder    | ADMIN   |
| `POST`   | `/service-orders/:id/items`                | AddItemToOrder            | ADMIN   |
| `DELETE` | `/service-orders/:id/items/:itemId`        | RemoveItemFromOrder       | ADMIN   |
| `PATCH`  | `/service-orders/:id/start-diagnosis`      | StartDiagnosis            | ADMIN   |
| `PATCH`  | `/service-orders/:id/send-budget`          | SendBudget                | ADMIN   |
| `PATCH`  | `/service-orders/:id/budget-response`      | Approve/RejectBudget      | ADMIN   |
| `PATCH`  | `/service-orders/:id/finalize`             | FinalizeServiceOrder      | ADMIN   |
| `PATCH`  | `/service-orders/:id/deliver`              | DeliverServiceOrder       | ADMIN   |
| `GET`    | `/service-orders/customer/:taxId/:orderId` | GetServiceOrderByCustomer | Público |
| `GET`    | `/service-orders/customer/:taxId`          | ListServiceOrdersByTaxId  | Público |

> `budget-response` usa `{ "approved": true }` para aprovação e `{ "approved": false }` para rejeição.

## Regras de Transição de Estado

```
RECEIVED          → DIAGNOSIS          (startDiagnosis — sempre)
RECEIVED/DIAGNOSIS → (adicionar/remover serviços e itens)
DIAGNOSIS         → AWAITING_APPROVAL  (sendBudget — requer ≥ 1 serviço)
AWAITING_APPROVAL → IN_EXECUTION       (approve — reserva itens do estoque)
AWAITING_APPROVAL → FINALIZED          (reject — sem movimentação de estoque)
IN_EXECUTION      → FINALIZED          (finalize — consome itens reservados)
FINALIZED         → DELIVERED          (deliver)
```

Transições inválidas retornam `422 Unprocessable Entity` com mensagem descritiva.

## Estrutura JSONB — Snapshot de Serviços

```typescript
// ServiceOrderService value object
{
  serviceId: string; // UUID referência para catalog_services
  name: string; // snapshot do nome no momento da OS
  unitPriceCents: number; // snapshot do preço em centavos
  quantity: number; // quantidade (> 0)
  // totalCents = unitPriceCents * quantity (calculado em memória)
}
```

## Estrutura JSONB — Snapshot de Itens

```typescript
// ServiceOrderItem value object
{
  itemId: string; // UUID referência para inventory_items
  name: string; // snapshot do nome no momento da OS
  unitPriceCents: number; // snapshot do preço em centavos
  quantity: number; // quantidade (> 0)
  // totalCents = unitPriceCents * quantity (calculado em memória)
}
```

> Preços em centavos (integer) — sem ponto flutuante.
> O campo `totalCents` é calculado no domínio (`ServiceOrderService.totalCents`) e não é persistido no JSONB.
