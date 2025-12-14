<?php

namespace App\Repositories\Contracts;

use App\Models\Estudiante;
use Illuminate\Support\Collection;

interface EstudianteRepositoryInterface
{
    public function getAll(?string $search = null): Collection;
    public function findById(int $id): Estudiante;
    public function findByDni(string $dni): ?Estudiante;
    public function create(array $data): Estudiante;
    public function update(int $id, array $data): Estudiante;
    public function delete(int $id): bool;
}
