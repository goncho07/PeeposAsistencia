<?php

namespace App\Repositories\Contracts;

use App\Models\Docente;
use Illuminate\Support\Collection;

interface DocenteRepositoryInterface
{
    public function getAll(?string $search = null): Collection;
    public function findById(int $id): Docente;
    public function create(array $data): Docente;
    public function update(int $id, array $data): Docente;
    public function delete(int $id): bool;
}
