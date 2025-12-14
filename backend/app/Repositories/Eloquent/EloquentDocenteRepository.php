<?php

namespace App\Repositories\Eloquent;

use App\Models\Docente;
use App\Traits\HasSearchableFields;
use App\Repositories\Contracts\DocenteRepositoryInterface;
use Illuminate\Support\Collection;

class EloquentDocenteRepository implements DocenteRepositoryInterface
{
    use HasSearchableFields;

    public function getAll(?string $search = null): Collection
    {
        return Docente::query()
            ->select([
                'id', 'dni', 'name', 'paternal_surname', 'maternal_surname',
                'email', 'phone_number', 'area', 'nivel'
            ])
            ->with([
                'aulas' => function ($query) {
                    $query->select(['id', 'nivel', 'grado', 'seccion', 'docente_id']);
                }
            ])
            ->when(
                $search,
                fn($query) =>
                $this->applySearchFilter($query, $search, [
                    'name',
                    'paternal_surname',
                    'maternal_surname',
                    'dni',
                    'email'
                ])
            )
            ->orderBy('name')
            ->get();
    }

    public function findById(int $id): Docente
    {
        return Docente::with('aulas')->findOrFail($id);
    }

    public function create(array $data): Docente
    {
        return Docente::create($data);
    }

    public function update(int $id, array $data): Docente
    {
        $docente = Docente::findOrFail($id);
        $docente->update($data);
        return $docente->fresh();
    }

    public function delete(int $id): bool
    {
        $docente = Docente::findOrFail($id);
        return (bool) $docente->delete();
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
