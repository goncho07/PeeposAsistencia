# Usamos PHP 8.3 con Apache
FROM php:8.3-apache

# 1. Instalar dependencias del sistema (Incluyendo unzip que suele faltar)
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libzip-dev \
    default-mysql-client

# Limpiar caché para reducir peso
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# 2. Instalar extensiones PHP vitales para Laravel
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip opcache

# 3. Configuración Apache para Cloud Run (Puerto Dinámico)
RUN a2enmod rewrite
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf
RUN sed -i 's/80/${PORT}/g' /etc/apache2/sites-available/000-default.conf /etc/apache2/ports.conf

# 4. Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 5. Preparar el entorno
WORKDIR /var/www/html

# --- ESTRATEGIA DE CACHÉ (Esto evita errores de build) ---
# Primero copiamos solo los archivos de definición
COPY composer.json composer.lock ./

# Instalamos dependencias SIN copiar todo el código aún
# COMPOSER_ALLOW_SUPERUSER es vital en Docker
ENV COMPOSER_ALLOW_SUPERUSER=1
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist

# Ahora sí copiamos el resto del código
COPY . .

# Generamos el autoload final
RUN composer dump-autoload --optimize

# 6. Permisos de carpetas (Crítico para Laravel)
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
RUN chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# 7. Comando de inicio
CMD ["apache2-foreground"]