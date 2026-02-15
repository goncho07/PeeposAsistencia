# Año Academico y Bimestres

## Resumen

El sistema maneja el concepto de **Año Academico** como entidad central. Cada tenant tiene su propio año academico con 4 bimestres. Todo dato academico (estudiantes, incidencias, eventos del calendario, asignaciones docente-aula) esta vinculado a un año academico especifico mediante `academic_year_id`.

## Estructura de la Base de Datos

### Tabla `academic_years`

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `id` | bigint | PK |
| `tenant_id` | FK -> tenants | El tenant dueño |
| `year` | year | Ej: 2025 |
| `start_date` | date | Inicio del año (primer dia del bimestre 1) |
| `end_date` | date | Fin del año (ultimo dia del bimestre 4) |
| `status` | enum | `PLANIFICADO`, `ACTIVO`, `FINALIZADO` |
| `is_current` | boolean | Si es el año activo del tenant |

- Constraint: `unique(tenant_id, year)` - un tenant no puede tener dos años con el mismo numero.

### Tabla `bimesters`

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `id` | bigint | PK |
| `tenant_id` | FK -> tenants | El tenant dueño |
| `academic_year_id` | FK -> academic_years | El año al que pertenece |
| `number` | tinyint | 1, 2, 3 o 4 |
| `start_date` | date | Inicio del bimestre |
| `end_date` | date | Fin del bimestre |

- Constraint: `unique(academic_year_id, number)` - no puede haber dos bimestres con el mismo numero en un año.

### Relaciones con otras tablas

Las siguientes tablas tienen `academic_year_id` (FK nullable):

| Tabla | Proposito |
|-------|-----------|
| `tenants.current_academic_year_id` | Puntero al año activo del tenant |
| `students.academic_year_id` | Año en que el estudiante fue matriculado |
| `classroom_teacher.academic_year_id` | Año de la asignacion docente-aula |
| `incidents.academic_year_id` | Año en que ocurrio la incidencia |
| `calendar_events.academic_year_id` | Año al que pertenece el evento |

## Ciclo de Vida de un Año Academico

```
PLANIFICADO  -->  ACTIVO  -->  FINALIZADO
```

### 1. PLANIFICADO
- Estado inicial al crear un año nuevo.
- Permite configurar las fechas de los 4 bimestres antes de que inicie el año.
- No afecta la operacion diaria del sistema.

### 2. ACTIVO
- Solo **un** año puede estar activo por tenant a la vez.
- Al activar un año:
  - El año anterior se marca como `FINALIZADO` automaticamente.
  - El campo `tenants.current_academic_year_id` se actualiza.
- Todos los registros nuevos (estudiantes, incidencias, eventos) se vinculan a este año.

### 3. FINALIZADO
- El año ya cerro. Los datos historicos se conservan y pueden consultarse.

## Flujo: Transicion de Año (Ej: 2025 -> 2026)

### Paso 1: Crear el nuevo año (antes de que termine el actual)

```
POST /api/academic-years
{
  "year": 2026,
  "bimesters": [
    { "start_date": "2026-03-02", "end_date": "2026-05-08" },
    { "start_date": "2026-05-18", "end_date": "2026-07-24" },
    { "start_date": "2026-08-10", "end_date": "2026-10-09" },
    { "start_date": "2026-10-19", "end_date": "2026-12-18" }
  ]
}
```

Esto crea el año 2026 en estado `PLANIFICADO`. El sistema sigue operando con 2025.

### Paso 2: Activar el nuevo año (cuando inicie el periodo escolar)

```
POST /api/academic-years/{id}/activate
```

Esto:
- Cambia 2025 a `FINALIZADO`
- Cambia 2026 a `ACTIVO`
- Actualiza `tenants.current_academic_year_id`

A partir de este momento:
- Nuevos estudiantes se matriculan en 2026
- Nuevas incidencias se registran en 2026
- Nuevos eventos se crean en 2026

### Paso 3 (opcional): Finalizar manualmente

Si necesitas cerrar un año sin activar otro:

```
POST /api/academic-years/{id}/finalize
```

## API Endpoints

Todos bajo `/api/academic-years`, requieren autenticacion.

