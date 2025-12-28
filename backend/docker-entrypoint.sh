#!/bin/bash

# Asegurar que existe el archivo .env
if [ ! -f /var/www/html/.env ]; then
    echo "Copiando .env.example → .env"
    cp /var/www/html/.env.example /var/www/html/.env
fi

# Asegurar permisos de escritura en .env para el usuario actual
chmod 666 /var/www/html/.env

# Generar APP_KEY si no existe o está vacía
# Buscamos si ya tiene un valor base64 válido
if ! grep -q "^APP_KEY=base64" /var/www/html/.env; then
    echo "Generando APP_KEY..."
    
    # Intentamos primero con el comando nativo
    php artisan key:generate --force
    
    # Verificamos si funcionó
    if ! grep -q "^APP_KEY=base64" /var/www/html/.env; then
        echo "ADVERTENCIA: 'php artisan key:generate' falló al escribir en el archivo. Intentando método manual..."
        
        # Generamos la key solo en stdout
        NEW_KEY=$(php artisan key:generate --show)
        
        if [ -n "$NEW_KEY" ]; then
            # Si APP_KEY existe (vacía o no), la reemplazamos
            if grep -q "^APP_KEY=" /var/www/html/.env; then
                sed -i "s|^APP_KEY=.*|APP_KEY=${NEW_KEY}|" /var/www/html/.env
            else
                # Si no existe la línea, la agregamos al final
                echo "" >> /var/www/html/.env
                echo "APP_KEY=${NEW_KEY}" >> /var/www/html/.env
            fi
            echo "APP_KEY inyectada manualmente."
        else
            echo "ERROR: No se pudo generar una nueva APP_KEY."
        fi
    fi
else
    echo "APP_KEY ya existe."
fi

# Limpieza de caché (importante en cada despliegue)
echo "Limpiando cachés..."
php artisan config:clear || true
php artisan cache:clear || true
php artisan route:clear || true
php artisan view:clear || true

# Asegurar permisos correctos en directorios de escritura
echo "Ajustando permisos..."
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

echo "Iniciando Apache en puerto 8080..."
exec apache2-foreground
