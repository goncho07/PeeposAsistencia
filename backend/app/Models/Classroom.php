<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Classroom extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'teacher_id',
        'level',
        'grade',
        'section',
        'shift',
        'status',
    ];

    protected $casts = [
        'grade' => 'integer',
    ];

    protected $appends = [
        'full_name',
    ];

    public function teacher()
    {
        return $this->belongsTo(Teacher::class);
    }

    public function students()
    {
        return $this->hasMany(Student::class);
    }

    public function incidents()
    {
        return $this->hasMany(Incident::class);
    }

    public function getFullNameAttribute()
    {
        $gradeName = $this->getGradeName();
        return "{$gradeName} '{$this->section}'";
    }

    public function getGradeName()
    {
        if ($this->level === 'INICIAL') {
            return "{$this->grade} años";
        }

        $gradeNames = [
            'PRIMARIA' => ['1er grado', '2do grado', '3er grado', '4to grado', '5to grado', '6to grado'],
            'SECUNDARIA' => ['1er grado', '2do grado', '3er grado', '4to grado', '5to grado'],
        ];

        $names = $gradeNames[$this->level] ?? [];
        return $names[$this->grade - 1] ?? "{$this->grade}° grado";
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'ACTIVO');
    }

    public function scopeByLevel($query, $level)
    {
        return $query->where('level', $level);
    }

    public function scopeByShift($query, $shift)
    {
        return $query->where('shift', $shift);
    }

    public function scopeCurrentYear($query)
    {
        return $query->where('academic_year', now()->year);
    }
}
