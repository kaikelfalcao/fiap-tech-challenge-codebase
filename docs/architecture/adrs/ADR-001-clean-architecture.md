# ADR-001 — Adoção de Clean Architecture

| Campo        | Valor                             |
| ------------ | --------------------------------- |
| **Status**   | Aceito                            |
| **Data**     | 2024                              |
| **Contexto** | Estrutura de código da API NestJS |

## Contexto

A API AutoFlow precisa ser estruturada de forma que:

- A lógica de negócio seja testável independentemente do framework
- A troca de banco de dados ou framework HTTP não quebre o domínio
- Diferentes módulos (customer, vehicle, inventory, catalog, service-order, iam) tenham estrutura consistente

## Decisão

Adotar **Clean Architecture** (Robert C. Martin) com 4 camadas por módulo:

```
src/modules/{module}/
├── domain/                    ← Entidades e regras de negócio
│   ├── {entity}.entity.ts    ← Entidade de domínio (sem decorators ORM)
│   └── {entity}.repository.ts ← Interface do repositório (porta)
│
├── application/               ← Casos de uso
│   └── use-cases/
│       ├── create-{entity}.use-case.ts
│       ├── find-{entity}.use-case.ts
│       └── ...
│
├── infrastructure/            ← Adaptadores externos
│   └── persistence/
│       ├── {entity}.typeorm.entity.ts  ← Entidade TypeORM (com decorators)
│       └── {entity}.typeorm.repository.ts ← Implementação do repositório
│
└── presentation/              ← Interface HTTP
    ├── {entity}.controller.ts
    └── dto/
        ├── create-{entity}.dto.ts
        └── ...
```

## Módulos

| Módulo          | Responsabilidade                          |
| --------------- | ----------------------------------------- |
| `iam`           | Usuários do sistema (autenticação, roles) |
| `customer`      | Clientes da oficina                       |
| `vehicle`       | Veículos dos clientes                     |
| `catalog`       | Serviços oferecidos pela oficina          |
| `inventory`     | Peças e insumos em estoque                |
| `service-order` | Ordens de serviço (ciclo completo)        |

## Consequências

### Positivas

- **Testabilidade**: casos de uso testados com repositórios mockados (interface)
- **Consistência**: todos os módulos seguem a mesma estrutura
- **Inversão de dependência**: domain não depende de TypeORM; repositório TypeORM implementa a interface de domínio
- **Manutenibilidade**: mudança no ORM não afeta casos de uso

### Negativas / Trade-offs

- **Verbosidade**: mais arquivos por funcionalidade vs. abordagem MVC simples
- **Overhead inicial**: criar 4 camadas para CRUDs simples pode parecer excessivo
- **Curva de aprendizado**: desenvolvedores acostumados com MVC precisam adaptar o mental model

## Referências

- [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [NestJS Documentation - Modules](https://docs.nestjs.com/modules)
