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
        'tutor_id',
        'level',
        'grade',
        'section',
        'shift',
        'capacity',
        'status',
    ];

    protected $casts = [
        'grade' => 'integer',
        'capacity' => 'integer',
    ];

    protected $appends = [
        'full_name',
    ];

    public function tutor()
    {
        return $this->belongsTo(Teacher::class, 'tutor_id');
    }

    public function teachers()
    {
        return $this->belongsToMany(
            Teacher::class, 
            'classroom_teacher'
        )->withPivot([
            'subject', 
            'academic_year', 
            'schedule'
        ])->withTimestamps();
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

    public function scopeByTeacher($query, $teacherId)
    {
        return $query->whereHas('teachers', fn($q) => $q->where('teachers.id', $teacherId));
    }

    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('section', 'like', "%{$search}%")
                ->orWhereHas('tutor.user', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('paternal_surname', 'like', "%{$search}%")
                        ->orWhere('maternal_surname', 'like', "%{$search}%");
                });
        });
    }

    public function getStudentCount()
    {
        return $this->students()->enrolled()->count();
    }

    public function hasCapacity()
    {
        if (!$this->capacity) {
            return true;
        }
        return $this->getStudentCount() < $this->capacity;
    }
}
