# Relacionamentos e Decisões de Modelagem

## Visão Geral dos Relacionamentos

```
iam_users          — entidade independente (usuários do sistema)
customers          — entidade independente (clientes da oficina)
  └── vehicles     — N:1 com customers
        └── service_orders — N:1 com customers + N:1 com vehicles
catalog_services   — entidade independente (referenciada via JSONB em service_orders)
inventory_items    — entidade independente
  └── inventory_stocks       — 1:1 com inventory_items
        └── inventory_stock_movements — N:1 com inventory_stocks
```

## Detalhamento por Relacionamento

### customers → vehicles (1:N)

Um cliente pode ter múltiplos veículos. Um veículo pertence a exatamente um cliente.

```sql
vehicles.customer_id UUID REFERENCES customers(id)
```

- `customer_id` nunca é nulo — veículo sem cliente não existe no sistema
- `license_plate` é único globalmente — duas oficinas não cadastram o mesmo veículo
- Deleção de cliente: `ON DELETE RESTRICT` — não remove cliente com veículo cadastrado

### customers + vehicles → service_orders (N:1 + N:1)

Uma OS é associada a um cliente E a um veículo. Ambas as FKs são obrigatórias.

```sql
service_orders.customer_id UUID REFERENCES customers(id)
service_orders.vehicle_id  UUID REFERENCES vehicles(id)
```

**Nota de design**: manter `customer_id` em `service_orders` é uma desnormalização
intencional — evita JOIN extra (`service_orders → vehicles → customers`) em listagens
frequentes de OS por cliente.

### service_orders ↔ catalog_services (JSONB, sem FK)

Os serviços vinculados a uma OS são armazenados como snapshot JSONB:

```
service_orders.services JSONB  ←  snapshot de catalog_services
```

Não existe tabela `service_order_services`. Veja [ADR-004](../adrs/ADR-004-jsonb-service-order.md)
para a justificativa completa.

**Consequência**: `service_id` dentro do JSONB é referência "soft" — o registro em
`catalog_services` pode ser desativado sem impacto no histórico de OSs. A validação
de existência acontece na camada de aplicação antes de gerar o snapshot.

### service_orders ↔ inventory_items (JSONB, sem FK)

Mesmo padrão dos serviços:

```
service_orders.items JSONB  ←  snapshot de inventory_items
```

Quando a OS transita para `IN_EXECUTION`, a camada de aplicação:

1. Lê os itens do JSONB
2. Busca `inventory_stocks` por `item_id`
3. Debita `quantity` do estoque
4. Cria `inventory_stock_movements` com `reason: SERVICE_ORDER`

### inventory_items → inventory_stocks (1:1)

Cada item de estoque tem exatamente um registro de estoque. A relação 1:1 foi
modelada como tabela separada para isolar dados de negócio (item: código, nome,
preço) de dados operacionais (stock: quantidade atual, reservas, mínimo).

```sql
inventory_stocks.item_id UUID UNIQUE REFERENCES inventory_items(id)
```

- `quantity`: estoque total físico
- `reserved`: quantidade comprometida com OSs em `IN_EXECUTION` (não disponível para novas OS)
- `available = quantity - reserved`: quantidade real disponível

### inventory_stocks → inventory_stock_movements (1:N)

Todo débito, crédito ou ajuste no estoque gera um movimento. Isso cria um log
de auditoria completo.

```sql
inventory_stock_movements.stock_id UUID REFERENCES inventory_stocks(id)
```

| reason        | Quando gerado                               | Efeito no estoque                          |
| ------------- | ------------------------------------------- | ------------------------------------------ |
| `PURCHASE`    | Entrada de mercadoria (AddStock)            | `quantity += amount`                       |
| `RESERVATION` | OS aprovada (ApproveBudget)                 | `reserved += amount`                       |
| `RELEASE`     | Reserva cancelada (ReleaseStock)            | `reserved -= amount`                       |
| `CONSUMPTION` | OS finalizada (FinalizeServiceOrder)        | `quantity -= amount`, `reserved -= amount` |
| `ADJUSTMENT`  | Correção manual de inventário (AdjustStock) | `quantity = novoValor`                     |

`reference_id` é opcional: quando `reason = RESERVATION | RELEASE | CONSUMPTION`, aponta para `service_orders.id`.

**Ciclo de estoque por OS:**

1. `ApproveBudget` → `RESERVATION` (quantidade fica reservada, não debitada ainda)
2. `FinalizeServiceOrder` → `CONSUMPTION` (debita do total e zera a reserva)
3. `available = quantity - reserved` — quantidade disponível para novas OSs

## Decisões de Modelagem

### CPF em iam_users e customers

`iam_users` e `customers` são entidades **separadas** intencionalmente:

- `iam_users`: controla **acesso ao sistema** — funcionários e clientes com login
- `customers`: representa o **cliente da oficina** — dados de contato, histórico

Um cliente pode ter login (`iam_users` com `role: CUSTOMER`) ou não.
Um usuário ADMIN não precisa estar em `customers`.

Esta separação evita acoplamento entre o subsistema de autenticação e o subsistema
de CRM da oficina.

### Preços em centavos (INTEGER)

Todos os preços são armazenados como inteiros representando centavos:

```
R$ 80,00 → 8000
R$ 1.250,50 → 125050
```

Razões:

- Sem perda de precisão de ponto flutuante
- Operações aritméticas exatas no banco e na aplicação
- Padrão em sistemas financeiros (Stripe, PagSeguro usam centavos)

### Timestamps padrão

Todas as tabelas têm `created_at` e `updated_at` gerenciados automaticamente pelo
TypeORM (`@CreateDateColumn`, `@UpdateDateColumn`).

`service_orders` adiciona `finalized_at TIMESTAMP NULL` — preenchido na transição
para `FINALIZED`. Permite calcular SLA (tempo de execução da OS).

### UUIDs como PKs

Todas as PKs são UUID v4 (`uuid-ossp` extension no PostgreSQL).

Razões:

- Sem vazamento de volume (IDs sequenciais revelam quantidade de registros)
- Geração no cliente possível (sem roundtrip ao banco para obter ID)
- Compatível com ambientes distribuídos

TypeORM: `@PrimaryGeneratedColumn('uuid')`

### Soft delete via `active`

Entidades como `iam_users`, `customers`, `inventory_items` e `catalog_services`
usam campo `active BOOLEAN DEFAULT true` em vez de `deleted_at` (soft delete).

Razões:

- Consultas padrão incluem `WHERE active = true` — mais simples que checar NULL
- Histórico preservado: OS criadas com itens/serviços desativados mantêm o snapshot
- Sem risco de `LEFT JOIN` acidental recuperar registros "deletados"
