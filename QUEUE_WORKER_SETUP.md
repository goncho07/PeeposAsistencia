# Configuración del Queue Worker para Generación de Carnets

## ¿Qué es el Queue Worker?

El Queue Worker es un proceso en segundo plano que procesa tareas (jobs) de forma asíncrona. En este caso, se usa para generar carnets PDF sin bloquear la aplicación web.

## ¿Por qué es necesario?

- La generación de carnets PDF puede tardar **2+ minutos** dependiendo del número de usuarios
- Sin el queue worker, esto bloquearía el servidor web y causaría timeouts
- Con el queue worker, la generación ocurre en segundo plano y el usuario puede continuar usando la aplicación

## Configuración

### 1. Verificar configuración de .env

Asegúrate de que tu archivo `.env` tenga:

```env
QUEUE_CONNECTION=database
```

### 2. Verificar que la tabla `jobs` existe

La migración debería haberse ejecutado automáticamente, pero verifica:

```bash
php artisan migrate
```

### 3. Iniciar el Queue Worker

#### En Desarrollo (Local)

Abre una terminal y ejecuta:

```bash
cd backend
php artisan queue:work --tries=2
```

Deja esta terminal abierta mientras desarrollas. El worker procesará los jobs automáticamente.

**Parámetros importantes:**
- `--tries=2`: Intentará procesar cada job hasta 2 veces si falla
- `--timeout=600`: Tiempo máximo de ejecución (10 minutos)
- `--queue=default`: Cola a procesar (por defecto es 'default')

#### En Producción

Para producción, debes usar un **supervisor de procesos** que mantenga el worker corriendo:

##### Opción 1: Supervisor (Recomendado para Linux)

1. Instala supervisor:
```bash
sudo apt-get install supervisor
```

2. Crea el archivo de configuración en `/etc/supervisor/conf.d/peepos-queue.conf`:

```ini
[program:peepos-queue-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /ruta/completa/a/tu/proyecto/backend/artisan queue:work --sleep=3 --tries=2 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/ruta/completa/a/tu/proyecto/backend/storage/logs/worker.log
stopwaitsecs=3600
```

3. Actualiza supervisor:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start peepos-queue-worker:*
```

4. Verifica el estado:
```bash
sudo supervisorctl status
```

##### Opción 2: systemd (Alternativa para Linux)

1. Crea el archivo `/etc/systemd/system/peepos-queue.service`:

```ini
[Unit]
Description=Peepos Queue Worker
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/ruta/completa/a/tu/proyecto/backend
ExecStart=/usr/bin/php artisan queue:work --sleep=3 --tries=2 --max-time=3600
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

2. Habilita e inicia el servicio:
```bash
sudo systemctl enable peepos-queue
sudo systemctl start peepos-queue
sudo systemctl status peepos-queue
```

##### Opción 3: Docker (Si usas Docker)

Agrega un servicio adicional en tu `docker-compose.yml`:

```yaml
queue-worker:
  build: ./backend
  command: php artisan queue:work --sleep=3 --tries=2 --max-time=3600
  depends_on:
    - database
  environment:
    - DB_HOST=database
    - DB_DATABASE=peeposaasistencia
    - DB_USERNAME=root
    - DB_PASSWORD=oracle
  volumes:
    - ./backend:/var/www/html
  restart: unless-stopped
```

### 4. Verificar que funciona

1. Ve a la aplicación y genera unos carnets
2. Verifica los logs del worker:
```bash
tail -f backend/storage/logs/laravel.log
```

3. También puedes revisar la tabla `jobs` en la base de datos:
```sql
SELECT * FROM jobs;
```

Cuando un job se está procesando, aparecerá en esta tabla. Cuando termina, se elimina.

## Comandos útiles

### Ver trabajos fallidos
```bash
php artisan queue:failed
```

### Reintentar trabajos fallidos
```bash
php artisan queue:retry all
```

### Limpiar trabajos fallidos
```bash
php artisan queue:flush
```

### Reiniciar el worker (cuando cambias código)
```bash
php artisan queue:restart
```

**IMPORTANTE:** Cada vez que actualices código del backend que afecte los Jobs, **debes reiniciar el worker** usando `queue:restart`.

## Limpieza automática de archivos

El sistema limpia automáticamente los PDFs antiguos cada día. Esto se ejecuta automáticamente con Laravel's scheduler.

Para que funcione en producción, agrega este cron job:

```bash
* * * * * cd /ruta/completa/a/tu/proyecto/backend && php artisan schedule:run >> /dev/null 2>&1
```

También puedes ejecutar la limpieza manualmente:

```bash
php artisan carnets:cleanup --days=7
```

## Troubleshooting

### El worker no procesa jobs

1. Verifica que el worker esté corriendo:
```bash
ps aux | grep "queue:work"
```

2. Verifica la configuración de `.env`:
```bash
grep QUEUE_CONNECTION backend/.env
```

3. Reinicia el worker:
```bash
php artisan queue:restart
php artisan queue:work --tries=2
```

### Los jobs fallan constantemente

1. Revisa los logs:
```bash
tail -f backend/storage/logs/laravel.log
```

2. Verifica los jobs fallidos:
```bash
php artisan queue:failed
```

3. Aumenta la memoria y timeout si es necesario en `config/queue.php`:
```php
'timeout' => 600,
'memory' => 2048,
```

### El PDF no se genera correctamente

1. Verifica que Chromium/Puppeteer esté instalado
2. Verifica los permisos de la carpeta `storage`:
```bash
chmod -R 775 backend/storage
chown -R www-data:www-data backend/storage
```

## Monitoreo

Para un ambiente de producción robusto, considera usar:

- **Laravel Horizon**: Dashboard visual para colas (requiere Redis)
- **Sentry**: Para rastrear errores en jobs
- **New Relic/DataDog**: Para monitorear performance

## Resumen

✅ **Desarrollo**: `php artisan queue:work --tries=2`
✅ **Producción**: Usar Supervisor o systemd
✅ **Cron**: Agregar cron job para `schedule:run`
✅ **Monitoreo**: Revisar logs regularmente

---

¿Problemas? Revisa los logs en `backend/storage/logs/laravel.log`
