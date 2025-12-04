#!/bin/bash
set -e

if [ ! -f /var/www/html/.env ]; then
    echo "Copiando .env.example → .env"
    cp /var/www/html/.env.example /var/www/html/.env
fi

if ! grep -q "APP_KEY=base64" /var/www/html/.env; then
    echo "Generando APP_KEY..."
    php artisan key:generate --force
else
    echo "APP_KEY ya existe."
fi

php artisan config:clear
php artisan cache:clear
php artisan route:clear

echo "Iniciando Apache...jejeje"
apache2-foreground
