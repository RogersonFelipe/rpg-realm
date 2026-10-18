# RPG Realm

Plataforma web para jogar RPG de mesa online: mesas com convite, ficha de D&D 5e com cálculos automáticos, chat e rolagem de dados em tempo real.

Projeto pessoal de portfólio, em desenvolvimento. Monorepo com API (NestJS), front (React + Vite) e pacotes compartilhados.

## Estrutura

```
rpg-realm/
├── apps/
│   ├── api/        NestJS
│   └── web/        React + Vite
├── packages/
│   └── shared/     tipos e schemas compartilhados (Zod)
├── docs/specs/     specs de cada etapa do projeto
├── docker-compose.yml
└── pnpm-workspace.yaml
```

## Pré-requisitos

- Node.js >= 20
- pnpm (a versão exata está travada em `package.json` → `packageManager`; rode `corepack enable` para o Node usar essa versão automaticamente)
- Docker e Docker Compose (para Postgres e Redis)

## Como rodar do zero

1. Clone o repositório e entre na pasta.

2. Copie o arquivo de variáveis de ambiente e preencha com seus próprios valores (os do `.env.example` são só placeholders, não funcionam como estão):
   ```
   cp .env.example .env
   ```

3. Instale as dependências:
   ```
   pnpm install
   ```

4. Suba o Postgres e o Redis:
   ```
   docker compose up -d
   ```
   Confirme que os dois serviços ficaram `healthy` com `docker compose ps`.

5. Suba a API e o front juntos:
   ```
   pnpm dev
   ```
   - API em `http://localhost:3000` (rota de verificação: `GET /health`)
   - Front em `http://localhost:5173`

## Comandos disponíveis (raiz do monorepo)

| Comando | O que faz |
| --- | --- |
| `pnpm dev` | Sobe a API e o front em modo desenvolvimento, em paralelo |
| `pnpm build` | Builda todos os pacotes (respeitando ordem de dependência) |
| `pnpm test` | Roda os testes de todos os pacotes (unitários e e2e) |
| `pnpm lint` | Roda o `oxlint` em todos os pacotes |
| `pnpm typecheck` | Checa os tipos TypeScript de todos os pacotes |
| `pnpm format` | Formata o código com Prettier |

## Status

Em desenvolvimento. Acompanhamento de progresso em `docs/specs/`.
