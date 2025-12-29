# Configuración de Google Cloud Storage (GCS)

Este documento explica cómo configurar Google Cloud Storage para almacenar imágenes y archivos en producción.

## ¿Por qué Google Cloud Storage?

En Cloud Run y Vercel, los contenedores son **stateless** (sin estado), lo que significa que cualquier archivo guardado en el filesystem local se pierde cuando el contenedor se reinicia. GCS proporciona almacenamiento persistente y URLs públicas para servir archivos estáticos.

## Paso 1: Crear un Bucket en Google Cloud Storage

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto (o crea uno nuevo)
3. Ve a **Cloud Storage** > **Buckets**
4. Haz clic en **CREATE BUCKET**
5. Configuración recomendada:
   - **Name**: `peepos-asistencia-storage` (debe ser único globalmente)
   - **Location type**: Region
   - **Location**: `us-central1` (misma región que tu Cloud Run)
   - **Storage class**: Standard
   - **Access control**: Fine-grained (con IAM)
   - **Public access**: Desmarcar "Enforce public access prevention"

6. Haz clic en **CREATE**

## Paso 2: Hacer el Bucket Público

Para que las imágenes sean accesibles públicamente:

1. Ve a tu bucket recién creado
2. Haz clic en la pestaña **PERMISSIONS**
3. Haz clic en **GRANT ACCESS**
4. Agregar principal:
   - **New principals**: `allUsers`
   - **Role**: `Storage Object Viewer`
5. Haz clic en **SAVE**

## Paso 3: Crear Service Account

1. Ve a **IAM & Admin** > **Service Accounts**
2. Haz clic en **CREATE SERVICE ACCOUNT**
3. Configuración:
   - **Name**: `peepos-storage-admin`
   - **Description**: Service account para acceso a GCS
4. Haz clic en **CREATE AND CONTINUE**
5. Asignar roles:
   - **Storage Admin** (para subir/eliminar archivos)
6. Haz clic en **CONTINUE** y luego **DONE**

## Paso 4: Generar Clave JSON

1. En la lista de Service Accounts, busca la que acabas de crear
2. Haz clic en los tres puntos (⋮) > **Manage keys**
3. **ADD KEY** > **Create new key**
4. Selecciona **JSON** y haz clic en **CREATE**
5. Se descargará un archivo JSON - **guárdalo de forma segura**

## Paso 5: Configurar Variables de Entorno

### Para Desarrollo Local

Edita tu archivo `.env` en el backend:

```bash
# Filesystem
FILESYSTEM_DISK=gcs

# Google Cloud Storage
GOOGLE_CLOUD_PROJECT_ID=tu-project-id
GOOGLE_CLOUD_STORAGE_BUCKET=peepos-asistencia-storage
GOOGLE_CLOUD_KEY_FILE='{"type":"service_account","project_id":"...","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}'
```

**Importante**:
- Copia TODO el contenido del archivo JSON descargado y pégalo en una sola línea en `GOOGLE_CLOUD_KEY_FILE`
- Asegúrate de que esté entre comillas simples `'...'`

### Para Producción (Cloud Run)

1. Ve a **Cloud Run** > Tu servicio
2. Haz clic en **EDIT & DEPLOY NEW REVISION**
3. En la sección **Variables & Secrets**, agrega:

```
FILESYSTEM_DISK=gcs
GOOGLE_CLOUD_PROJECT_ID=tu-project-id
GOOGLE_CLOUD_STORAGE_BUCKET=peepos-asistencia-storage
GOOGLE_CLOUD_KEY_FILE=(pegar el JSON completo en una línea)
```

4. Haz clic en **DEPLOY**

**Alternativa más segura**: En lugar de poner la key directamente, puedes usar la identidad del servicio de Cloud Run:

```bash
# Solo necesitas estas dos variables si usas la identidad del servicio
FILESYSTEM_DISK=gcs
GOOGLE_CLOUD_STORAGE_BUCKET=peepos-asistencia-storage
# Asegúrate de que el service account de Cloud Run tenga permisos de Storage Admin
```

## Paso 6: Migrar Archivos Existentes (si los hay)

Si ya tienes archivos en `storage/app/public`, necesitas migrarlos a GCS:

```bash
# Desde tu backend local
php artisan tinker

# En tinker, ejecuta:
$files = Storage::disk('public')->allFiles();
foreach ($files as $file) {
    $contents = Storage::disk('public')->get($file);
    Storage::disk('gcs')->put($file, $contents);
    echo "Migrated: $file\n";
}
```

## Paso 7: Actualizar URLs en la Base de Datos

Si en tu base de datos tienes URLs completas guardadas (por ejemplo: `http://localhost:8080/storage/logo.png`), necesitas actualizarlas a rutas relativas (por ejemplo: `logos/logo.png`).

