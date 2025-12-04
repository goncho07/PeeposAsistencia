<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


class Docente extends Model
{
    use HasFactory;

    protected $fillable = [
        'dni',
        'name',
        'area',
        'paternal_surname',
        'maternal_surname',
        'email',
        'phone_number',
    ];

    public function getFullNameAttribute(): string
    {
        return "{$this->name} {$this->paternal_surname} {$this->maternal_surname}";
    }

    public function aulas()
    {
        return $this->hasMany(Aula::class);
    }

    public function esTutor(): bool
    {
        return $this->aulas()->exists();
    }

    public function getAulasTutorizadasAttribute()
    {
        return $this->aulas()->with('estudiantes')->get();
    }
}
