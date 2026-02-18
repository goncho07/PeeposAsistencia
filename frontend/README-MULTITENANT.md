# Multi-Tenant Static Build Guide

Este proyecto está configurado para generar builds estáticos separados por tenant.

## Arquitectura

Cada tenant obtiene su propio build estático con:
- Tenant hardcodeado via `NEXT_PUBLIC_TENANT_SLUG`
- Rutas sin parámetros dinámicos (`/login`, `/dashboard`, etc.)
- Configuración específica del tenant (logo, colores, etc.)

## Tenants Configurados

1. **Ricardo Palma**
   - Slug: `iee-6049-ricardo-palma`
   - Subdomain sugerido: `palma.tuapp.com`

2. **Bolognesi**
   - Slug: `ie-francisco-bolognesi-cervantes`
   - Subdomain sugerido: `bolognesi.tuapp.com`

## Desarrollo Local

### Desarrollar para un tenant específico:

```bash
# Ricardo Palma
cp .env.palma .env.local
npm run dev
```

```bash
# Bolognesi
cp .env.bolognesi .env.local
npm run dev
```

## Producción

### Build para todos los tenants:

```bash
npm run build:tenants
```

Esto genera:
- `out-iee-6049-ricardo-palma/` - Build para Ricardo Palma
- `out-ie-francisco-bolognesi-cervantes/` - Build para Bolognesi

### Deploy

Cada carpeta `out-{tenant-slug}/` debe desplegarse en su propio subdomain:

#### Firebase Hosting (Recomendado):

```bash
# Deploy Ricardo Palma
firebase deploy --only hosting:palma --public out-iee-6049-ricardo-palma

# Deploy Bolognesi
firebase deploy --only hosting:bolognesi --public out-ie-francisco-bolognesi-cervantes
```

#### Netlify/Vercel:

- Crea un sitio por tenant
- Apunta cada uno a su carpeta `out-{tenant-slug}/`
- Configura el custom domain

## Agregar un Nuevo Tenant

1. **Backend**: Agrega el tenant en `backend/database/seeders/TenantSeeder.php`

2. **Frontend**:

   a. Crea archivo `.env.{nombre}`:
   ```bash
   # .env.nuevo-tenant
   NEXT_PUBLIC_TENANT_SLUG=nuevo-tenant-slug
   NEXT_PUBLIC_API_URL=https://api.yourapp.com/api
   ```

   b. Actualiza `build-tenants.js`:
   ```javascript
   const TENANTS = [
       // ... existing tenants
       {
           slug: 'nuevo-tenant-slug',
           name: 'Nombre del Nuevo Tenant',
       },
   ];
   ```

   c. Rebuild:
   ```bash
   npm run build:tenants
   ```

## Estructura de Rutas

Todas las rutas son absolutas (sin `[tenant]`):

- `/login` - Página de login
- `/dashboard` - Dashboard
- `/usuarios` - Gestión de usuarios
- `/scanner` - Escáner QR
- `/reportes` - Reportes
- `/configuracion` - Configuración

El tenant se determina automáticamente desde `NEXT_PUBLIC_TENANT_SLUG`.

## Troubleshooting

### Error: "NEXT_PUBLIC_TENANT_SLUG is not defined"

Asegúrate de que el archivo `.env.local` existe o que estás usando `npm run build:tenants` para production.

### Las imágenes/logos no cargan

Verifica que `NEXT_PUBLIC_API_URL` esté configurado correctamente en tu `.env`.

### Cambios no se reflejan después del build

Elimina las carpetas `out-*` y rebuilds:
```bash
rm -rf out-*
npm run build:tenants
```
