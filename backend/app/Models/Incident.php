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
        'classroom_id',
        'student_id',
        'reported_by',
        'date',
        'time',
        'type',
        'severity',
        'description',
        'status',
        'resolution_notes',
        'resolved_by',
        'resolved_at',
    ];

    protected $casts = [
        'date' => 'date',
        'time' => 'datetime:H:i',
        'resolved_at' => 'datetime',
    ];

    public const TYPES = [
        'USO_CELULAR' => 'Uso de celular en clase',
        'INTERRUPCION' => 'Interrupción/bulla en clase',
        'FALTA_RESPETO' => 'Falta de respeto',
        'INCUMPLIMIENTO_TAREA' => 'No presentó tarea/material',
        'UNIFORME_INCOMPLETO' => 'Uniforme incompleto',
        'LLEGADA_TARDE' => 'Llegada tarde a clase',
        'DETERIORO_MATERIAL' => 'Deterioro de material/mobiliario',
        'PELEA' => 'Pelea o agresión física',
        'ACOSO' => 'Acoso o bullying',
        'SALIDA_NO_AUTORIZADA' => 'Salida del aula sin permiso',
        'OTRO' => 'Otro',
    ];

    public const SEVERITIES = [
        'LEVE' => 'Leve',
        'MODERADA' => 'Moderada',
        'GRAVE' => 'Grave',
    ];

    public const STATUSES = [
        'REGISTRADA' => 'Registrada',
        'EN_SEGUIMIENTO' => 'En seguimiento',
        'RESUELTA' => 'Resuelta',
    ];

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

    public function getStatusLabelAttribute()
    {
        return self::STATUSES[$this->status] ?? $this->status;
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

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
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

    public function scopePending($query)
    {
        return $query->whereIn('status', ['REGISTRADA', 'EN_SEGUIMIENTO']);
    }

    public function scopeResolved($query)
    {
        return $query->where('status', 'RESUELTA');
    }
}
