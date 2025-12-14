<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Asistencia extends Model
{
    use HasFactory;

    protected $table = 'asistencias';

    protected $fillable = [
        'attendable_type',
        'attendable_id',
        'date',
        'entry_time',
        'exit_time',
        'entry_status',
        'exit_status',
        'entry_observation',
        'exit_observation',
        'whatsapp_sent',
        'whatsapp_sent_at',
    ];

    protected $casts = [
        'date' => 'date',
        'entry_time' => 'datetime:H:i',
        'exit_time' => 'datetime:H:i',
        'whatsapp_sent' => 'boolean',
        'whatsapp_sent_at' => 'datetime',
    ];

    public function attendable()
    {
        return $this->morphTo();
    }

    public function scopeForDate($query, Carbon $date)
    {
        return $query->whereDate('date', $date);
    }

    public function scopeForPeriod($query, Carbon $from, Carbon $to)
    {
        return $query->whereBetween('date', [$from, $to]);
    }

    public function scopeStudents($query)
    {
        return $query->where('attendable_type', Estudiante::class);
    }

    public function scopeTeachers($query)
    {
        return $query->where('attendable_type', Docente::class);
    }

    public function scopePresent($query)
    {
        return $query->whereIn('entry_status', ['ASISTIO', 'TARDANZA']);
    }

    public function scopeAbsent($query)
    {
        return $query->where('entry_status', 'FALTA');
    }

    public function scopeLate($query)
    {
        return $query->where('entry_status', 'TARDANZA');
    }
}
