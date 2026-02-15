<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Incident extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'academic_year_id',
        'classroom_id',
        'student_id',
        'reported_by',
        'date',
        'time',
        'type',
        'severity',
        'description',
        'resolved_by',
        'resolved_at',
    ];

    protected $casts = [
        'date' => 'date',
        'time' => 'datetime:H:i',
        'resolved_at' => 'datetime',
    ];

    public const TYPES = [
        'USO_JOYAS' => 'Uso de joyas',
        'UÑAS_PINTADAS' => 'Uñas pintadas',
        'CABELLO_SUELTO' => 'Cabello suelto',
        'FALTA_ASEO_PERSONAL' => 'Falta de aseo personal',
        'UNIFORME_INCOMPLETO' => 'Uniforme incompleto',
        'NO_TRAJO_UTILes' => 'No trajo útiles',
        'INCUMPLIMIENTO_TAREAS' => 'Incumplimiento de tareas',
        'INDISCIPLINA_FORMACION' => 'Indisciplina en formación',
        'INDISCIPLINA_AULA' => 'Indisciplina en aula',
        'FALTA_RESPETO_SIMBOLOS_PATRIOS' => 'Falta de respeto a símbolos patrios',
        'FALTA_RESPETO_DOCENTE' => 'Falta de respeto al docente',
        'AGRESION_VERBAL' => 'Agresión verbal',
        'USO_CELULAR' => 'Uso de celular',
        'DAÑO_INFRAESTRUCTURA' => 'Daño a infraestructura',
        'ESCANDALO_AULA' => 'Escándalo en aula',
        'SALIDA_NO_AUTORIZADA' => 'Salida no autorizada',
        'AGRESION_FISICA' => 'Agresión física',
        'ACOSO_ESCOLAR' => 'Acoso escolar',
        'CONSUMO_DROGAS' => 'Consumo de drogas',
        'PORTE_ARMAS' => 'Porte de armas',
    ];

    public const SEVERITIES = [
        'LEVE' => 'Leve',
        'MODERADA' => 'Moderada',
        'GRAVE' => 'Grave',
    ];

    /**
     * Map each incident type to its automatic severity.
     */
    public const TYPE_SEVERITY_MAP = [
        // Leves
        'USO_JOYAS' => 'LEVE',
        'UÑAS_PINTADAS' => 'LEVE',
        'CABELLO_SUELTO' => 'LEVE',
        'FALTA_ASEO_PERSONAL' => 'LEVE',
        'UNIFORME_INCOMPLETO' => 'LEVE',
        'NO_TRAJO_UTILes' => 'LEVE',
        'INCUMPLIMIENTO_TAREAS' => 'LEVE',
        // Moderadas
        'INDISCIPLINA_FORMACION' => 'MODERADA',
        'INDISCIPLINA_AULA' => 'MODERADA',
        'FALTA_RESPETO_SIMBOLOS_PATRIOS' => 'MODERADA',
        'FALTA_RESPETO_DOCENTE' => 'MODERADA',
        'AGRESION_VERBAL' => 'MODERADA',
        'USO_CELULAR' => 'MODERADA',
        'DAÑO_INFRAESTRUCTURA' => 'MODERADA',
        'ESCANDALO_AULA' => 'MODERADA',
        // Graves
        'SALIDA_NO_AUTORIZADA' => 'GRAVE',
        'AGRESION_FISICA' => 'GRAVE',
        'ACOSO_ESCOLAR' => 'GRAVE',
        'CONSUMO_DROGAS' => 'GRAVE',
        'PORTE_ARMAS' => 'GRAVE',
    ];

    /**
     * Get the severity for a given incident type.
     */
    public static function getSeverityForType(string $type): string
    {
        return self::TYPE_SEVERITY_MAP[$type] ?? 'LEVE';
    }

    public function academicYear()
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function classroom()
    {
        return $this->belongsTo(Classroom::class);
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function reporter()
    {
        return $this->belongsTo(User::class, 'reported_by');
    }

    public function resolver()
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }

    public function getTypeLabelAttribute()
    {
        return self::TYPES[$this->type] ?? $this->type;
    }

    public function getSeverityLabelAttribute()
    {
        return self::SEVERITIES[$this->severity] ?? $this->severity;
    }

    public function scopeByAcademicYear($query, int $academicYearId)
    {
        return $query->where('academic_year_id', $academicYearId);
    }

    public function scopeByClassroom($query, $classroomId)
    {
        return $query->where('classroom_id', $classroomId);
    }

    public function scopeByStudent($query, $studentId)
    {
        return $query->where('student_id', $studentId);
    }

    public function scopeBySeverity($query, $severity)
    {
        return $query->where('severity', $severity);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeForDate($query, $date)
    {
        return $query->whereDate('date', $date);
    }

    public function scopeBetweenDates($query, $from, $to)
    {
        return $query->whereBetween('date', [$from, $to]);
    }
}
