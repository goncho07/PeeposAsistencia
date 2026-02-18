# Peepos Asistencia - Frontend

Sistema de control de asistencia escolar multi-tenant.

## Stack

- **Next.js 16** (App Router)
- **TypeScript**  
- **Vercel** (Deployment)

## Desarrollo Local

```bash
# Instalar dependencias
npm install

# Copiar .env
cp .env.example .env.local

# Iniciar dev server
npm run dev
```

Accede en: `http://localhost:3000/ieericardopalma/login`

## Arquitectura Multi-Tenant

El frontend usa rutas dinámicas `[tenant]` para identificar la institución.

**Flujo:**
1. Usuario visita `/ieericardopalma/login`
2. Frontend llama `GET /api/tenants/ieericardopalma` para logo/banner
3. Usuario hace login → backend retorna token con `tenant_id`
4. Requests autenticadas → backend scope automático por `tenant_id`

## Deploy en Vercel

```bash
npm i -g vercel
vercel login
vercel
```

O conecta tu repo de GitHub en [vercel.com](https://vercel.com).

**Environment Variable:**
```
NEXT_PUBLIC_API_URL=https://api.tudominio.com/api
```