```sql
-- Ejemplo para la tabla tenants
UPDATE tenants
SET
    logo_url = REPLACE(logo_url, 'http://localhost:8080/storage/', ''),
    banner_url = REPLACE(banner_url, 'http://localhost:8080/storage/', ''),
    background_url = REPLACE(background_url, 'http://localhost:8080/storage/', '')
WHERE logo_url IS NOT NULL OR banner_url IS NOT NULL OR background_url IS NOT NULL;

-- Repetir para students, teachers, parents, users
UPDATE students SET photo_url = REPLACE(photo_url, 'http://localhost:8080/storage/', '') WHERE photo_url IS NOT NULL;
UPDATE teachers SET photo_url = REPLACE(photo_url, 'http://localhost:8080/storage/', '') WHERE photo_url IS NOT NULL;
UPDATE parent_guardians SET photo_url = REPLACE(photo_url, 'http://localhost:8080/storage/', '') WHERE photo_url IS NOT NULL;
UPDATE users SET photo_url = REPLACE(photo_url, 'http://localhost:8080/storage/', '') WHERE photo_url IS NOT NULL;
```

## Verificación

1. **Subir una imagen de prueba**:
```php
php artisan tinker

Storage::disk('gcs')->put('test.txt', 'Hello from GCS!');
echo get_storage_url('test.txt');
```

2. **Verifica que la URL se genere correctamente**:
   - Debería ser algo como: `https://storage.googleapis.com/peepos-asistencia-storage/test.txt`

3. **Abre la URL en el navegador** - deberías ver el contenido

## Estructura de Carpetas Recomendada en GCS

```
peepos-asistencia-storage/
├── logos/           # Logos de tenants
├── banners/         # Banners de tenants
├── backgrounds/     # Fondos de tenants
├── students/        # Fotos de estudiantes
├── teachers/        # Fotos de profesores
├── parents/         # Fotos de padres/tutores
├── users/           # Fotos de usuarios admin
└── carnets/         # PDFs de carnets generados
```

## Costos Estimados

- **Almacenamiento**: ~$0.02 USD por GB al mes
- **Operaciones**: Casi gratis para el volumen esperado
- **Transferencia**: Primer GB gratis, luego ~$0.12 por GB

Para una institución educativa con 1000 estudiantes:
- Estimado: 1GB de imágenes = ~$0.02/mes
- Muy económico comparado con otros servicios

## Troubleshooting

### Error: "Bucket not found"
- Verifica que el nombre del bucket sea correcto
- Asegúrate de que el service account tenga permisos

### Error: "Invalid credentials"
- Verifica que el JSON de la key esté correctamente formateado
- Asegúrate de que no haya saltos de línea dentro de `GOOGLE_CLOUD_KEY_FILE`

### Las imágenes no cargan
- Verifica que el bucket sea público (paso 2)
- Verifica que `get_storage_url()` esté generando URLs correctas
- Revisa los logs de Laravel: `php artisan pail`

### URLs antiguas
- Si ves URLs como `http://localhost:8080/storage/...`, ejecuta las queries SQL del paso 7

## Estrategia de Almacenamiento Mixto

Esta implementación usa una **estrategia mixta** inteligente:

### Archivos en GCS (Permanentes):
- ✅ Logos de tenants (`tenant.logo_url`)
- ✅ Banners de tenants (`tenant.banner_url`)
- ✅ Fondos de tenants (`tenant.background_url`)
- ✅ Fotos de estudiantes (`student.photo_url`)
- ✅ Fotos de profesores (`teacher.photo_url`)
- ✅ Fotos de padres/tutores (`parent.photo_url`)
- ✅ Fotos de usuarios (`user.photo_url`)

### Archivos en Storage Local (Temporales):
- 📄 HTML de carnets (se eliminan después de convertir a PDF)
- 📄 PDFs de carnets (se eliminan después de descargar)
- 📄 Archivos temporales de procesamiento

**¿Por qué?**
- Los carnets son archivos grandes y temporales (se borran cada 7 días)
- No tiene sentido pagar por almacenar archivos temporales en GCS
- En Cloud Run, los archivos temporales se limpian automáticamente al reiniciar
- El sistema de carnets usa `Storage::disk('public')` explícitamente para archivos temporales

## Ventajas de esta Implementación

✅ **Persistente**: Los archivos permanentes no se pierden al reiniciar containers
✅ **Escalable**: Soporta millones de archivos sin problemas
✅ **CDN-ready**: Puedes agregar Cloud CDN fácilmente
✅ **Económico**: Costos muy bajos - solo pagas por archivos permanentes
✅ **URLs públicas**: No necesitas proxy en Laravel para imágenes
✅ **Integración nativa**: Funciona perfectamente con Cloud Run
✅ **Optimizado**: Archivos temporales grandes no ocupan espacio en GCS
