<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'attendable_type',
        'attendable_id',
        'date',
        'shift',
        'entry_time',
        'entry_status',
        'exit_time',
        'exit_status',
        'recorded_by',
        'device_type',
        'whatsapp_sent',
    ];

    protected $casts = [
        'date' => 'date',
        'whatsapp_sent' => 'boolean',
    ];

    public function attendable()
    {
        return $this->morphTo();
    }

    public function recorder()
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }

    public function scopeForDate($query, $date)
    {
        return $query->whereDate('date', $date);
    }

    public function scopeToday($query)
    {
        return $query->whereDate('date', today());
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('entry_status', $status);
    }

    public function scopeStudents($query)
    {
        return $query->where('attendable_type', Student::class);
    }

    public function scopeTeachers($query)
    {
        return $query->where('attendable_type', Teacher::class);
    }

    public function scopeUsers($query)
    {
        return $query->where('attendable_type', User::class);
    }

    public function scopeByShift($query, $shift)
    {
        return $query->where('shift', $shift);
    }

    public function scopeByDeviceType($query, $deviceType)
    {
        return $query->where('device_type', $deviceType);
    }

    public function isLate()
    {
        return $this->entry_status === 'TARDANZA';
    }

    public function isAbsent()
    {
        return in_array($this->entry_status, ['FALTA', 'FALTA_JUSTIFICADA']);
    }

    public function isPresent()
    {
        return $this->entry_status === 'COMPLETO';
    }

    public function hasEarlyExit()
    {
        return in_array($this->exit_status, ['SALIDA_ANTICIPADA', 'SALIDA_ANTICIPADA_JUSTIFICADA']);
    }

    public function hasExited()
    {
        return $this->exit_status !== 'SIN_SALIDA';
    }
}

