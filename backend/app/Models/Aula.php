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
        $nivelFormateado = ucfirst(strtolower($this->nivel));
        $gradoOrdinal = $this->getGradoOrdinal();

        return "{$gradoOrdinal} {$nivelFormateado} - Sección {$this->seccion}";
    }

    public function getCodigoAttribute(): string
    {
        $nivelAbreviado = $this->getNivelAbreviado();
        return "{$nivelAbreviado}-{$this->grado}-{$this->seccion}";
    }

    private function getGradoOrdinal(): string
    {
        $ordinales = [
            1 => '1er',
            2 => '2do',
            3 => '3er',
            4 => '4to',
            5 => '5to',
            6 => '6to',
        ];

        return $ordinales[$this->grado] ?? "{$this->grado}°";
    }

    private function getNivelAbreviado(): string
    {
        $abreviaturas = [
            'INICIAL' => 'INIC',
            'PRIMARIA' => 'PRIM',
            'SECUNDARIA' => 'SEC',
        ];

        return $abreviaturas[$this->nivel] ?? 'N/A';
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

    public function getCantidadEstudiantesAttribute(): int
    {
        return $this->estudiantes()->count();
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

    public function getResumenAttribute(): array
    {
        return [
            'codigo' => $this->codigo,
            'nombre_completo' => $this->nombre_completo,
            'nivel' => $this->nivel,
            'grado' => $this->grado,
            'seccion' => $this->seccion,
            'docente' => $this->docente ? $this->docente->full_name : 'Sin asignar',
            'cantidad_estudiantes' => $this->cantidad_estudiantes,
        ];
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
