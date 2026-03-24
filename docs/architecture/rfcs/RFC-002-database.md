# RFC-002 — Escolha do Banco de Dados

| Campo       | Valor         |
| ----------- | ------------- |
| **Status**  | Aceito        |
| **Autores** | Time AutoFlow |
| **Data**    | 2024          |

## Contexto

O AutoFlow precisa de um banco de dados para persistir usuários, clientes, veículos,
estoque, catálogo de serviços e ordens de serviço. Os requisitos principais são:

- Transações ACID (OS envolve múltiplas tabelas: OS, estoque, movimentos)
- Suporte a JSONB (snapshots imutáveis de preço em OS)
- Suporte via serviço gerenciado na AWS
- Familiaridade da equipe com SQL
- Suporte pelo TypeORM (ORM usado no NestJS)

## Opções Consideradas

### PostgreSQL (AWS RDS)

**Prós:**

- Suporte nativo a JSONB com índices GIN — ideal para snapshots de OS
- ACID completo com suporte a transações complexas
- AWS RDS PostgreSQL é serviço gerenciado com backup automático, failover e patches
- TypeORM tem suporte excelente ao PostgreSQL (inclui operadores JSONB)
- Open source, sem licenciamento adicional
- Extensões úteis: `uuid-ossp` (UUIDs nativos), `pgcrypto`

**Contras:**

- Escalabilidade vertical por padrão (RDS Multi-AZ para HA, mas custo maior)
- Sem sharding nativo (não é requisito para este projeto)

### MySQL / Aurora MySQL

**Prós:**

- Familiaridade em alguns contextos
- Aurora MySQL tem melhor escalabilidade de leitura

**Contras:**

- JSON não é cidadão de primeira classe (menos poderoso que JSONB)
- TypeORM tem algumas incompatibilidades históricas com MySQL
- Sem suporte equivalente ao JSONB com índices para queries dentro do JSON

### MongoDB (DocumentDB)

**Prós:**

- Schema flexível
- Naturalmente orientado a documentos

**Contras:**

- Sem transações ACID completas entre coleções (ou com complexidade adicional)
- Requer redesign do modelo de dados
- DocumentDB na AWS tem compatibilidade limitada vs MongoDB real
- Equipe mais familiarizada com SQL

### DynamoDB

**Prós:**

- Totalmente gerenciado, escala automaticamente
- Integração nativa AWS

**Contras:**

- Sem JOINs — modelo relacional do AutoFlow (cliente→veículo→OS) é prejudicado
- Sem transações complexas multi-item sem SDK específico
- TypeORM não suporta DynamoDB

## Decisão

**PostgreSQL 15 via AWS RDS** foi escolhido.

A combinação de ACID + JSONB + suporte TypeORM + serviço gerenciado AWS torna o
PostgreSQL a escolha natural para o AutoFlow.

## Consequências

### Positivas

- Snapshot JSONB em `service_orders.services` e `service_orders.items` sem tabelas intermediárias
- Migrations gerenciadas pelo TypeORM com rollback
- Senha do banco gerada automaticamente pelo Terraform (`random_password`), nunca exposta como secret GitHub
- Subnet privada com Security Group — acesso apenas de dentro da VPC (EKS + Lambda)

### Negativas / Mitigações

- **Custo RDS**: instância `db.t3.micro` no Lab (suficiente para desenvolvimento/testes)
- **Single AZ no Lab**: sem Multi-AZ por custo; aceitável para ambiente acadêmico
- **Senha no state S3**: `random_password.result` fica no state Terraform; bucket S3 com acesso restrito ao LabRole
