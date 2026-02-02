<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Student extends Model
{
    use HasFactory, BelongsToTenant, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'qr_code',
        'student_code',
        'document_type',
        'document_number',
        'name',
        'paternal_surname',
        'maternal_surname',
        'gender',
        'birth_date',
        'nationality',
        'photo_url',
        'classroom_id',
        'academic_year',
        'enrollment_status',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'academic_year' => 'integer',
    ];

    protected $appends = [
        'full_name',
        'age',
    ];

    public function classroom()
    {
        return $this->belongsTo(Classroom::class);
    }

    public function parents()
    {
        return $this->belongsToMany(
            ParentGuardian::class,
            'student_parent',
            'student_id',
            'parent_id'
        )->withPivot([
            'tenant_id',
            'relationship_type',
            'custom_relationship_label',
            'is_primary_contact',
            'receives_notifications'
        ])->withTimestamps();
    }

    public function primaryContact()
    {
        return $this->parents()->wherePivot('is_primary_contact', true)->first();
    }

    public function attendances()
    {
        return $this->morphMany(Attendance::class, 'attendable');
    }

    public function justifications()
    {
        return $this->morphMany(Justification::class, 'justifiable');
    }

    public function incidents()
    {
        return $this->hasMany(Incident::class);
    }

    public function faceEmbedding()
    {
        return $this->morphOne(FaceEmbedding::class, 'embeddable');
    }

    public function hasFaceEnrolled(): bool
    {
        return $this->faceEmbedding()->where('status', FaceEmbedding::STATUS_ACTIVE)->exists();
    }

    public function getFullNameAttribute()
    {
        return "{$this->name} {$this->paternal_surname} {$this->maternal_surname}";
    }

    public function getAgeAttribute()
    {
        return $this->birth_date ? $this->birth_date->age : null;
    }

    public function scopeEnrolled($query)
    {
        return $query->where('enrollment_status', 'MATRICULADO');
    }

    public function scopeByClassroom($query, $classroomId)
    {
        return $query->where('classroom_id', $classroomId);
    }

    public function scopeByLevel($query, $level)
    {
        return $query->whereHas('classroom', function ($q) use ($level) {
            $q->where('level', $level);
        });
    }

    public function scopeByAcademicYear($query, $year = null)
    {
        return $query->where('academic_year', $year ?? now()->year);
    }
}
