# Diagrama Entidade-Relacionamento — AutoFlow

## Diagrama ER

```
┌─────────────────────────┐
│        iam_users        │
├─────────────────────────┤
│ id          UUID PK     │
│ tax_id      VARCHAR UK  │  ← CPF
│ name        VARCHAR     │
│ password_hash VARCHAR   │
│ role        ENUM        │  ← ADMIN | CUSTOMER
│ active      BOOLEAN     │
│ created_at  TIMESTAMP   │
│ updated_at  TIMESTAMP   │
└─────────────────────────┘


┌─────────────────────────┐
│        customers        │
├─────────────────────────┤
│ id          UUID PK     │
│ tax_id      VARCHAR UK  │  ← CPF (pode coincidir com iam_users)
│ full_name   VARCHAR     │
│ phone       VARCHAR     │
│ email       VARCHAR     │
│ active      BOOLEAN     │
│ created_at  TIMESTAMP   │
│ updated_at  TIMESTAMP   │
└──────────┬──────────────┘
           │ 1
           │ tem muitos
           │ N
┌──────────▼──────────────┐
│         vehicles        │
├─────────────────────────┤
│ id           UUID PK    │
│ customer_id  UUID FK ───┼──► customers.id
│ license_plate VARCHAR UK│  ← placa única
│ brand        VARCHAR    │
│ model        VARCHAR    │
│ year         INTEGER    │
│ created_at   TIMESTAMP  │
│ updated_at   TIMESTAMP  │
└──────────┬──────────────┘
           │
           │ 1 veículo tem muitas OSs
           │ N
           │
┌──────────▼──────────────┐     ┌─────────────────────────┐
│     service_orders      │     │     catalog_services     │
├─────────────────────────┤     ├─────────────────────────┤
│ id            UUID PK   │     │ id          UUID PK      │
│ customer_id   UUID FK ──┼──►  │ code        VARCHAR UK   │
│ vehicle_id    UUID FK ──┘     │ name        VARCHAR      │
│ status        ENUM      │     │ description TEXT         │
│               RECEIVED  │     │ base_price  INTEGER      │  ← centavos
│               DIAGNOSIS │     │ est_duration INTEGER     │  ← minutos
│               AWAITING_ │     │ active      BOOLEAN      │
│               APPROVAL  │     │ created_at  TIMESTAMP    │
│               IN_EXEC.. │     │ updated_at  TIMESTAMP    │
│               FINALIZED │     └─────────────────────────┘
│               DELIVERED │
│ services      JSONB     │  ← snapshot de catalog_services
│ items         JSONB     │  ← snapshot de inventory_items
│ budget_sent_at TIMESTAMPTZ NULL
│ approved_at   TIMESTAMPTZ NULL
│ rejected_at   TIMESTAMPTZ NULL
│ finalized_at  TIMESTAMPTZ NULL
│ delivered_at  TIMESTAMPTZ NULL
│ created_at    TIMESTAMP │
│ updated_at    TIMESTAMP │
└─────────────────────────┘


┌─────────────────────────┐
│     inventory_items     │
├─────────────────────────┤
│ id          UUID PK     │
│ code        VARCHAR UK  │
│ name        VARCHAR     │
│ type        ENUM        │  ← PART | SUPPLY
│ unit        VARCHAR     │  ← UN, KG, L, M
│ unit_price  INTEGER     │  ← centavos
│ active      BOOLEAN     │
│ created_at  TIMESTAMP   │
│ updated_at  TIMESTAMP   │
└──────────┬──────────────┘
           │ 1
           │
           │ 1
┌──────────▼──────────────┐
│    inventory_stocks     │
├─────────────────────────┤
│ id          UUID PK     │
│ item_id     UUID FK UK ─┼──► inventory_items.id (1:1)
│ quantity    INTEGER     │  ← estoque total físico
│ reserved    INTEGER     │  ← reservado para OSs em execução
│ minimum     INTEGER     │  ← alerta de estoque mínimo
│ updated_at  TIMESTAMP   │
└──────────┬──────────────┘
           │ 1
           │ tem muitos
           │ N
┌──────────▼──────────────┐
│ inventory_stock_movements│
├─────────────────────────┤
│ id           UUID PK    │
│ stock_id     UUID FK ───┼──► inventory_stocks.id
│ quantity     INTEGER    │  ← positivo = entrada, negativo = saída
│ reason       ENUM       │  ← PURCHASE | ADJUSTMENT |
│                         │    RESERVATION | RELEASE | CONSUMPTION
│ reference_id VARCHAR    │  ← referência opcional (ex: service_orders.id)
│ note         TEXT       │
│ created_at   TIMESTAMP  │
└─────────────────────────┘
```

## JSONB Detalhado

### service_orders.services

Campos do value object `ServiceOrderService`:

```json
[
  {
    "serviceId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "name": "Troca de óleo e filtro",
    "unitPriceCents": 8000,
    "quantity": 1
  },
  {
    "serviceId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "name": "Alinhamento e balanceamento",
    "unitPriceCents": 12000,
    "quantity": 1
  }
]
```

> `totalCents` por linha = `unitPriceCents × quantity` (calculado em memória, não persistido)

### service_orders.items

Campos do value object `ServiceOrderItem`:

```json
[
  {
    "itemId": "a4c9ada0-c7ed-4c6a-b5ea-5a3bd15843a9",
    "name": "Filtro de óleo Mann W914/2",
    "unitPriceCents": 3500,
    "quantity": 1
  },
  {
    "itemId": "b1d8c623-4a7e-4b9c-b1d8-6c7e9d0e1f2a",
    "name": "Óleo motor 5W30 sintético",
    "unitPriceCents": 4200,
    "quantity": 4
  }
]
```

## Índices

| Tabela                      | Coluna(s)       | Tipo   | Motivo                      |
| --------------------------- | --------------- | ------ | --------------------------- |
| `iam_users`                 | `tax_id`        | UNIQUE | Login por CPF               |
| `customers`                 | `tax_id`        | UNIQUE | Unicidade de cliente        |
| `vehicles`                  | `license_plate` | UNIQUE | Unicidade de placa          |
| `vehicles`                  | `customer_id`   | INDEX  | Listar veículos por cliente |
| `inventory_items`           | `code`          | UNIQUE | Busca por código            |
| `inventory_stocks`          | `item_id`       | UNIQUE | Estoque 1:1 com item        |
| `catalog_services`          | `code`          | UNIQUE | Busca por código            |
| `service_orders`            | `customer_id`   | INDEX  | OSs por cliente             |
| `service_orders`            | `vehicle_id`    | INDEX  | OSs por veículo             |
| `service_orders`            | `status`        | INDEX  | Filtro por status           |
| `service_orders`            | `services`      | GIN    | Queries JSONB               |
| `service_orders`            | `items`         | GIN    | Queries JSONB               |
| `inventory_stock_movements` | `stock_id`      | INDEX  | Histórico por estoque       |
