# Usamos PHP 8.3 con Apache
FROM php:8.3-apache

# 1. Instalar dependencias + Node.js mínimo + Chromium
RUN apt-get update && apt-get install -y --no-install-recommends \
    git curl libpng-dev libonig-dev libxml2-dev libzip-dev zip unzip \
    default-mysql-client chromium chromium-sandbox fonts-liberation \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && docker-php-ext-configure gd \
    && docker-php-ext-install -j$(nproc) pdo_mysql mbstring exif pcntl bcmath gd zip opcache \
    && apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* /usr/share/{doc,man,locale}/*

# 2. Instalar Puppeteer (sin Chromium bundled)
RUN npm install -g puppeteer --no-optional \
    && npm cache clean --force \
    && rm -rf /root/.npm

# 3. Configuración Apache
RUN a2enmod rewrite \
    && echo '<Directory /var/www/html/public>\n\
    Options Indexes FollowSymLinks\n\
    AllowOverride All\n\
    Require all granted\n\
</Directory>' > /etc/apache2/conf-available/laravel.conf \
    && a2enconf laravel

ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf \
    && sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf \
    && sed -i 's/80/${PORT}/g' /etc/apache2/sites-available/000-default.conf /etc/apache2/ports.conf

# 4. Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# 5. Cache Composer (Para producción: install --no-dev --no-scripts)
COPY composer.json composer.lock ./
ENV COMPOSER_ALLOW_SUPERUSER=1
RUN composer install --no-scripts --no-autoloader --prefer-dist --optimize-autoloader \
    && rm -rf /root/.composer/cache

# 6. Copiar código
COPY . .

# 7. Autoload
RUN composer dump-autoload --optimize --classmap-authoritative \
    && rm -rf /root/.composer/cache

# 8. Permisos
RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# 9. Variables de entorno
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    CHROMIUM_PATH=/usr/bin/chromium

COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]