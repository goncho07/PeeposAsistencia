<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Aula extends Model
{
    use HasFactory;

    protected $fillable = [
        'docente_id',
        'nivel',
        'grado',
        'seccion',
    ];

    protected $casts = [
        'grado' => 'integer',
    ];

    public function docente()
    {
        return $this->belongsTo(Docente::class);
    }

    public function estudiantes()
    {
        return $this->hasMany(Estudiante::class);
    }

    public function getNombreCompletoAttribute(): string
    {
        if (strtoupper($this->nivel) === 'INICIAL') {
            return "{$this->seccion} - {$this->grado} AÑOS";
        }

        $nivelFormateado = ucfirst(strtolower($this->nivel));
        $gradoOrdinal = $this->getGradoOrdinal();

        return "{$gradoOrdinal} {$nivelFormateado} - Sección {$this->seccion}";
    }

    public function getCodigoAttribute(): string
    {
        return "{$this->grado}-{$this->seccion}";
    }

    private function getGradoOrdinal(): string
    {
        if (strtoupper($this->nivel) === 'INICIAL') {
            return "{$this->grado} años";
        }

        $ordinales = [
            1 => '1ro',
            2 => '2do',
            3 => '3er',
            4 => '4to',
            5 => '5to',
            6 => '6to',
        ];

        return $ordinales[$this->grado] ?? "{$this->grado}°";
    }

    public function scopeNivel($query, string $nivel)
    {
        return $query->where('nivel', strtoupper($nivel));
    }

    public function scopeGrado($query, int $grado)
    {
        return $query->where('grado', $grado);
    }

    public function scopeOrdenado($query)
    {
        return $query->orderByRaw("
            CASE nivel
                WHEN 'INICIAL' THEN 1
                WHEN 'PRIMARIA' THEN 2
                WHEN 'SECUNDARIA' THEN 3
            END
        ")->orderBy('grado')->orderBy('seccion');
    }

    public function estaCompleta(int $capacidadMaxima = 35): bool
    {
        return $this->cantidad_estudiantes >= $capacidadMaxima;
    }

    public function getEstudiantesOrdenados()
    {
        return $this->estudiantes()
            ->orderBy('paternal_surname')
            ->orderBy('maternal_surname')
            ->orderBy('name')
            ->get();
    }

    protected static function boot()
    {
        parent::boot();

        static::deleting(function ($aula) {
            if ($aula->estudiantes()->count() > 0) {
                throw new \Exception(
                    "No se puede eliminar el aula '{$aula->nombre_completo}' porque tiene {$aula->cantidad_estudiantes} estudiante(s) matriculado(s)."
                );
            }
        });
    }
}
