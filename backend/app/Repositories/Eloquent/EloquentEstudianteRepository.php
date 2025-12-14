<?php

namespace App\Repositories\Eloquent;

use App\Models\Estudiante;
use App\Traits\HasSearchableFields;
use App\Repositories\Contracts\EstudianteRepositoryInterface;
use Illuminate\Support\Collection;

class EloquentEstudianteRepository implements EstudianteRepositoryInterface
{
    use HasSearchableFields;

    public function getAll(?string $search = null): Collection
    {
        return Estudiante::with('aula.docente')
            ->select([
                'id', 'student_code', 'name', 'paternal_surname', 'maternal_surname',
                'document_type', 'document_number', 'gender', 'date_of_birth', 'qr_code', 'aula_id'
            ])
            ->with([
                'aula' => function ($query) {
                    $query->select(['id', 'nivel', 'grado', 'seccion', 'docente_id'])
                        ->withCount('estudiantes');
                },
                'aula.docente' => function ($query) {
                    $query->select(['id', 'name', 'paternal_surname', 'maternal_surname']);
                }
            ])
            ->when($search, fn($q) => $this->applySearchFilter($q, $search, [
                'name', 'paternal_surname', 'maternal_surname', 'document_number', 'student_code'
            ]))
            ->orderBy('name')
            ->get();
    }

    public function findById(int $id): Estudiante
    {
        return Estudiante::with([
            'aula' => function ($query) {
                $query->withCount('estudiantes');
            },
            'aula.docente',
            'padre'
        ])->findOrFail($id);
    }

    public function findByDni(string $dni): ?Estudiante
    {
        return Estudiante::where('document_number', $dni)->first();
    }

    public function create(array $data): Estudiante
    {
        return Estudiante::create($data);
    }

    public function update(int $id, array $data): Estudiante
    {
        $estudiante = Estudiante::findOrFail($id);
        $estudiante->update($data);
        return $estudiante->fresh();
    }

    public function delete(int $id): bool
    {
        $estudiante = Estudiante::findOrFail($id);
        return (bool) $estudiante->delete();
    }

    private function applySearchFilter($query, string $search, array $fields)
    {
        $query->where(function ($q) use ($search, $fields) {
            foreach ($fields as $field) {
                $q->orWhere($field, 'like', "%{$search}%");
            }
        });
    }
}
