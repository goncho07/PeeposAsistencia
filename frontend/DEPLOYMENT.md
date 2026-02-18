# Guía de Despliegue Multi-Tenant

## Resumen

Este proyecto genera builds estáticos separados para cada tenant (escuela). Cada tenant tiene su propio sitio completamente independiente que se despliega en su propio subdomain.

## Preparación

### 1. Verificar Tenants

Los tenants están definidos en `build-tenants.js`. Actualmente configurados:

- **Ricardo Palma**: `iee-6049-ricardo-palma`
- **Bolognesi**: `ie-francisco-bolognesi-cervantes`

### 2. Configurar Variables de Entorno

Edita los archivos `.env.{tenant}` según sea necesario:

```bash
# .env.palma
NEXT_PUBLIC_TENANT_SLUG=iee-6049-ricardo-palma
NEXT_PUBLIC_API_URL=https://api.tudominio.com/api

# .env.bolognesi
NEXT_PUBLIC_TENANT_SLUG=ie-francisco-bolognesi-cervantes
NEXT_PUBLIC_API_URL=https://api.tudominio.com/api
```

## Build

### Build Local para Testing

```bash
# Copiar env del tenant que quieres probar
cp .env.palma .env.local

# Ejecutar dev server
npm run dev

# Abrir http://localhost:3000
```

### Build de Producción (Todos los Tenants)

```bash
npm run build:tenants
```

Esto genera:
- `out-iee-6049-ricardo-palma/`
- `out-ie-francisco-bolognesi-cervantes/`

## Despliegue

### Opción 1: Firebase Hosting (Recomendado)

#### Configuración Inicial

1. Instala Firebase CLI:
```bash
npm install -g firebase-tools
firebase login
```

2. Crea `firebase.json`:
```json
{
  "hosting": [
    {
      "site": "palma",
      "public": "out-iee-6049-ricardo-palma",
      "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
      "cleanUrls": true,
      "trailingSlash": true,
      "rewrites": [
        {
          "source": "**",
          "destination": "/index.html"
        }
      ]
    },
    {
      "site": "bolognesi",
      "public": "out-ie-francisco-bolognesi-cervantes",
      "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
      "cleanUrls": true,
      "trailingSlash": true,
      "rewrites": [
        {
          "source": "**",
          "destination": "/index.html"
        }
      ]
    }
  ]
}
```

#### Deploy

```bash
# Build primero
npm run build:tenants

# Deploy todos los tenants
firebase deploy --only hosting

# O deploy uno por uno
firebase deploy --only hosting:palma
firebase deploy --only hosting:bolognesi
```

#### Configurar Dominios Personalizados

En Firebase Console:
1. Hosting > Sitio > Add custom domain
2. Agregar:
   - `palma.tudominio.com` → sitio "palma"
   - `bolognesi.tudominio.com` → sitio "bolognesi"

### Opción 2: Netlify

#### Configuración por Tenant

1. Crea un sitio por tenant en Netlify
2. En cada sitio:
   - Build command: `npm run build` (dejarás que el script maneje esto)
   - Publish directory: `out-{tenant-slug}`
   - Environment variables:
     ```
     NEXT_PUBLIC_TENANT_SLUG=iee-6049-ricardo-palma
     NEXT_PUBLIC_API_URL=https://api.tudominio.com/api
     ```

3. Configura custom domains:
   - Sitio 1: `palma.tudominio.com`
   - Sitio 2: `bolognesi.tudominio.com`

#### Deploy Manual

```bash
# Build
npm run build:tenants

# Deploy cada tenant
netlify deploy --dir=out-iee-6049-ricardo-palma --prod --site=palma-site-id
netlify deploy --dir=out-ie-francisco-bolognesi-cervantes --prod --site=bolognesi-site-id
```

### Opción 3: Vercel

Similar a Netlify, crea un proyecto por tenant.

### Opción 4: Servidor Estático Simple (Nginx, Apache, etc.)

```nginx
# nginx.conf example
server {
    listen 80;
    server_name palma.tudominio.com;
    root /var/www/out-iee-6049-ricardo-palma;

    location / {
        try_files $uri $uri/ /index.html;
    }
}

server {
    listen 80;
    server_name bolognesi.tudominio.com;
    root /var/www/out-ie-francisco-bolognesi-cervantes;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## Agregar un Nuevo Tenant

### Backend

1. Agrega el tenant en `backend/database/seeders/TenantSeeder.php`
2. Ejecuta el seeder:
   ```bash
   php artisan db:seed --class=TenantSeeder
   ```

### Frontend

1. Crea `.env.{nombre-tenant}`:
   ```bash
   NEXT_PUBLIC_TENANT_SLUG=nuevo-tenant-slug
   NEXT_PUBLIC_API_URL=https://api.tudominio.com/api
   ```

2. Actualiza `build-tenants.js`:
   ```javascript
   const TENANTS = [
       // ... existing
       {
           slug: 'nuevo-tenant-slug',
           name: 'Nombre del Nuevo Tenant',
       },
   ];
   ```

3. Build y deploy:
   ```bash
   npm run build:tenants
   firebase deploy --only hosting:nuevo-tenant
   ```

## CI/CD (Opcional)

### GitHub Actions Example

```yaml
name: Build and Deploy Multi-Tenant

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build all tenants
        run: npm run build:tenants

      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          projectId: your-project-id
```

## Troubleshooting

### Build falla con "NEXT_PUBLIC_TENANT_SLUG is undefined"

Asegúrate de que el `.env.local` existe o estás usando `npm run build:tenants`.

### Las páginas muestran 404

Verifica que tu servidor/hosting esté configurado para hacer fallback a `index.html` para todas las rutas.

### Los assets no cargan

1. Verifica `NEXT_PUBLIC_API_URL` en tus archivos `.env`
2. Asegúrate de que CORS esté configurado en el backend
3. Verifica que las rutas de imágenes sean correctas

### Cambios no aparecen después del deploy

1. Limpia los builds antiguos: `rm -rf out-*`
2. Rebuild: `npm run build:tenants`
3. Deploy nuevamente
4. Limpia el caché del navegador

## Monitoreo

Después del deploy, verifica:

- ✅ Login funciona en cada subdomain
- ✅ Logos/imágenes del tenant correcto
- ✅ API calls funcionan (verifica CORS)
- ✅ Navegación entre páginas
- ✅ Theme switcher funciona
- ✅ Datos del tenant correcto se cargan

## Costos Estimados

### Firebase Hosting (Gratis hasta cierto límite)
- 10 GB almacenamiento
- 360 MB/día transfer
- SSL gratis

### Netlify (Plan gratuito)
- 100 GB bandwidth/mes
- Builds ilimitados
- SSL gratis

Ambos son suficientes para 2-5 tenants con tráfico moderado.
