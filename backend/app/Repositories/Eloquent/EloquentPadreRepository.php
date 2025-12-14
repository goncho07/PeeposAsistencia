<?php

namespace App\Repositories\Eloquent;

use App\Models\Padre;
use App\Traits\HasSearchableFields;
use App\Repositories\Contracts\PadreRepositoryInterface;
use Illuminate\Support\Collection;

class EloquentPadreRepository implements PadreRepositoryInterface
{
    use HasSearchableFields;

    public function getAll(?string $search = null): Collection
    {
        return Padre::with('estudiantes.aula')
            ->select([
                'id', 'name', 'paternal_surname', 'maternal_surname',
                'document_type', 'document_number', 'email', 'phone_number', 'relationship_type'
            ])
            ->with([
                'estudiantes' => function ($query) {
                    $query->select(['id', 'name', 'paternal_surname', 'maternal_surname', 'student_code', 'aula_id', 'padre_id']);
                },
                'estudiantes.aula' => function ($query) {
                    $query->select(['id', 'nivel', 'grado', 'seccion']);
                }
            ])
            ->when($search, fn($q) => $this->applySearchFilter($q, $search, [
                'name', 'paternal_surname', 'maternal_surname', 'document_number', 'email'
            ]))
            ->orderBy('name')
            ->get();
    }

    public function findById(int $id): Padre
    {
        return Padre::with(['estudiantes.aula'])->findOrFail($id);
    }

    public function create(array $data): Padre
    {
        return Padre::create($data);
    }

    public function update(int $id, array $data): Padre
    {
        $padre = Padre::findOrFail($id);
        $padre->update($data);
        return $padre->fresh();
    }

    public function delete(int $id): bool
    {
        $padre = Padre::findOrFail($id);
        return (bool) $padre->delete();
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
