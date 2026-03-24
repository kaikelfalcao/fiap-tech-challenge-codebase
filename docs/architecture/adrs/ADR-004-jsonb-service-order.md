# ADR-004 — JSONB para Itens de OS (Snapshot Imutável)

| Campo        | Valor                               |
| ------------ | ----------------------------------- |
| **Status**   | Aceito                              |
| **Data**     | 2024                                |
| **Contexto** | Modelo de dados de Ordem de Serviço |

## Contexto

Uma Ordem de Serviço (OS) referencia serviços do catálogo e peças do estoque.
O problema central: **os preços do catálogo e do estoque mudam ao longo do tempo**.
Uma OS aberta em janeiro com "Troca de óleo" a R$80 não deve ser afetada quando
esse serviço é reajustado para R$95 em março.

Além disso, o histórico de OSs precisa ser auditável — o que foi cobrado deve
ser exatamente o que o cliente aprovou.

## Opções Consideradas

### JSONB com snapshot (escolhido)

Colunas `services JSONB` e `items JSONB` na tabela `service_orders` armazenam
o estado completo no momento da OS.

```json
[
  {
    "service_id": "uuid",
    "name": "Troca de óleo",
    "price_snapshot": 8000,
    "quantity": 1
  }
]
```

**Prós:**

- Imutabilidade garantida: alterações no catálogo não afetam OSs existentes
- Sem JOINs para recuperar detalhes de uma OS (tudo em uma linha)
- Flexível: campos adicionais no snapshot sem migration de tabela de relacionamento
- PostgreSQL JSONB com índice GIN suporta queries dentro do JSON

**Contras:**

- Dados duplicados (preço em `catalog_services` e em `service_orders`)
- Sem FK real para `catalog_services` dentro do JSONB (integridade referencial manual)
- Queries de "qual OS usou o serviço X" requerem `@>` operator (mais complexo que JOIN)

### Tabela de relacionamento (service_order_services)

```sql
CREATE TABLE service_order_services (
  order_id UUID REFERENCES service_orders,
  service_id UUID REFERENCES catalog_services,
  quantity INT,
  price_at_order NUMERIC  -- snapshot do preço
);
```

**Prós:**

- FK real → integridade referencial pelo banco
- Queries simples com JOIN

**Contras:**

- 2 tabelas adicionais (serviços + itens) aumentam complexidade do schema
- `price_at_order` ainda precisa ser snapshot — não elimina o problema central
- Mais migrations para evoluir o modelo

### Referência direta sem snapshot (sem histórico)

```sql
service_id UUID REFERENCES catalog_services  -- preço atual na query
```

**Contras:**

- Reajuste de preço corrompe o histórico de OSs — inaceitável para auditoria

### Versioning de catálogo (SCD Tipo 2)

Manter versões históricas de `catalog_services` com `valid_from`/`valid_to`.

**Contras:**

- Extremamente complexo de implementar e manter
- Queries muito mais elaboradas
- Overkill para o problema

## Decisão

**JSONB com snapshot imutável** foi escolhido para `service_orders.services`
e `service_orders.items`.

O snapshot captura no momento da transição para `AWAITING_APPROVAL` todos os
dados necessários: id de referência, nome, preço unitário, quantidade.

## Implementação

```typescript
// ServiceOrderService — value object persistido como JSONB
class ServiceOrderService {
  serviceId: string; // UUID referência para catalog_services
  name: string; // snapshot do nome
  unitPriceCents: number; // snapshot do preço em centavos (imutável)
  quantity: number; // quantidade (> 0)
  // totalCents = unitPriceCents * quantity (calculado, não persistido)
}

// ServiceOrderItem — value object persistido como JSONB
class ServiceOrderItem {
  itemId: string; // UUID referência para inventory_items
  name: string; // snapshot do nome
  unitPriceCents: number; // snapshot do preço em centavos (imutável)
  quantity: number; // quantidade (> 0)
}
```

```typescript
// TypeORM entity (service-order.typeorm.entity.ts)
@Column({ name: 'services', type: 'jsonb', default: '[]' })
services: string;  // deserializado para ServiceOrderService[] no mapper

@Column({ name: 'items', type: 'jsonb', default: '[]' })
items: string;     // deserializado para ServiceOrderItem[] no mapper
```

## Consequências

### Positivas

- Histórico auditável: OS de anos atrás mostra exatamente o que foi cobrado
- Performance de leitura: uma query retorna OS completa sem JOINs
- Evolução do catálogo sem impacto em OSs antigas

### Negativas / Mitigações

- **Inconsistência de nome**: se o nome de um serviço for corrigido, OSs antigas mostram o nome errado. Mitigação: `service_id` permanece no snapshot — pode-se cruzar com catálogo atual se necessário
- **Sem FK JSONB**: integridade garantida na camada de aplicação (UseCase valida que `service_id` existe antes de criar snapshot)
- **Preços em centavos (integer)**: evita problemas de ponto flutuante; todos os cálculos usam inteiros
