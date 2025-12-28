<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Teacher extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'dni',
        'qr_code',
        'photo_url',
        'name',
        'paternal_surname',
        'maternal_surname',
        'birth_date',
        'gender',
        'level',
        'specialty',
        'area',
        'email',
        'phone_number',
        'status',
    ];

    protected $casts = [
        'birth_date' => 'date',
    ];

    protected $appends = [
        'full_name',
    ];

    public function classrooms()
    {
        return $this->hasMany(Classroom::class);
    }

    public function attendances()
    {
        return $this->morphMany(Attendance::class, 'attendable');
    }

    public function justifications()
    {
        return $this->morphMany(Justification::class, 'justifiable');
    }

    public function getFullNameAttribute()
    {
        return "{$this->name} {$this->paternal_surname} {$this->maternal_surname}";
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'ACTIVO');
    }

    public function scopeByLevel($query, $level)
    {
        return $query->where('level', $level);
    }
}
