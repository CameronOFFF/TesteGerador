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
MYSQL_URL=mysql://root:root@localhost:3306/geradorpro
JWT_SECRET=dev-secret
JWT_REFRESH_SECRET=dev-refresh
JWT_ACCESS_TTL=15m
JWT_REFRESH_DAYS=30
UPLOADS_DIR=uploads
GENERATED_DIR=generated
FFMPEG_PATH=ffmpeg
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:4000/api
```

## Migrations + Seeds
```bash
mysql -u root -p geradorpro < backend/migrations/001_init.sql
mysql -u root -p geradorpro < backend/seeds/001_demo.sql
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
