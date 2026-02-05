<?php

namespace App\Constants;

class ValidationConstants
{
    public const DOCUMENT_TYPES = ['DNI', 'CE', 'PAS', 'CI', 'PTP'];
    public const DOCUMENT_TYPES_RULE = 'in:DNI,CE,PAS,CI,PTP';

    public const GENDERS = ['M', 'F'];
    public const GENDERS_RULE = 'in:M,F';

    public const LEVELS = ['INICIAL', 'PRIMARIA', 'SECUNDARIA'];
    public const LEVELS_RULE = 'in:INICIAL,PRIMARIA,SECUNDARIA';

    public const MAX_GRADES_PER_LEVEL = [
        'INICIAL' => 3,
        'PRIMARIA' => 6,
        'SECUNDARIA' => 5,
    ];

    public const SHIFTS = ['MAÑANA', 'TARDE', 'NOCHE'];
    public const SHIFTS_RULE = 'in:MAÑANA,TARDE,NOCHE';

    public const USER_ROLES = ['SUPERADMIN', 'DIRECTOR', 'SUBDIRECTOR', 'SECRETARIO', 'COORDINADOR', 'AUXILIAR', 'DOCENTE', 'ESCANER'];
    public const USER_ROLES_RULE = 'in:SUPERADMIN,DIRECTOR,SUBDIRECTOR,SECRETARIO,COORDINADOR,AUXILIAR,DOCENTE,ESCANER';

    public const USER_STATUSES = ['ACTIVO', 'INACTIVO', 'SUSPENDIDO'];
    public const USER_STATUSES_RULE = 'in:ACTIVO,INACTIVO,SUSPENDIDO';

    public const TEACHER_STATUSES = ['ACTIVO', 'INACTIVO', 'LICENCIA', 'CESADO'];
    public const TEACHER_STATUSES_RULE = 'in:ACTIVO,INACTIVO,LICENCIA,CESADO';

    public const CONTRACT_TYPES = ['NOMBRADO', 'CONTRATADO', 'CAS', 'PRACTICANTE'];
    public const CONTRACT_TYPES_RULE = 'in:NOMBRADO,CONTRATADO,CAS,PRACTICANTE';

    public const CLASSROOM_STATUSES = ['ACTIVO', 'INACTIVO', 'CERRADO'];
    public const CLASSROOM_STATUSES_RULE = 'in:ACTIVO,INACTIVO,CERRADO';

    public const RELATIONSHIP_TYPES = ['PADRE', 'MADRE', 'APODERADO'];
    public const RELATIONSHIP_TYPES_RULE = 'in:PADRE,MADRE,APODERADO';

    public const ENROLLMENT_STATUSES = ['MATRICULADO', 'RETIRADO', 'TRASLADADO', 'PENDIENTE'];
    public const ENROLLMENT_STATUSES_RULE = 'in:MATRICULADO,RETIRADO,TRASLADADO,PENDIENTE';

    public const ENTRY_STATUSES = ['COMPLETO', 'TARDANZA', 'FALTA', 'FALTA_JUSTIFICADA'];
    public const EXIT_STATUSES = ['COMPLETO', 'SALIDA_ANTICIPADA', 'SALIDA_ANTICIPADA_JUSTIFICADA', 'SIN_SALIDA'];

    public const DEVICE_TYPES = ['SCANNER', 'MANUAL', 'BIOMETRIC', 'IMPORTACION'];
    public const DEVICE_TYPES_RULE = 'in:SCANNER,MANUAL,BIOMETRIC,IMPORTACION';

    /**
     * Get the maximum grade for a given level.
     */
    public static function getMaxGrade(string $level): ?int
    {
        return self::MAX_GRADES_PER_LEVEL[$level] ?? null;
    }

    /**
     * Validate if a grade is valid for a given level.
     */
    public static function isValidGradeForLevel(string $level, int $grade): bool
    {
        $maxGrade = self::getMaxGrade($level);
        return $maxGrade !== null && $grade >= 1 && $grade <= $maxGrade;
    }
}
