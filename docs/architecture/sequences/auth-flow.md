# Fluxo de Autenticação — CPF → JWT

## Descrição

O AutoFlow usa autenticação via CPF (tax_id). O cliente envia o CPF para o endpoint
`POST /auth` e recebe um JWT que deve ser incluído nas requisições subsequentes como
`Authorization: Bearer <token>`.

A autenticação é implementada em uma Lambda AWS separada, invocada pelo Kong via
plugin `aws-lambda`. Isso isola a lógica de auth da API principal e permite
escalabilidade e deploy independentes.

## Diagrama de Sequência

```
Cliente          Kong Gateway        Lambda              RDS PostgreSQL
  │                   │            (autoflow-auth)            │
  │  POST /auth       │                   │                   │
  │  {"tax_id":"CPF"} │                   │                   │
  │──────────────────►│                   │                   │
  │                   │                   │                   │
  │                   │  Invoke Lambda    │                   │
  │                   │  (aws-lambda      │                   │
  │                   │   plugin)         │                   │
  │                   │──────────────────►│                   │
  │                   │                   │                   │
  │                   │                   │  SELECT * FROM    │
  │                   │                   │  iam_users WHERE  │
  │                   │                   │  tax_id = $1      │
  │                   │                   │  AND active = true│
  │                   │                   │──────────────────►│
  │                   │                   │                   │
  │                   │                   │  { id, role, ... }│
  │                   │                   │◄──────────────────│
  │                   │                   │                   │
  │                   │                   │  jwt.sign({       │
  │                   │                   │    sub: id,       │
  │                   │                   │    role: role,    │
  │                   │                   │    tax_id: tax_id │
  │                   │                   │  }, JWT_SECRET,   │
  │                   │                   │  { expiresIn:     │
  │                   │                   │    "8h" })        │
  │                   │                   │                   │
  │                   │  { token: "eyJ.." }                   │
  │                   │◄──────────────────│                   │
  │                   │                   │                   │
  │  200 OK           │                   │                   │
  │  {"token":"eyJ.."}│                   │                   │
  │◄──────────────────│                   │                   │
  │                   │                   │                   │
```

## Fluxo de Erro — CPF não encontrado

```
Cliente          Kong Gateway        Lambda              RDS PostgreSQL
  │                   │            (autoflow-auth)            │
  │  POST /auth       │                   │                   │
  │  {"tax_id":"000"} │                   │                   │
  │──────────────────►│                   │                   │
  │                   │──────────────────►│                   │
  │                   │                   │──────────────────►│
  │                   │                   │  (0 rows)         │
  │                   │                   │◄──────────────────│
  │                   │                   │                   │
  │                   │                   │  throw 401        │
  │                   │                   │  Unauthorized     │
  │                   │◄──────────────────│                   │
  │                   │                   │                   │
  │  401 Unauthorized │                   │                   │
  │◄──────────────────│                   │                   │
```

## Uso do JWT nas Requisições Subsequentes

```
Cliente           Kong Gateway       NestJS API
  │                    │                 │
  │  GET /api/...      │                 │
  │  Authorization:    │                 │
  │  Bearer eyJ...     │                 │
  │───────────────────►│                 │
  │                    │  Forward        │
  │                    │  (header        │
  │                    │   passthrough)  │
  │                    │────────────────►│
  │                    │                 │
  │                    │                 │  JwtAuthGuard
  │                    │                 │  jwt.verify(token,
  │                    │                 │    JWT_SECRET)
  │                    │                 │
  │                    │                 │  { sub, role,
  │                    │                 │    tax_id }
  │                    │                 │
  │                    │                 │  Handler executa
  │                    │                 │  com req.user
  │                    │                 │
  │  200 OK + payload  │                 │
  │◄───────────────────│◄────────────────│
```

## Estrutura do Token JWT

```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "uuid-do-usuario",
    "role": "ADMIN | CUSTOMER",
    "tax_id": "12345678901",
    "iat": 1700000000,
    "exp": 1700028800
  }
}
```

## Autenticação Alternativa — IAM Module (POST /iam/login)

O módulo IAM do NestJS expõe um segundo fluxo de autenticação com **CPF + senha**,
independente da Lambda. Este endpoint é público e não passa pelo plugin `aws-lambda` do Kong.

```
Cliente           Kong / NestJS       LoginUseCase           RDS PostgreSQL
  │                    │                   │                       │
  │  POST /api/        │                   │                       │
  │  iam/login         │                   │                       │
  │  { taxId,          │                   │                       │
  │    password }      │                   │                       │
  │───────────────────►│──────────────────►│                       │
  │                    │                   │  SELECT iam_users     │
  │                    │                   │  WHERE tax_id=$1      │
  │                    │                   │──────────────────────►│
  │                    │                   │  { passwordHash, ... }│
  │                    │                   │◄──────────────────────│
  │                    │                   │                       │
  │                    │                   │  bcrypt.compare(      │
  │                    │                   │    password,          │
  │                    │                   │    passwordHash)      │
  │                    │                   │                       │
  │                    │                   │  jwt.sign({sub, role, │
  │                    │                   │    taxId})            │
  │  200 OK            │                   │                       │
  │  { accessToken }   │                   │                       │
  │◄───────────────────│                   │                       │
```

**Diferença entre os dois fluxos:**

|                  | Lambda (`POST /auth`)            | IAM Login (`POST /iam/login`)         |
| ---------------- | -------------------------------- | ------------------------------------- |
| Identificação    | CPF apenas                       | CPF + senha (bcrypt)                  |
| Rota Kong        | `POST /auth` → plugin aws-lambda | `POST /api/iam/login` → NestJS direto |
| Caso de uso      | Acesso externo/simplificado      | Login com credencial completa         |
| Senha necessária | Não                              | Sim                                   |

O JWT gerado por ambos tem a mesma estrutura e é validado pelo mesmo `JwtAuthGuard`.

## Notas de Implementação

- **Algoritmo**: HS256 (simétrico) — chave compartilhada `JWT_SECRET`
- **A Lambda não valida o JWT** — apenas o gera. A validação ocorre no `JwtAuthGuard` do NestJS
- **Kong não valida o token**: apenas roteia; a validação é responsabilidade do NestJS
- **Cadastro de usuários**: `POST /iam/register` (público) — cria usuário com CPF + senha (bcrypt, mínimo 8 chars)
- **Rotas protegidas do IAM**: `GET /iam/me` e `PATCH /iam/me/password` requerem JWT válido (qualquer role)
