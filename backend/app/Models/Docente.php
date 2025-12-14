<?php

namespace App\Models;

use App\Traits\HasFullName;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Docente extends Model
{
    use HasFactory, HasFullName;

    protected $fillable = [
        'dni',
        'qr_code',
        'name',
        'area',
        'nivel',
        'paternal_surname',
        'maternal_surname',
        'email',
        'phone_number',
    ];

    public function aulas()
    {
        return $this->hasMany(Aula::class);
    }

    public function asistencias()
    {
        return $this->morphMany(Asistencia::class, 'attendable');
    }

    public function justificaciones()
    {
        return $this->morphMany(Justificacion::class, 'justifiable');
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
