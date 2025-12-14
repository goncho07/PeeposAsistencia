<?php

namespace App\Models;

use App\Traits\HasFullName;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Estudiante extends Model
{
    use HasFactory, HasFullName;

    protected $fillable = [
        'qr_code',
        'student_code',
        'name',
        'paternal_surname',
        'maternal_surname',
        'document_type',
        'document_number',
        'gender',
        'date_of_birth',
        'aula_id',
        'padre_id',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
    ];

    public function aula()
    {
        return $this->belongsTo(Aula::class);
    }

    public function padre()
    {
        return $this->belongsTo(Padre::class);
    }

    public function asistencias()
    {
        return $this->morphMany(Asistencia::class, 'attendable');
    }

    public function justificaciones()
    {
        return $this->morphMany(Justificacion::class, 'justifiable');
    }

    public function getEdadAttribute(): int
    {
        return $this->date_of_birth ? now()->diffInYears($this->date_of_birth) : 0;
    }
}
