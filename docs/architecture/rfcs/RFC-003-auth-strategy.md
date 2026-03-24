# RFC-003 — Estratégia de Autenticação

| Campo       | Valor         |
| ----------- | ------------- |
| **Status**  | Aceito        |
| **Autores** | Time AutoFlow |
| **Data**    | 2024          |

## Contexto

O AutoFlow é um sistema interno de oficina mecânica. Os usuários são funcionários
(ADMIN) e clientes cadastrados (CUSTOMER). O sistema precisa de autenticação para
proteger os endpoints da API.

Requisitos:

- Autenticação sem senha complexa (sistema interno — CPF como identificador)
- Token stateless (sem sessão no servidor)
- Escalabilidade horizontal (múltiplos pods NestJS não compartilham estado de sessão)
- Separação de responsabilidades: autenticação isolada da lógica de negócio

## Opções Consideradas

### Lambda + JWT (HS256)

**Prós:**

- Autenticação como microserviço isolado — deploy e escala independentes
- JWT stateless — qualquer pod NestJS valida o token com o `JWT_SECRET`
- Lambda paga por invocação — custo zero quando não há requisições
- Isolamento: bug na auth não derruba a API principal
- Kong `aws-lambda` plugin integra nativamente sem código extra no NestJS

**Contras:**

- Latência adicional na Lambda (cold start ~200ms, warm ~10ms)
- JWT_SECRET compartilhado entre Lambda e NestJS (simétrico)
- Sem refresh token (expiração em 8h — usuário precisa re-autenticar)

### Auth direto no NestJS (Passport.js + JWT)

**Prós:**

- Sem Lambda — menos componentes
- Passport.js + `@nestjs/jwt` é padrão NestJS
- Sem cold start

**Contras:**

- Autenticação acoplada à API — impossível escalar auth independentemente
- Todos os pods precisam ter acesso ao `iam_users` para validar CPF
- Mistura responsabilidade de auth com negócio

### AWS Cognito

**Prós:**

- Serviço gerenciado completo (MFA, OAuth2, etc.)
- Integração com API Gateway AWS

**Contras:**

- Overkill para sistema interno sem cadastro self-service
- Custo proporcional ao número de usuários
- Usuários existem no banco `iam_users` — migração necessária
- LabRole pode ter restrições para criar User Pools

### Session-based (Express-session + Redis)

**Prós:**

- Revogação imediata de sessões

**Contras:**

- Estado no servidor — horizontal scaling requer Redis compartilhado
- Componente adicional (Redis/ElastiCache)
- Incompatível com Kong stateless routing

## Decisão

**Lambda + JWT (HS256)** foi escolhido.

A separação da autenticação em uma Lambda dedicada permite evolução independente,
e o JWT stateless é ideal para o modelo de múltiplos pods com HPA.

## Consequências

### Positivas

- `POST /auth` roteado pelo Kong diretamente para Lambda — NestJS não processa auth
- `JwtAuthGuard` no NestJS verifica apenas a assinatura (sem DB call)
- JWT carrega `sub` (user id), `role` e `tax_id` — informação disponível em qualquer handler sem query adicional
- Lambda em VPC com acesso ao RDS PostgreSQL — seguro sem exposição pública do DB

### Negativas / Mitigações

- **JWT_SECRET compartilhado**: Lambda (SAM secret) e NestJS (kubernetes_secret) devem usar o mesmo valor — gerenciado via GitHub Secret e state S3
- **Sem revogação de token**: tokens válidos por 8h. Mitigação: tempo curto de expiração. Para revogação real, precisaria de blacklist (não implementado — fora do escopo)
- **Cold start Lambda**: primeira invocação após período idle tem latência maior. Aceitável para sistema interno com uso contínuo durante o expediente