| Metodo | Ruta | Rol requerido | Descripcion |
|--------|------|---------------|-------------|
| GET | `/` | Cualquiera | Listar todos los años del tenant |
| GET | `/current` | Cualquiera | Obtener el año activo con bimestres |
| GET | `/{id}` | Cualquiera | Obtener un año especifico |
| POST | `/` | DIRECTOR | Crear nuevo año con 4 bimestres |
| PUT | `/{id}` | DIRECTOR | Actualizar fechas de bimestres |
| POST | `/{id}/activate` | DIRECTOR | Activar un año (cierra el anterior) |
| POST | `/{id}/finalize` | DIRECTOR | Finalizar un año manualmente |

### Ejemplo de respuesta de GET /current

```json
{
  "data": {
    "id": 1,
    "tenant_id": 1,
    "year": 2025,
    "start_date": "2025-03-03",
    "end_date": "2025-12-19",
    "status": "ACTIVO",
    "is_current": true,
    "bimesters": [
      { "id": 1, "number": 1, "start_date": "2025-03-03", "end_date": "2025-05-09" },
      { "id": 2, "number": 2, "start_date": "2025-05-19", "end_date": "2025-07-25" },
      { "id": 3, "number": 3, "start_date": "2025-08-11", "end_date": "2025-10-10" },
      { "id": 4, "number": 4, "start_date": "2025-10-20", "end_date": "2025-12-19" }
    ]
  }
}
```

## Servicio Central: AcademicYearService

Ubicacion: `app/Services/AcademicYearService.php`

Este servicio es el **unico punto de acceso** para obtener el año y bimestre actual. Ningun otro servicio deberia usar `now()->year` directamente.

### Metodos principales

| Metodo | Retorna | Uso |
|--------|---------|-----|
| `getCurrentYear(?tenantId)` | `AcademicYear` | Obtener el año activo del tenant |
| `getCurrentYearNumber(?tenantId)` | `int` | Obtener solo el numero (ej: 2025) |
| `getCurrentBimester(?date, ?tenantId)` | `Bimester\|null` | Bimestre actual segun fecha |
| `getBimesterByNumber(number, ?yearId, ?tenantId)` | `Bimester` | Bimestre especifico por numero |
| `getAcademicYearForDate(date, ?tenantId)` | `AcademicYear\|null` | Año al que pertenece una fecha |

### Quien lo usa

| Servicio | Para que |
|----------|----------|
| `StudentService` | Asignar `academic_year` y `academic_year_id` al crear estudiantes |
| `ImportService` | Lo mismo al importar estudiantes desde CSV/Excel |
| `IncidentService` | Asignar `academic_year_id` al crear incidencias |
| `CalendarEventService` | Asignar `academic_year_id` al crear eventos |
| `ReportService` | Obtener fechas de bimestres para reportes |
| `Teacher` (modelo) | Obtener horario semanal del año actual |
| `CalendarEventResource` | Determinar el año para eventos recurrentes |

## Bimestres y Settings

Los bimestres **ya no se guardan en la tabla `settings`**. Antes se usaban keys como `bimestre_1_inicio`, `bimestre_1_fin`, etc. Ahora toda esa informacion vive en la tabla `bimesters` y se accede a traves de `AcademicYearService`.

La tabla `settings` solo contiene:
- `general` - Dias de asistencia, tolerancia de tardanza, etc.
- `horarios` - Horarios de entrada/salida por nivel y turno.
- `whatsapp` - Configuracion de notificaciones WhatsApp.

## Seeders

| Seeder | Que hace |
|--------|----------|
| `AcademicYearSeeder` | Crea el año 2025 con sus 4 bimestres para cada tenant. Se ejecuta despues de `TenantSeeder`. |

Orden de ejecucion en `DatabaseSeeder`:
1. `TenantSeeder`
2. `AcademicYearSeeder`
3. `UserSeeder`
4. `ClassroomSeeder`
5. `CalendarEventSeeder`
6. `SettingSeeder`

## Notas importantes

- **Enero/Febrero**: En Peru el año escolar va de Marzo a Diciembre. En enero/febrero el sistema sigue apuntando al año anterior (o al nuevo si ya se activo). El sistema **no** usa `now()->year` para determinar el año, sino el campo `current_academic_year_id` del tenant.

- **Datos historicos**: Al cambiar de año, los datos del año anterior no se borran. Cada registro tiene su `academic_year_id` y puede consultarse filtrando por año.

- **Un tenant, un año activo**: Nunca puede haber dos años activos simultaneamente para el mismo tenant. Al activar uno, el anterior se finaliza automaticamente.
