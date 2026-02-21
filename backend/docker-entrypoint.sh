#!/bin/bash

# Generar .env desde las variables de entorno inyectadas por Cloud Run / Secret Manager
echo "Generando .env desde variables de entorno..."
cat > /var/www/html/.env <<EOF
# ── App ──────────────────────────────────────────────────
APP_NAME=${APP_NAME:-IntelicoleApi}
APP_ENV=${APP_ENV:-production}
APP_KEY=${APP_KEY}
APP_DEBUG=${APP_DEBUG:-false}
APP_URL=${APP_URL:-https://api.intelicole.pe}
FRONTEND_URL=${FRONTEND_URL:-https://intelicole.pe}

# ── Locale ───────────────────────────────────────────────
APP_LOCALE=${APP_LOCALE:-es}
APP_FALLBACK_LOCALE=${APP_FALLBACK_LOCALE:-en}

# ── Seguridad ────────────────────────────────────────────
BCRYPT_ROUNDS=${BCRYPT_ROUNDS:-12}

# ── Logging (stderr → Cloud Logging) ─────────────────────
LOG_CHANNEL=${LOG_CHANNEL:-stderr}
LOG_LEVEL=${LOG_LEVEL:-warning}

# ── Base de datos (Cloud SQL) ─────────────────────────────
DB_CONNECTION=${DB_CONNECTION:-mysql}
DB_SOCKET=${DB_SOCKET}
DB_DATABASE=${DB_DATABASE}
DB_USERNAME=${DB_USERNAME}
DB_PASSWORD=${DB_PASSWORD}

# ── Session ──────────────────────────────────────────────
SESSION_DRIVER=${SESSION_DRIVER:-database}
SESSION_LIFETIME=${SESSION_LIFETIME:-120}
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=${SESSION_DOMAIN:-.intelicole.pe}
SESSION_SECURE_COOKIE=true
SESSION_HTTP_ONLY=true
SESSION_SAME_SITE=none

# ── Cache ─────────────────────────────────────────────────
CACHE_STORE=${CACHE_STORE:-database}

# ── Queue ─────────────────────────────────────────────────
QUEUE_CONNECTION=${QUEUE_CONNECTION:-database}

# ── Sanctum & CORS ───────────────────────────────────────
SANCTUM_STATEFUL_DOMAINS=${SANCTUM_STATEFUL_DOMAINS:-intelicole.pe,*.intelicole.pe,localhost:3000}
CORS_ALLOWED_ORIGINS=${CORS_ALLOWED_ORIGINS:-https://intelicole.pe,http://localhost:3000}

# ── Filesystem (GCS) ─────────────────────────────────────
FILESYSTEM_DISK=${FILESYSTEM_DISK:-gcs}
GOOGLE_CLOUD_PROJECT_ID=${GOOGLE_CLOUD_PROJECT_ID}
GOOGLE_CLOUD_STORAGE_BUCKET=${GOOGLE_CLOUD_STORAGE_BUCKET}

# ── Google OAuth ─────────────────────────────────────────
GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
GOOGLE_REDIRECT_URI=${GOOGLE_REDIRECT_URI:-https://api.intelicole.pe/auth/google/callback}

# ── WhatsApp ─────────────────────────────────────────────
WAHA_API_BASE_IP=${WAHA_API_BASE_IP:-34.27.141.86}
WAHA_TOKEN=${WAHA_TOKEN}

# ── Mail ─────────────────────────────────────────────────
MAIL_MAILER=${MAIL_MAILER:-log}
MAIL_FROM_ADDRESS=${MAIL_FROM_ADDRESS:-noreply@intelicole.pe}
MAIL_FROM_NAME="${APP_NAME:-IntelicoleApi}"

# ── Biometría ────────────────────────────────────────────
BIOMETRIC_ENABLED=${BIOMETRIC_ENABLED:-false}
FACE_SERVICE_URL=${FACE_SERVICE_URL}
FACE_SERVICE_TIMEOUT=${FACE_SERVICE_TIMEOUT:-30}

# ── Carnets ──────────────────────────────────────────────
CARNET_CLEANUP_DAYS=${CARNET_CLEANUP_DAYS:-7}
CARNET_SERVICE_URL=${CARNET_SERVICE_URL}
CARNET_SERVICE_SECRET=${CARNET_SERVICE_SECRET}

# ── Seed passwords ───────────────────────────────────────
SEED_SUPERADMIN_EMAIL=${SEED_SUPERADMIN_EMAIL:-admin@intelicole.pe}
SEED_SUPERADMIN_PASSWORD=${SEED_SUPERADMIN_PASSWORD}
SEED_DIRECTOR_PASSWORD=${SEED_DIRECTOR_PASSWORD}
SEED_SCANNER_PASSWORD=${SEED_SCANNER_PASSWORD}
EOF

chmod 600 /var/www/html/.env

echo "──────────────────────────────────────────"
echo ".env generado — verificación de variables:"
echo "──────────────────────────────────────────"
# Valores no sensibles: se muestran tal cual
echo "  APP_ENV          = $(grep ^APP_ENV= /var/www/html/.env | cut -d= -f2-)"
echo "  APP_URL          = $(grep ^APP_URL= /var/www/html/.env | cut -d= -f2-)"
echo "  BCRYPT_ROUNDS    = $(grep ^BCRYPT_ROUNDS= /var/www/html/.env | cut -d= -f2-)"
echo "  DB_CONNECTION    = $(grep ^DB_CONNECTION= /var/www/html/.env | cut -d= -f2-)"
echo "  DB_DATABASE      = $(grep ^DB_DATABASE= /var/www/html/.env | cut -d= -f2-)"
echo "  DB_USERNAME      = $(grep ^DB_USERNAME= /var/www/html/.env | cut -d= -f2-)"
echo "  SESSION_DRIVER   = $(grep ^SESSION_DRIVER= /var/www/html/.env | cut -d= -f2-)"
echo "  CACHE_STORE      = $(grep ^CACHE_STORE= /var/www/html/.env | cut -d= -f2-)"
echo "  FILESYSTEM_DISK  = $(grep ^FILESYSTEM_DISK= /var/www/html/.env | cut -d= -f2-)"
# Valores sensibles: solo indica si están seteados o vacíos
_check() { local v; v="$(grep "^$1=" /var/www/html/.env | cut -d= -f2-)"; [ -n "$v" ] && echo "  $1 = [SET]" || echo "  $1 = [EMPTY ⚠]"; }
_check APP_KEY
_check DB_PASSWORD
_check GOOGLE_CLIENT_ID
_check GOOGLE_CLIENT_SECRET
_check WAHA_TOKEN
_check CARNET_SERVICE_SECRET
_check SEED_SUPERADMIN_PASSWORD
_check SEED_DIRECTOR_PASSWORD
_check SEED_SCANNER_PASSWORD
echo "──────────────────────────────────────────"

# Cachear config en runtime (necesita las env vars reales inyectadas por Cloud Run)
echo "Cacheando configuración..."
php artisan config:cache || true

# Asegurar permisos correctos en directorios de escritura
echo "Ajustando permisos..."
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

echo "Iniciando Apache en puerto 8080..."
exec apache2-foreground
