# GERADORPRO Full Stack

Projeto full-stack com painel dark para geração de banners, vídeos e guias esportivos.

## Stack
- Frontend: React + Vite + TypeScript + Tailwind
- Backend: Node.js + Express + TypeScript
- Banco: MySQL (mysql2 + SQL migrations)
- Render: @napi-rs/canvas + sharp + FFmpeg

## Pré-requisitos
- Node.js 20+
- MySQL 8+
- FFmpeg instalado no PATH

## Estrutura
- `/backend`: API, worker, providers e templates
- `/frontend`: painel web
- `/backend/uploads`: logos enviados
- `/backend/generated`: artefatos renderizados

## Configuração
### Backend `.env`
```env
PORT=4000
# Opção 1 (XAMPP padrão)
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=geradorpro

# Opção 2 (URL completa, se preferir)
# MYSQL_URL=mysql://root:senha@127.0.0.1:3306/geradorpro
JWT_SECRET=dev-secret
JWT_REFRESH_SECRET=dev-refresh
JWT_ACCESS_TTL=15m
JWT_REFRESH_DAYS=30
UPLOADS_DIR=uploads
GENERATED_DIR=generated
FFMPEG_PATH=ffmpeg
DEMO_ADMIN_EMAIL=admin@demo.com
DEMO_ADMIN_PASSWORD=admin123
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:4000/api
```

## Migrations + Seeds
```bash
# XAMPP padrão (root sem senha)
mysql -u root geradorpro < backend/migrations/001_init.sql
mysql -u root geradorpro < backend/seeds/001_demo.sql

# Se seu MySQL tiver senha
# mysql -u root -p geradorpro < backend/migrations/001_init.sql
# mysql -u root -p geradorpro < backend/seeds/001_demo.sql
```

Usuário demo:
- email: `admin@demo.com`
- senha: `admin123`

## Rodar
```bash
cd backend && npm install && npm run dev
cd backend && npm run worker
cd frontend && npm install && npm run dev
```

## Como gerar um banner
1. Login no painel.
2. Acesse uma rota de banner (ex: `/banners/futebol`).
3. Clique em gerar.
4. O arquivo PNG será salvo em `backend/generated/banners`.

## Endpoints principais
- Auth: `/api/auth/login`, `/api/auth/refresh`, `/api/auth/logout`, `/api/auth/me`
- Tenant: `/api/tenant`, `/api/tenant/whatsapp`, `/api/tenant/links`, `/api/tenant/logo`
- Eventos: `/api/events/football|nba|ufc|f1`
- Geração: `/api/generate/banner/:category`, `/api/generate/video/:category`
- Jobs: `/api/jobs`, `/api/jobs/:id`


## Solução rápida para erro "Access denied for user 'root'@'localhost'"
1. Confirme que o arquivo `backend/.env` existe (copie de `.env.example`).
2. Para XAMPP padrão, use `MYSQL_USER=root` e `MYSQL_PASSWORD=` (vazio).
3. Reinicie backend e worker após alterar `.env`.
4. Se ainda falhar, teste manualmente: `mysql -u root -h 127.0.0.1 -P 3306`.


## Se o login retornar 401
1. Confirme se aplicou as seeds em `backend/seeds/001_demo.sql`.
2. Reinicie backend após alterar `.env`.
3. Use o usuário demo `admin@demo.com / admin123`.
4. Em ambiente local, o backend aceita fallback configurável por `DEMO_ADMIN_EMAIL` e `DEMO_ADMIN_PASSWORD` para evitar travar no primeiro acesso.
