<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Estudiante extends Model
{
    use HasFactory;

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

    public function getFullNameAttribute(): string
    {
        return "{$this->name} {$this->paternal_surname} {$this->maternal_surname}";
    }

    public function aula()
    {
        return $this->belongsTo(Aula::class);
    }

    public function padre()
    {
        return $this->belongsTo(Padre::class);
    }

    public function getEdadAttribute(): int
    {
        return $this->date_of_birth ? now()->diffInYears($this->date_of_birth) : 0;
    }
}
